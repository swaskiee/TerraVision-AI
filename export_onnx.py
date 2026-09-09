import torch
import torch.nn as nn
import torchvision.models as models
from pathlib import Path

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

def export_onnx():
    model = ResNet18Classifier(num_classes=6)
    ckpt = Path("best_model_finetuned.pth")
    if not ckpt.exists():
        ckpt = Path("best_model_seed42.pth")
    print(f"Loading {ckpt}...")
    state = torch.load(ckpt, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    
    dummy_input = torch.randn(1, 3, 224, 224)
    out_path = Path("model.onnx")
    
    print(f"Exporting to {out_path}...")
    torch.onnx.export(
        model,
        dummy_input,
        out_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
    )
    print("SUCCESS: model.onnx created successfully!")

if __name__ == "__main__":
    export_onnx()
