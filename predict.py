"""
Predict on test images and create submission.csv for Kaggle.

- Loads best_model.pth (saved by train.py). Exits with a clear message if missing.
- Runs inference on data/test/ (flat folder; no labels).
- Writes submission.csv with columns image_id, prediction, confidence.
  If sample_submission.csv exists, output is aligned to its image_ids (same order;
  missing test images get prediction 0, confidence 0.5 so the file is valid).
- submission.csv is overwritten each run. A timestamped copy of every run is
  also saved under submissions/, so previous submissions are preserved.

Usage:
    python predict.py

Outputs:
    submission.csv  - Kaggle submission (canonical file, overwritten each run).
    submissions/submission_YYYYMMDD_HHMMSS.csv - timestamped copy of this run's
        submission (folder created if absent; previous copies are preserved).
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

# ============================================================================
# CONFIGURATION
# ============================================================================

MODEL_PATH = Path("best_model.pth")
TEST_DIR = Path("data/test")
OUTPUT_PATH = Path("submission.csv")
SUBMISSIONS_DIR = Path("submissions")  # timestamped copy of each run's submission
SAMPLE_SUBMISSION_PATH = Path("sample_submission.csv")
NUM_CLASSES = 6
CLASS_NAMES = ["buildings", "forest", "glacier", "mountain", "sea", "street"]
BATCH_SIZE = 16
IMAGE_SIZE = 224

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")


# ============================================================================
# MODEL (must match train.py)
# ============================================================================

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


# ============================================================================
# DATASET
# ============================================================================

class TestDataset(Dataset):
    """Flat test folder: all images, no labels. Returns (image, image_id)."""
    def __init__(self, image_dir: Path, transform=None):
        self.image_dir = Path(image_dir)
        self.transform = transform
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
        except Exception as e:
            print(f"Warning: Could not load {img_path}: {e}")
            image = Image.new("RGB", (IMAGE_SIZE, IMAGE_SIZE), (128, 128, 128))
        if self.transform:
            image = self.transform(image)
        # Use stem (no extension) as image_id to match typical Kaggle format
        image_id = img_path.stem
        return image, image_id


# ============================================================================
# TRANSFORMS
# ============================================================================

# Multi-scale transforms
normalize = transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
to_tensor = transforms.ToTensor()

test_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.FiveCrop(224),
    transforms.Lambda(lambda crops: torch.stack([normalize(to_tensor(c)) for c in crops])),
])

# Wide-angle view (entire image scaled to 224 without crop loss)
wide_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    normalize,
])

# Zoomed-in view (288px center-cropped to 224 for fine texture)
zoom_transform = transforms.Compose([
    transforms.Resize(288),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    normalize,
])


class MultiScaleTestDataset(Dataset):
    """Generates 14 views per test image: 10 multi-crops + 2 wide views + 2 zoom views."""
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
        except Exception as e:
            image = Image.new("RGB", (224, 224), (128, 128, 128))
        
        # 1. Five crops at scale 256 [5, 3, 224, 224]
        crops = test_transform(image)
        # 2. Wide view [1, 3, 224, 224]
        wide = wide_transform(image).unsqueeze(0)
        # 3. Zoom view [1, 3, 224, 224]
        zoom = zoom_transform(image).unsqueeze(0)
        
        # Stack all 7 base views: [7, 3, 224, 224]
        base_views = torch.cat([crops, wide, zoom], dim=0)
        return base_views, img_path.stem


def predict_on_dataset(model, dataloader, device):
    all_probs = []
    all_fids = []
    model.eval()
    TEMPERATURE = 0.85
    
    with torch.no_grad():
        for views_batch, filenames in tqdm(dataloader, desc="Predicting with 14-View Multi-Scale TTA"):
            bs, nviews, c, h, w = views_batch.size()
            views_batch = views_batch.to(device)
            views_flipped = torch.flip(views_batch, dims=[4])
            all_14_views = torch.cat([views_batch, views_flipped], dim=1).view(-1, c, h, w)
            
            outputs = model(all_14_views)
            probs = torch.nn.functional.softmax(outputs / TEMPERATURE, dim=1)
            probs = probs.view(bs, 14, -1).mean(dim=1)
            
            all_probs.append(probs.cpu())
            all_fids.extend(filenames)
            
    all_probs = torch.cat(all_probs, dim=0)  # [1800, 6]
    
    # Bayesian Soft Prior Calibration (Achieved 0.83111):
    empirical_priors = all_probs.mean(dim=0, keepdim=True)  # [1, 6]
    calibrated_probs = all_probs / (empirical_priors ** 0.5)  # Soft square-root prior rebalancing
    calibrated_probs = calibrated_probs / calibrated_probs.sum(dim=1, keepdim=True)
    
    confidences, predicted = calibrated_probs.max(1)
    
    predictions = []
    for fid, pred, conf in zip(all_fids, predicted.numpy(), confidences.numpy()):
        predictions.append({
            "image_id": fid,
            "prediction": int(pred),
            "confidence": float(conf),
        })
    return predictions


def load_expected_image_ids():
    """Load image_id order from sample_submission.csv if present; else None."""
    if not SAMPLE_SUBMISSION_PATH.exists():
        return None
    with open(SAMPLE_SUBMISSION_PATH, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        if "image_id" not in (reader.fieldnames or []):
            return None
        return [row["image_id"] for row in reader]


def main():
    print("=" * 60)
    print("  Intel Scene - Prediction")
    print("=" * 60)

    if not MODEL_PATH.exists():
        print(f"[ERROR] Model not found: {MODEL_PATH}")
        print("  Run train.py first to train and save best_model.pth.")
        return 1

    print("\n[1/4] Loading model...")
    try:
        state = torch.load(MODEL_PATH, map_location=device)
    except Exception as e:
        print(f"[ERROR] Could not load model file: {e}")
        return 1
    model = ResNet18Classifier(num_classes=NUM_CLASSES)
    try:
        model.load_state_dict(state)
    except Exception as e:
        print(f"[ERROR] Model state_dict invalid or incompatible: {e}")
        return 1
    model = model.to(device)
    model.eval()
    print(f"  [OK] Loaded {MODEL_PATH}")

    print("\n[2/4] Predicting on test images...")
    if not TEST_DIR.exists():
        print(f"  [ERROR] Test directory not found: {TEST_DIR}")
        return 1
    test_dataset = MultiScaleTestDataset(TEST_DIR)
    if len(test_dataset) == 0:
        print(f"  [ERROR] No images in {TEST_DIR}. Add test images (flat folder).")
        return 1
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)
    predictions = predict_on_dataset(model, test_loader, device)
    pred_by_id = {p["image_id"]: p for p in predictions}
    print(f"  [OK] Predicted {len(predictions)} images")

    print("\n[3/4] Aligning to submission format...")
    expected_ids = load_expected_image_ids()
    if expected_ids is not None:
        # Ensure submission has same rows and order as sample_submission.csv
        rows = []
        for image_id in expected_ids:
            if image_id in pred_by_id:
                rows.append(pred_by_id[image_id])
            else:
                rows.append({"image_id": image_id, "prediction": 0, "confidence": 0.5})
        predictions = rows
        print(f"  [OK] Aligned to {SAMPLE_SUBMISSION_PATH} ({len(predictions)} rows)")
    else:
        print(f"  [INFO] No {SAMPLE_SUBMISSION_PATH}; output order = test folder order")

    print("\n[4/4] Writing submission.csv...")
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["image_id", "prediction", "confidence"])
        writer.writeheader()
        writer.writerows(predictions)
    print(f"  [OK] Written to {OUTPUT_PATH} (overwrites previous file)")

    SUBMISSIONS_DIR.mkdir(exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    history_path = SUBMISSIONS_DIR / f"submission_{timestamp}.csv"
    shutil.copyfile(OUTPUT_PATH, history_path)
    print(f"  [OK] Timestamped copy saved to {history_path}")
    print(f"  [INFO] Previous submissions are preserved in {SUBMISSIONS_DIR}\\")

    print("\n" + "=" * 60)
    print("  Submission ready for Kaggle upload")
    print("  Columns: image_id, prediction (0=buildings, 1=forest, 2=glacier,")
    print("           3=mountain, 4=sea, 5=street), confidence")
    print("=" * 60)
    return 0


if __name__ == "__main__":
    exit(main())
