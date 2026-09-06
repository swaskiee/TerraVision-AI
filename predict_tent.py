"""
Test-Time Adaptation (TENT) + Multi-Scale TTA
Adapts BatchNorm statistics on the unlabeled test domain using entropy minimization,
then evaluates 14-view multi-scale TTA on our 82.33% champion model.
100% compliant with competition rules (no training data modifications).
"""

import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from pathlib import Path
from tqdm import tqdm
from datetime import datetime
import csv
import shutil

TEST_DIR = Path("data/test")
OUTPUT_PATH = Path("submission.csv")
SUBMISSIONS_DIR = Path("submissions")
SAMPLE_SUBMISSION_PATH = Path("sample_submission.csv")
NUM_CLASSES = 6
BATCH_SIZE = 32
TEMPERATURE = 0.80

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")


class ResNet18Classifier(nn.Module):
    def __init__(self, num_classes=6):
        super(ResNet18Classifier, self).__init__()
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


# ---------------------------------------------------------------------------
# Simple Adaptation Loader
# ---------------------------------------------------------------------------
adapt_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


class AdaptDataset(Dataset):
    def __init__(self, image_dir: Path):
        self.image_dir = Path(image_dir)
        self.images = []
        for ext in ["*.jpg", "*.jpeg", "*.png"]:
            for img in self.image_dir.glob(ext):
                self.images.append(img)
        self.images.sort(key=lambda x: x.name)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert("RGB")
        return adapt_transform(image)


# ---------------------------------------------------------------------------
# 14-View Evaluation Transforms
# ---------------------------------------------------------------------------
normalize = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
to_tensor = transforms.ToTensor()

test_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.FiveCrop(224),
    transforms.Lambda(lambda crops: torch.stack([normalize(to_tensor(c)) for c in crops])),
])
wide_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    normalize,
])
zoom_transform = transforms.Compose([
    transforms.Resize(288),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    normalize,
])


class MultiScaleTestDataset(Dataset):
    def __init__(self, image_dir: Path):
        self.image_dir = Path(image_dir)
        self.images = []
        for ext in ["*.jpg", "*.jpeg", "*.png"]:
            for img in self.image_dir.glob(ext):
                self.images.append(img)
        self.images.sort(key=lambda x: x.name)

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert("RGB")
        crops = test_transform(image)
        wide = wide_transform(image).unsqueeze(0)
        zoom = zoom_transform(image).unsqueeze(0)
        return torch.cat([crops, wide, zoom], dim=0), img_path.stem


def adapt_model_tent(model, dataloader, epochs=2):
    print("\n[TENT] Adapting model normalization to test set domain...")
    model.eval()
    
    # Freeze all parameters EXCEPT BatchNorm running stats and affine weights
    for param in model.parameters():
        param.requires_grad = False
    
    bn_params = []
    for m in model.modules():
        if isinstance(m, (nn.BatchNorm2d, nn.BatchNorm1d)):
            m.train()
            m.requires_grad_(True)
            bn_params.extend([m.weight, m.bias])
            
    optimizer = torch.optim.Adam(bn_params, lr=0.0005)
    
    for ep in range(epochs):
        for images in tqdm(dataloader, desc=f"Domain Adaptation Epoch {ep+1}/{epochs}"):
            images = images.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            probs = torch.softmax(outputs, dim=1)
            # Shannon Entropy Loss: H(p) = -sum(p * log(p))
            loss = -(probs * torch.log(probs + 1e-6)).sum(dim=1).mean()
            loss.backward()
            optimizer.step()
            
    print("  [OK] Test-Time Adaptation completed.")
    return model


def main():
    print("=" * 60)
    print("  TEST-TIME ADAPTATION (TENT) + MULTI-SCALE TTA")
    print("=" * 60)
    
    # Load 82.33% champion model
    model = ResNet18Classifier(num_classes=NUM_CLASSES)
    model.load_state_dict(torch.load("best_model_finetuned.pth", map_location=device))
    model = model.to(device)
    
    # 1. Adapt on test set
    adapt_loader = DataLoader(AdaptDataset(TEST_DIR), batch_size=32, shuffle=True)
    model = adapt_model_tent(model, adapt_loader, epochs=2)
    
    # 2. Evaluate with 14-View TTA
    test_loader = DataLoader(MultiScaleTestDataset(TEST_DIR), batch_size=16, shuffle=False)
    
    view_weights = torch.tensor([
        2.0, 1.0, 1.0, 1.0, 1.0,  # crops
        2.0, 1.0,                # wide, zoom
        2.0, 1.0, 1.0, 1.0, 1.0,  # flipped crops
        2.0, 1.0                 # flipped wide, zoom
    ], device=device).unsqueeze(0).unsqueeze(-1)
    view_weights = view_weights / view_weights.sum(dim=1, keepdim=True)
    
    all_probs = []
    all_fids = []
    model.eval()
    
    with torch.no_grad():
        for views_batch, filenames in tqdm(test_loader, desc="Predicting with Adapted 14-View TTA"):
            bs, nviews, c, h, w = views_batch.size()
            views_batch = views_batch.to(device)
            views_flipped = torch.flip(views_batch, dims=[4])
            all_14_views = torch.cat([views_batch, views_flipped], dim=1).view(-1, c, h, w)
            
            outputs = model(all_14_views)
            probs = torch.softmax(outputs / TEMPERATURE, dim=1)
            probs = probs.view(bs, 14, -1)
            
            weighted_probs = (probs * view_weights).sum(dim=1)
            all_probs.append(weighted_probs.cpu())
            all_fids.extend(filenames)
            
    all_probs = torch.cat(all_probs, dim=0)
    
    # Prior calibration
    empirical_priors = all_probs.mean(dim=0, keepdim=True)
    calibrated_probs = all_probs / (empirical_priors ** 0.35)
    calibrated_probs = calibrated_probs / calibrated_probs.sum(dim=1, keepdim=True)
    
    confidences, predicted = calibrated_probs.max(1)
    
    predictions = []
    for fid, pred, conf in zip(all_fids, predicted.numpy(), confidences.numpy()):
        predictions.append({
            "image_id": fid,
            "prediction": int(pred),
            "confidence": float(conf),
        })
        
    pred_by_id = {p["image_id"]: p for p in predictions}
    
    if SAMPLE_SUBMISSION_PATH.exists():
        with open(SAMPLE_SUBMISSION_PATH, "r", newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            expected_ids = [r["image_id"] for r in reader]
            rows = [pred_by_id.get(eid, {"image_id": eid, "prediction": 0, "confidence": 0.5}) for eid in expected_ids]
            predictions = rows
            
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["image_id", "prediction", "confidence"])
        writer.writeheader()
        writer.writerows(predictions)
        
    SUBMISSIONS_DIR.mkdir(exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    hist_path = SUBMISSIONS_DIR / f"submission_tent_{ts}.csv"
    shutil.copyfile(OUTPUT_PATH, hist_path)
    
    print("\n" + "=" * 60)
    print("  [SUCCESS] Test-Time Adapted submission generated!")
    print(f"  [OK] Saved timestamped copy to {hist_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
