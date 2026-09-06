import os
import sys
from pathlib import Path
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import torchvision.transforms as transforms
import torchvision.models as models
import tlc
from tqdm import tqdm
import numpy as np

PROJECT_NAME = "Intel-Scene"
DATASET_NAME = "intel-scene"
NUM_CLASSES = 6
CLASSES = ["buildings", "forest", "glacier", "mountain", "sea", "street", "undefined"]
MAX_WEIGHT1_ROWS = 3000

base_path = Path(".").resolve()
tlc.register_project_url_alias(
    token="INTEL_SCENE_DATA",
    path=str(base_path),
    project=PROJECT_NAME,
)

train_table = tlc.Table.from_names(
    project_name=PROJECT_NAME,
    dataset_name=DATASET_NAME,
    table_name="train",
).latest()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class ResNet18Classifier(nn.Module):
    def __init__(self, num_classes=6):
        super(ResNet18Classifier, self).__init__()
        self.resnet = models.resnet18(weights=None)
        resnet_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Identity()
        self.classifier = nn.Sequential(
            nn.Linear(resnet_features, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes),
        )

    def forward(self, x):
        features = self.resnet(x)
        return self.classifier(features)

model = ResNet18Classifier(num_classes=NUM_CLASSES).to(device)
model.load_state_dict(torch.load("best_model.pth", map_location=device))
model.eval()

t_normal = transforms.Compose([
    transforms.Resize(150),
    transforms.CenterCrop(150),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

t_flip = transforms.Compose([
    transforms.Resize(150),
    transforms.CenterCrop(150),
    transforms.RandomHorizontalFlip(p=1.0),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

seed_indices = set()
pool_indices = []
pool_image_paths = []

for idx, row in enumerate(train_table.table_rows):
    img_path = str(row["image"])
    if "undefined" in img_path:
        clean_path = img_path.replace("<INTEL_SCENE_DATA>", str(base_path))
        clean_path = str(Path(clean_path).resolve())
        pool_indices.append(idx)
        pool_image_paths.append(clean_path)
    else:
        seed_indices.add(idx)

print(f"Scoring {len(pool_image_paths)} pool images with dual-view TTA...")
batch_size = 64
predictions = []
confidences = []

with torch.no_grad():
    for i in tqdm(range(0, len(pool_image_paths), batch_size)):
        batch_paths = pool_image_paths[i:i + batch_size]
        t1, t2 = [], []
        for p in batch_paths:
            img = Image.open(p).convert("RGB")
            t1.append(t_normal(img))
            t2.append(t_flip(img))
        b1 = torch.stack(t1).to(device)
        b2 = torch.stack(t2).to(device)
        probs1 = F.softmax(model(b1), dim=1)
        probs2 = F.softmax(model(b2), dim=1)
        probs = (probs1 + probs2) / 2.0
        confs, preds = torch.max(probs, dim=1)
        predictions.extend(preds.cpu().tolist())
        confidences.extend(confs.cpu().tolist())

# Select exactly 380 highest-consensus samples per class (2280 pool + 600 seed = 2880)
per_class_quota = 380
class_sample_map = {c: [] for c in range(6)}
for pos, (pred_cls, conf) in enumerate(zip(predictions, confidences)):
    table_idx = pool_indices[pos]
    class_sample_map[pred_cls].append((conf, table_idx))

curated_pool_labels = {}
for c in range(6):
    sorted_samples = sorted(class_sample_map[c], key=lambda x: x[0], reverse=True)
    selected = sorted_samples[:per_class_quota]
    avg_conf = np.mean([s[0] for s in selected]) if selected else 0
    print(f"  Class {c} ({CLASSES[c]}): {len(selected)} samples (Consensus confidence: {avg_conf*100:.2f}%)")
    for conf, table_idx in selected:
        curated_pool_labels[table_idx] = c

schemas = {
    "id": tlc.Schema(value=tlc.Int32Value(), writable=False),
    "image": tlc.ImagePath,
    "label": tlc.CategoricalLabel("label", classes=CLASSES),
    "weight": tlc.SampleWeightSchema(),
}

table_writer = tlc.TableWriter(
    table_name="train",
    dataset_name=DATASET_NAME,
    project_name=PROJECT_NAME,
    description="Dual-View TTA High-Consensus 2880 Dataset",
    column_schemas=schemas,
    if_exists="overwrite",
)

active_count = 0
for idx, row in enumerate(train_table.table_rows):
    if idx in seed_indices:
        img_p = str(row["image"])
        for c_idx, c_name in enumerate(CLASSES[:6]):
            if f"/{c_name}/" in img_p.replace("\\", "/"):
                correct_label = c_idx
                break
        else:
            correct_label = row["label"]
        table_writer.add_row({
            "id": row["id"],
            "image": row["image"],
            "label": correct_label,
            "weight": 1.0,
        })
        active_count += 1
    elif idx in curated_pool_labels:
        table_writer.add_row({
            "id": row["id"],
            "image": row["image"],
            "label": curated_pool_labels[idx],
            "weight": 1.0,
        })
        active_count += 1
    else:
        table_writer.add_row({
            "id": row["id"],
            "image": row["image"],
            "label": 6,
            "weight": 0.0,
        })

new_table = table_writer.finalize()
print("\n" + "=" * 60)
print(f"[SUCCESS] Committed High-Consensus Table: {new_table.url}")
print(f"Total active weight=1 rows: {active_count} / {MAX_WEIGHT1_ROWS} budget")
print("=" * 60)
