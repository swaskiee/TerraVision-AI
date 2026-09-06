import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from pathlib import Path
from collections import defaultdict
import numpy as np

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

val_dir = Path("data/val")
classes = ["buildings", "forest", "glacier", "mountain", "sea", "street"]

matrix = np.zeros((6, 6), dtype=int)

for c_idx, c_name in enumerate(classes):
    for f in (val_dir / c_name).glob("*.jpg"):
        img = Image.open(f).convert("RGB")
        t = t_normal(img).unsqueeze(0).to(device)
        with torch.no_grad():
            pred = model(t).argmax(1).item()
            matrix[c_idx, pred] += 1

print("Confusion Matrix (Rows = Ground Truth, Cols = Predicted):")
print(f"{'Class':<12}" + "".join([f"{c[:4]:>7}" for c in classes]) + "   Acc")
for i, c in enumerate(classes):
    row_str = f"{c:<12}" + "".join([f"{matrix[i, j]:>7}" for j in range(6)])
    acc = matrix[i, i] / matrix[i].sum() * 100
    print(f"{row_str}   {acc:.1f}%")
