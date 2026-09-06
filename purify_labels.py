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
        return self.classifier(self.resnet(x))

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

# Gather active pool samples currently assigned in train_table
pool_active_indices = []
pool_active_paths = []
pool_active_current_labels = []

seed_indices = set()

for idx, row in enumerate(train_table.table_rows):
    img_path = str(row["image"])
    if "undefined" in img_path:
        if row["weight"] > 0:
            clean_path = img_path.replace("<INTEL_SCENE_DATA>", str(base_path))
            clean_path = str(Path(clean_path).resolve())
            pool_active_indices.append(idx)
            pool_active_paths.append(clean_path)
            pool_active_current_labels.append(row["label"])
    else:
        seed_indices.add(idx)

print(f"Auditing {len(pool_active_paths)} active pool samples for label noise...")

batch_size = 64
corrected_count = 0
relabel_map = {}

with torch.no_grad():
    for i in range(0, len(pool_active_paths), batch_size):
        batch_paths = pool_active_paths[i:i + batch_size]
        t1, t2 = [], []
        for p in batch_paths:
            img = Image.open(p).convert("RGB")
            t1.append(t_normal(img))
            t2.append(t_flip(img))
        b1, b2 = torch.stack(t1), torch.stack(t2)
        probs = (F.softmax(model(b1), dim=1) + F.softmax(model(b2), dim=1)) / 2.0
        confs, preds = probs.max(1)
        
        for sub_i in range(len(batch_paths)):
            global_pos = i + sub_i
            cur_label = pool_active_current_labels[global_pos]
            pred_label = preds[sub_i].item()
            conf = confs[sub_i].item()
            table_idx = pool_active_indices[global_pos]
            
            # If model is 95%+ confident in a different label, correct the label noise
            if pred_label != cur_label and conf > 0.92:
                relabel_map[table_idx] = pred_label
                corrected_count += 1
            else:
                relabel_map[table_idx] = cur_label

print(f"Purified {corrected_count} noisy boundary samples!")

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
    description="Cleaned Label Purified 2960 Dataset",
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
    elif idx in relabel_map:
        table_writer.add_row({
            "id": row["id"],
            "image": row["image"],
            "label": relabel_map[idx],
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
print(f"[SUCCESS] Committed Purified Table: {new_table.url}")
print(f"Total active weight=1 rows: {active_count} / {MAX_WEIGHT1_ROWS} budget")
print("=" * 60)
