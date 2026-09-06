"""
Dual-Model Ensemble Inference Script
Blends Model 1 (Seed 42, 82.17% val) + Model 2 (Seed 1337, 80.42% val)
using 14-view Multi-Scale Test-Time Augmentation (TTA).
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
BATCH_SIZE = 16
TEMPERATURE = 0.85

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


# Multi-Scale Transforms
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
        if self.image_dir.exists():
            seen = set()
            for ext in ["*.jpg", "*.jpeg", "*.png"]:
                for img in self.image_dir.glob(ext):
                    key = img.name.lower()
                    if key not in seen:
                        seen.add(key)
                        self.images.append(img)
        self.images.sort(key=lambda x: x.name)
        print(f"  Found {len(self.images)} images in {image_dir}")

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path = self.images[idx]
        try:
            image = Image.open(img_path).convert("RGB")
        except Exception:
            image = Image.new("RGB", (224, 224), (128, 128, 128))
        
        crops = test_transform(image)
        wide = wide_transform(image).unsqueeze(0)
        zoom = zoom_transform(image).unsqueeze(0)
        base_views = torch.cat([crops, wide, zoom], dim=0)
        return base_views, img_path.stem


def get_model_probs(model_path, dataloader):
    print(f"  --> Computing 14-view probabilities for {model_path.name}...")
    model = ResNet18Classifier(num_classes=NUM_CLASSES)
    model.load_state_dict(torch.load(model_path, map_location=device))
    model = model.to(device)
    model.eval()
    
    all_probs = []
    all_fids = []
    with torch.no_grad():
        for views_batch, filenames in tqdm(dataloader, desc=f"Evaluating {model_path.name}"):
            bs, nviews, c, h, w = views_batch.size()
            views_batch = views_batch.to(device)
            views_flipped = torch.flip(views_batch, dims=[4])
            all_14_views = torch.cat([views_batch, views_flipped], dim=1).view(-1, c, h, w)
            
            outputs = model(all_14_views)
            probs = torch.nn.functional.softmax(outputs / TEMPERATURE, dim=1)
            probs = probs.view(bs, 14, -1).mean(dim=1)
            
            all_probs.append(probs.cpu())
            all_fids.extend(filenames)
            
    return torch.cat(all_probs, dim=0), all_fids


def main():
    print("=" * 60)
    print("  DUAL-MODEL ENSEMBLE INFERENCE (Seed 42 + Seed 1337)")
    print("=" * 60)
    
    test_dataset = MultiScaleTestDataset(TEST_DIR)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    
    path_seed42 = Path("best_model_seed42.pth")
    path_seed1337 = Path("best_model_seed1337.pth")
    
    # 1. Evaluate Model 1 (Seed 42 - 82.17% val)
    probs_seed42, fids = get_model_probs(path_seed42, test_loader)
    
    # 2. Evaluate Model 2 (Seed 1337 - 80.42% val)
    probs_seed1337, _ = get_model_probs(path_seed1337, test_loader)
    
    # 3. Weighted Blend: 60% Seed42 + 40% Seed1337
    print("\n[3/4] Blending models (0.60 * Seed42 + 0.40 * Seed1337)...")
    ensemble_probs = 0.60 * probs_seed42 + 0.40 * probs_seed1337
    
    # 4. Soft Square-Root Prior Calibration (The winning math that got 0.83111)
    empirical_priors = ensemble_probs.mean(dim=0, keepdim=True)
    calibrated_probs = ensemble_probs / (empirical_priors ** 0.5)
    calibrated_probs = calibrated_probs / calibrated_probs.sum(dim=1, keepdim=True)
    
    confidences, predicted = calibrated_probs.max(1)
    
    predictions = []
    for fid, pred, conf in zip(fids, predicted.numpy(), confidences.numpy()):
        predictions.append({
            "image_id": fid,
            "prediction": int(pred),
            "confidence": float(conf),
        })
        
    pred_by_id = {p["image_id"]: p for p in predictions}
    
    # Align to sample_submission.csv
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
    hist_path = SUBMISSIONS_DIR / f"submission_ensemble_{ts}.csv"
    shutil.copyfile(OUTPUT_PATH, hist_path)
    
    print("\n" + "=" * 60)
    print("  [SUCCESS] Dual-Model Ensemble submission written to submission.csv!")
    print(f"  [OK] Saved timestamped backup to {hist_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
