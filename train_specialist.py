"""
Hard-Class Specialist Model (Mixture of Experts)
Trains a high-resolution specialist focusing exclusively on separating:
Class 2 (Glacier), Class 3 (Mountain), and Class 4 (Sea)
with focal loss and high weight decay.
"""

import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from pathlib import Path
from tqdm import tqdm
import tlc

BATCH_SIZE = 32
EPOCHS = 15
LEARNING_RATE = 0.0005
PROJECT_NAME = "Intel-Scene"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Specialist training on: {device}")

# Focus transforms: zoom into textures
specialist_train_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomResizedCrop(224, scale=(0.7, 1.0)),
    transforms.RandomHorizontalFlip(p=0.5),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

specialist_val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def train_fn(sample):
    image = Image.open(sample["image"])
    if image.mode != "RGB":
        image = image.convert("RGB")
    return specialist_train_transform(image), sample["label"]


def val_fn(sample):
    image = Image.open(sample["image"])
    if image.mode != "RGB":
        image = image.convert("RGB")
    return specialist_val_transform(image), sample["label"]


def worker_init_fn(worker_id):
    import logging
    logging.getLogger("tlc").setLevel(logging.ERROR)
    import tlc as _tlc
    from pathlib import Path as _Path
    _tlc.register_project_url_alias(
        token="INTEL_SCENE_DATA",
        path=str(_Path(__file__).parent.absolute()),
        project="Intel-Scene",
    )


class ResNet18Specialist(nn.Module):
    def __init__(self, num_classes=6):
        super(ResNet18Specialist, self).__init__()
        self.resnet = models.resnet18(weights=None)
        resnet_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Identity()
        self.classifier = nn.Sequential(
            nn.BatchNorm1d(resnet_features),
            nn.Linear(resnet_features, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        return self.classifier(self.resnet(x))


def train_specialist():
    base_path = Path(__file__).parent
    tlc.register_project_url_alias(token="INTEL_SCENE_DATA", path=str(base_path.absolute()), project=PROJECT_NAME)
    
    train_table = tlc.Table.from_names(table_name="train", dataset_name="intel-scene", project_name=PROJECT_NAME).latest()
    val_table = tlc.Table.from_names(table_name="val", dataset_name="intel-scene", project_name=PROJECT_NAME).latest()
    
    train_table.map(train_fn)
    val_table.map(val_fn)
    
    train_sampler = train_table.create_sampler(exclude_zero_weights=True)
    train_loader = DataLoader(train_table, batch_size=BATCH_SIZE, sampler=train_sampler, num_workers=2, pin_memory=True, worker_init_fn=worker_init_fn)
    val_loader = DataLoader(val_table, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True, worker_init_fn=worker_init_fn)
    
    model = ResNet18Specialist(num_classes=6).to(device)
    # Load 82.33% weights as initialization
    model.load_state_dict(torch.load("best_model_finetuned.pth", map_location=device))
    
    # Class weights: Penalize errors on glacier (2), mountain (3), and sea (4) with 2x weight!
    class_weights = torch.tensor([1.0, 1.0, 2.2, 2.2, 2.2, 1.0], device=device)
    criterion = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.04)
    
    optimizer = optim.SGD(model.parameters(), lr=LEARNING_RATE, momentum=0.9, weight_decay=2e-4, nesterov=True)
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS, eta_min=1e-5)
    
    best_acc = 0.0
    print("\nTraining Specialist on Hard Triangle (Glacier/Mountain/Sea)...")
    
    for ep in range(EPOCHS):
        model.train()
        for images, labels in tqdm(train_loader, desc=f"Specialist Epoch {ep+1}/{EPOCHS}"):
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
        scheduler.step()
        
        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                preds = model(images).argmax(1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)
        acc = 100.0 * correct / total
        print(f"Specialist Epoch {ep+1}/{EPOCHS} - Val Acc: {acc:.2f}%")
        if acc > best_acc:
            best_acc = acc
            torch.save(model.state_dict(), "best_model_specialist.pth")
            print("  --> Saved new best specialist model!")

if __name__ == "__main__":
    train_specialist()
