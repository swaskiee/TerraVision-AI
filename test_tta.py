import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from pathlib import Path
from tqdm import tqdm

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

val_dir = Path("data/val")
classes = ["buildings", "forest", "glacier", "mountain", "sea", "street"]

normal_correct = 0
tta_correct = 0
total = 0

for c_idx, c_name in enumerate(classes):
    img_files = list((val_dir / c_name).glob("*.jpg"))
    for f in img_files:
        img = Image.open(f).convert("RGB")
        tensor1 = t_normal(img).unsqueeze(0).to(device)
        tensor2 = t_flip(img).unsqueeze(0).to(device)
        
        with torch.no_grad():
            out1 = model(tensor1).softmax(1)
            out2 = model(tensor2).softmax(1)
            tta_out = (out1 + out2) / 2
            
            pred_normal = out1.argmax(1).item()
            pred_tta = tta_out.argmax(1).item()
            
            if pred_normal == c_idx:
                normal_correct += 1
            if pred_tta == c_idx:
                tta_correct += 1
            total += 1

print(f"Normal Val Acc: {normal_correct / total * 100:.2f}%")
print(f"TTA Val Acc:    {tta_correct / total * 100:.2f}%")
