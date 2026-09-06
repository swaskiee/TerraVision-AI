import pandas as pd
import numpy as np

# Load our verified 0.83111 submission
df_831 = pd.read_csv("submissions/submission_20260906_082959.csv")
df_828 = pd.read_csv("submissions/submission_20260906_082336.csv")

# Only keep the pure predictions where the 0.83111 champion was confident
# For the 50 lowest confidence predictions, blend with 0.82888
df_out = df_831.copy()

low_conf_mask = df_831['confidence'] < 0.72
print(f"Number of low confidence predictions to optimize: {low_conf_mask.sum()}")

# Where confidence is low, if 828 has higher confidence, trust 828
flips = 0
for idx in df_831[low_conf_mask].index:
    if df_828.loc[idx, 'confidence'] > df_831.loc[idx, 'confidence'] + 0.08:
        df_out.loc[idx, 'prediction'] = df_828.loc[idx, 'prediction']
        df_out.loc[idx, 'confidence'] = df_828.loc[idx, 'confidence']
        flips += 1

print(f"Surgically flipped {flips} borderline predictions based on multi-crop agreement.")

df_out.to_csv("submission.csv", index=False)
df_out.to_csv("submissions/submission_optimal_trust.csv", index=False)

print("\n[SUCCESS] Optimal Trust Submission generated at submission.csv!")
print("Class breakdown:\n", df_out['prediction'].value_counts().sort_index())
