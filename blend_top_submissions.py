import pandas as pd
import numpy as np

# Load our top submissions
sub_831 = pd.read_csv("submissions/submission_20260906_082959.csv")
sub_828 = pd.read_csv("submissions/submission_20260906_082336.csv")
sub_latest = pd.read_csv("submission.csv")

print("Aligning predictions...")

# For images where sub_831 and sub_828 agree, trust them 100%
# For images where they disagree, use confidence weighting
final_preds = []
final_confs = []

agreement_count = 0
for i in range(len(sub_831)):
    p1, c1 = sub_831.loc[i, 'prediction'], sub_831.loc[i, 'confidence']
    p2, c2 = sub_828.loc[i, 'prediction'], sub_828.loc[i, 'confidence']
    p3, c3 = sub_latest.loc[i, 'prediction'], sub_latest.loc[i, 'confidence']
    
    votes = {}
    for p, c, w in [(p1, c1, 1.5), (p2, c2, 1.2), (p3, c3, 1.0)]:
        votes[p] = votes.get(p, 0.0) + c * w
        
    best_class = max(votes.keys(), key=lambda k: votes[k])
    best_conf = (c1 + c2 + c3) / 3.0
    
    final_preds.append(int(best_class))
    final_confs.append(float(best_conf))
    if p1 == p2:
        agreement_count += 1

print(f"Total agreement between top 2 submissions: {agreement_count} / {len(sub_831)} ({agreement_count/len(sub_831)*100:.1f}%)")

df_out = pd.DataFrame({
    'image_id': sub_831['image_id'],
    'prediction': final_preds,
    'confidence': final_confs
})

df_out.to_csv("submission.csv", index=False)
df_out.to_csv("submissions/submission_grand_ensemble.csv", index=False)

print("[SUCCESS] Created weighted consensus submission at submission.csv!")
print("Class breakdown:\n", df_out['prediction'].value_counts().sort_index())
