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

device = torch.device("cpu")

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

model = ResNet18Classifier().to(device)
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

batch_size = 64
all_probs = []

print("Auditing pool samples to mine glacier/mountain/sea boundary anchors...")
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
        p1 = F.softmax(model(b1), dim=1)
        p2 = F.softmax(model(b2), dim=1)
        probs = (p1 + p2) / 2.0
        all_probs.append(probs)

all_probs = torch.cat(all_probs, dim=0)

# Class quotas targeting the exact bottlenecks:
# Buildings (0): 360, Forest (1): 320, Glacier (2): 440, Mountain (3): 440, Sea (4): 440, Street (5): 360
# Total pool: 2,360 + 600 seed = 2,960 (maximized budget, strictly < 3,000!)
quotas = {0: 360, 1: 320, 2: 440, 3: 440, 4: 440, 5: 360}

# For Glacier (2), Mountain (3), Sea (4): Filter out samples where (P(glacier) + P(mountain) + P(sea)) has ambiguity
# Score = P(class) * (P(class) - P(second_highest))
curated_pool_labels = {}
confs, preds = torch.max(all_probs, dim=1)

# Sort each predicted class by highest margin
for c in range(6):
    c_indices = (preds == c).nonzero(as_tuple=True)[0]
    c_probs = all_probs[c_indices]
    
    # Margin over second best
    sorted_probs, _ = torch.sort(c_probs, descending=True, dim=1)
    margins = sorted_probs[:, 0] - sorted_probs[:, 1]
    
    sorted_order = torch.argsort(margins, descending=True)
    selected_subindices = sorted_order[:quotas[c]]
    
    actual_pool_positions = c_indices[selected_subindices].tolist()
    for pos in actual_pool_positions:
        table_idx = pool_indices[pos]
        curated_pool_labels[table_idx] = c
    print(f"  Class {c} ({CLASSES[c]}): Assigned {len(actual_pool_positions)} samples (Target: {quotas[c]})")

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
    description="Boundary Margin Curation 2960 Dataset",
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
print(f"[SUCCESS] Committed Precision Margin Table: {new_table.url}")
print(f"Total active weight=1 rows: {active_count} / {MAX_WEIGHT1_ROWS} budget")
print("=" * 60)
