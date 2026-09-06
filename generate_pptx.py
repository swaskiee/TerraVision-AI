import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Color palette
    DARK_NAVY = RGBColor(15, 23, 42)      # #0F172A
    ACCENT_BLUE = RGBColor(14, 165, 233)   # #0EA5E9
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8
    CARD_BG = RGBColor(30, 41, 59)        # #1E293B
    BORDER_COLOR = RGBColor(51, 65, 85)   # #334155
    SUCCESS_GREEN = RGBColor(34, 197, 94)  # #22C55E

    blank_slide_layout = prs.slide_layouts[6]
    
    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = DARK_NAVY
        bg.line.fill.background() # no line
        return bg

    def add_header(slide, title, subtitle):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.2))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(28)
        p.font.bold = True
        p.font.color.rgb = TEXT_WHITE
        p.font.name = "Arial"
        
        if subtitle:
            p2 = tf.add_paragraph()
            p2.text = subtitle
            p2.font.size = Pt(14)
            p2.font.color.rgb = ACCENT_BLUE
            p2.font.name = "Arial"
            p2.space_before = Pt(4)

    # -------------------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s1)
    
    # Title & Subtitle box
    tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(2.0), Inches(11.3), Inches(3.0))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    
    p = tf1.paragraphs[0]
    p.text = "DATA-CENTRIC AI SCENE CLASSIFICATION"
    p.font.size = Pt(40)
    p.font.bold = True
    p.font.color.rgb = TEXT_WHITE
    p.font.name = "Arial"
    
    p2 = tf1.add_paragraph()
    p2.text = "3LC × HackBlox 2026 Challenge | High-Accuracy Active Learning under Strict Budget"
    p2.font.size = Pt(20)
    p2.font.color.rgb = ACCENT_BLUE
    p2.font.name = "Arial"
    p2.space_before = Pt(12)

    p3 = tf1.add_paragraph()
    p3.text = "Team: GenWin | Platform: 3LC AI + PyTorch + NVIDIA CUDA | Final Leaderboard: 0.83111 (Top Tier)"
    p3.font.size = Pt(15)
    p3.font.color.rgb = TEXT_MUTED
    p3.font.name = "Arial"
    p3.space_before = Pt(20)

    # -------------------------------------------------------------------------
    # SLIDE 2: Challenge Rules & Problem Formulation
    # -------------------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s2)
    add_header(s2, "1. Challenge Rules & Problem Formulation", "Strict competition constraints enforced for true Data-Centric evaluation")

    cards_data = [
        ("Fixed Model Architecture", "ResNet-18 (Residual Network 18 layers) locked by rules.\nNo ViTs, no EfficientNets, no parameter scaling."),
        ("Strictly Trained From Scratch", "ZERO Pretrained Weights allowed (weights=None).\nModel starts with pure random noise and learns exclusively from provided data."),
        ("Hard Labeling Budget Cap", "Max 3,000 active rows with weight=1 in final 3LC train table.\n600 seed samples count against this cap. Verified via 3LC table lineage."),
        ("6-Class Natural Scenes", "Class 0: Buildings | Class 1: Forest | Class 2: Glacier\nClass 3: Mountain | Class 4: Sea | Class 5: Street")
    ]
    
    left = Inches(0.8)
    top = Inches(1.8)
    w = Inches(5.6)
    h = Inches(2.2)
    
    for i, (title, desc) in enumerate(cards_data):
        row = i // 2
        col = i % 2
        c_left = left + col * Inches(6.0)
        c_top = top + row * Inches(2.5)
        
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, c_top, w, h)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.2)
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE
        p.font.name = "Arial"
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_WHITE
        p2.font.name = "Arial"
        p2.space_before = Pt(8)

    # -------------------------------------------------------------------------
    # SLIDE 3: The Data-Centric Breakthrough
    # -------------------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s3)
    add_header(s3, "2. Latent Space Auditing with 3LC", "Diagnosing the Bayes Error Triangle via 3D UMAP Feature Embeddings")

    c1 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    c1.fill.solid()
    c1.fill.fore_color.rgb = CARD_BG
    c1.line.color.rgb = BORDER_COLOR
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = tf1.margin_top = tf1.margin_bottom = Inches(0.3)
    
    p = tf1.paragraphs[0]
    p.text = "The Baseline Cold Start (600 Seeds)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    bullet_points = [
        "100 seed images per class evaluated on validation set.",
        "Baseline Score: 70.33% val / 0.68666 Kaggle test accuracy.",
        "3LC Embeddings Inspection (UMAP):",
        "• Forest & Buildings formed dense, separable clusters.",
        "• Glacier, Mountain, and Sea suffered massive entanglement.",
        "Root Cause: Shared features like snow, rocky ridges, horizon lines, and reflective blue ice."
    ]
    for b in bullet_points:
        p = tf1.add_paragraph()
        p.text = b
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    c2 = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    c2.fill.solid()
    c2.fill.fore_color.rgb = CARD_BG
    c2.line.color.rgb = BORDER_COLOR
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0.3)
    
    p = tf2.paragraphs[0]
    p.text = "The 3-Way Confusion Audit"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    audit_points = [
        "Confusion Matrix Breakdown on Cold Start:",
        "• Glacier: 37 images confused as Mountain, 11 as Sea.",
        "• Mountain: 23 images confused as Glacier, 28 as Sea.",
        "• Sea: 24 images confused as Glacier, 18 as Mountain.",
        "Data-Centric Strategy:",
        "• Uniform random sampling is futile on entangled manifolds.",
        "• We must actively bias labeling budget toward borderlines."
    ]
    for b in audit_points:
        p = tf2.add_paragraph()
        p.text = b
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    # -------------------------------------------------------------------------
    # SLIDE 4: Active Learning Iteration Progression
    # -------------------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s4)
    add_header(s4, "3. Multi-Stage Active Learning Pipeline", "Step-by-step progression from 68.6% baseline to 83.1%+ leaderboard rank")

    stages = [
        ("Iteration 0 (Cold Start)", "600 Seeds (100/class)", "70.33%", "0.68666", "Initial model with random weights establishing basic convolutions."),
        ("Iteration 1 (Anchoring)", "2,700 Active Samples", "73.08%", "0.74500", "Top 350 high-confidence anchor samples per class from 6k pool."),
        ("Iteration 2 (Consensus)", "2,880 Active Samples", "76.67%", "0.78500", "Dual-view consensus scoring (original + flip) eliminates single-view noise."),
        ("Iteration 3 (Margin Quota)", "2,960 Active Samples", "82.17%", "0.83111", "Boundary Margin Mining (P1 - P2) + Asymmetric Quotas for hard classes.")
    ]
    
    for i, (stage, budget, val, test, note) in enumerate(stages):
        top_y = Inches(1.8 + i * 1.3)
        row_box = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), top_y, Inches(11.7), Inches(1.15))
        row_box.fill.solid()
        row_box.fill.fore_color.rgb = CARD_BG
        row_box.line.color.rgb = BORDER_COLOR
        
        tf = row_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.15)
        
        p = tf.paragraphs[0]
        p.text = f"{stage}   |   Active Budget: {budget}   |   Val Acc: {val}   |   Test Score: {test}"
        p.font.size = Pt(15)
        p.font.bold = True
        p.font.color.rgb = SUCCESS_GREEN if i == 3 else ACCENT_BLUE
        
        p2 = tf.add_paragraph()
        p2.text = note
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(4)

    # -------------------------------------------------------------------------
    # SLIDE 5: Asymmetric Margin Mining Formula
    # -------------------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s5)
    add_header(s5, "4. Boundary Margin Mining & Asymmetric Quotas", "Mathematical formulation of our selective active learning engine")

    box_left = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    box_left.fill.solid()
    box_left.fill.fore_color.rgb = CARD_BG
    box_left.line.color.rgb = BORDER_COLOR
    tf = box_left.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.3)
    
    p = tf.paragraphs[0]
    p.text = "Mathematical Formulation"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    math_desc = [
        "1. Probability Margin Formulation:",
        "   Margin(x) = P(top_class) - P(runner_up)",
        "• Low margin indicates informative boundary samples near the decision boundary.",
        "2. Dual-View Consensus Filtering:",
        "   P_avg(x) = 0.5 * [ P(x) + P(flip(x)) ]",
        "• Eliminates single-view orientation artifacts.",
        "3. Strict Budget Adherence:",
        "   Total Selected = 2,960 rows <= 3,000 Cap"
    ]
    for m in math_desc:
        p = tf.add_paragraph()
        p.text = m
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    box_right = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    box_right.fill.solid()
    box_right.fill.fore_color.rgb = CARD_BG
    box_right.line.color.rgb = BORDER_COLOR
    tf2 = box_right.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0.3)
    
    p = tf2.paragraphs[0]
    p.text = "Asymmetric Class Quotas"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    quota_desc = [
        "Instead of naive 1/6 uniform quotas, we reallocated capacity to the confused classes:",
        "• Glacier: 440 samples (Overweighted)",
        "• Mountain: 440 samples (Overweighted)",
        "• Sea: 440 samples (Overweighted)",
        "• Buildings: 360 samples (Sufficiently separable)",
        "• Street: 360 samples (Sufficiently separable)",
        "• Forest: 320 samples (Easiest manifold)",
        "Total Active Rows: 2,960 / 3,000"
    ]
    for q in quota_desc:
        p = tf2.add_paragraph()
        p.text = q
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    # -------------------------------------------------------------------------
    # SLIDE 6: Training & Architecture Optimization
    # -------------------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s6)
    add_header(s6, "5. GPU Training & Architecture Optimization", "Maximizing ResNet-18 capacity from scratch within competition rules")

    opt_cards = [
        ("Native 224px Resolution Scaling", "Upgraded from 150px starter kit to 224px matching ResNet-18 native receptive field. Prevents early texture compression."),
        ("Batch Normalization Classifier Head", "Integrated BatchNorm1d between global average pooling and linear classifier (512 -> 256 -> 6). Stabilizes gradients from scratch."),
        ("Mixup Regularization (alpha = 0.3)", "Blends image pairs and labels during training. Prevents overconfident hyperplanes on overlapping classes like glacier/sea."),
        ("SGD + Cosine Annealing (T_max = 80)", "Replaced spiky OneCycleLR with smooth Cosine Annealing decay down to 1e-4. Eliminates mid-training validation drops.")
    ]
    for i, (title, desc) in enumerate(opt_cards):
        row = i // 2
        col = i % 2
        c_left = left + col * Inches(6.0)
        c_top = top + row * Inches(2.5)
        
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, c_top, w, h)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_COLOR
        
        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = Inches(0.2)
        
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = ACCENT_BLUE
        
        p2 = tf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_WHITE
        p2.space_before = Pt(8)

    # -------------------------------------------------------------------------
    # SLIDE 7: 14-View Multi-Scale Test-Time Augmentation (TTA)
    # -------------------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s7)
    add_header(s7, "6. Multi-Scale Test-Time Augmentation (TTA)", "Inference-time consensus engine that boosted test score from 0.821 to 0.831+")

    tta_box1 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    tta_box1.fill.solid()
    tta_box1.fill.fore_color.rgb = CARD_BG
    tta_box1.line.color.rgb = BORDER_COLOR
    tf1 = tta_box1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = tf1.margin_top = tf1.margin_bottom = Inches(0.3)
    
    p = tf1.paragraphs[0]
    p.text = "14 Multi-Scale Perspectives"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    tta_points = [
        "Instead of a single center-crop, each test image is evaluated from 14 perspectives:",
        "1. Scale 1 (256px): FiveCrop (Center, 4 Corners) + 5 Flips = 10 views.",
        "2. Scale 2 (Wide 224px): Full-frame uncropped view + Flip = 2 views (preserves full horizon).",
        "3. Scale 3 (Zoom 288px): Center-cropped close-up + Flip = 2 views (captures rock/wave texture).",
        "Result: 14 views evaluated and averaged per test image."
    ]
    for pt in tta_points:
        p = tf1.add_paragraph()
        p.text = pt
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    tta_box2 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    tta_box2.fill.solid()
    tta_box2.fill.fore_color.rgb = CARD_BG
    tta_box2.line.color.rgb = BORDER_COLOR
    tf2 = tta_box2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0.3)
    
    p = tf2.paragraphs[0]
    p.text = "Bayesian Prior Calibration"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    calib_points = [
        "Discovered Test Class Skew:",
        "• Initial predictions over-predicted Sea (346) and starved Glacier (258).",
        "• Test set is known to be balanced (300/class).",
        "Soft Square-Root Prior Rebalancing:",
        "   P_calib(x) = P(x) / sqrt(P_empirical)",
        "• Flipped ~30 borderline Sea misclassifications back to Glacier and Mountain.",
        "• Directly pushed test score to 0.83111 on Kaggle."
    ]
    for pt in calib_points:
        p = tf2.add_paragraph()
        p.text = pt
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(6)

    # -------------------------------------------------------------------------
    # SLIDE 8: Summary of Achievements & Deliverables
    # -------------------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_slide_layout)
    set_slide_background(s8)
    add_header(s8, "7. Project Verification & Final Summary", "Full compliance with competition requirements and offline evaluation artifacts")

    sum_left = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    sum_left.fill.solid()
    sum_left.fill.fore_color.rgb = CARD_BG
    sum_left.line.color.rgb = BORDER_COLOR
    tf1 = sum_left.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = tf1.margin_top = tf1.margin_bottom = Inches(0.3)
    
    p = tf1.paragraphs[0]
    p.text = "Rule Compliance Verification"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    comp_points = [
        "[x] Model: Strictly ResNet-18 (no other architecture).",
        "[x] Weights: Trained from scratch (weights=None).",
        "[x] Data: Strictly provided train/val data.",
        "[x] Budget: 2,960 active rows <= 3,000 limit.",
        "[x] Submission: Aligned to sample_submission.csv (1800 rows).",
        "[x] Judge Collaborator: Added Rishikesh-Jadhav."
    ]
    for cp in comp_points:
        p = tf1.add_paragraph()
        p.text = cp
        p.font.size = Pt(13)
        p.font.color.rgb = SUCCESS_GREEN
        p.space_before = Pt(8)

    sum_right = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.8), Inches(5.7), Inches(5.0))
    sum_right.fill.solid()
    sum_right.fill.fore_color.rgb = CARD_BG
    sum_right.line.color.rgb = BORDER_COLOR
    tf2 = sum_right.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = tf2.margin_top = tf2.margin_bottom = Inches(0.3)
    
    p = tf2.paragraphs[0]
    p.text = "Final Deliverables"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ACCENT_BLUE
    
    deliv_points = [
        "1. Complete GitHub Repository:",
        "   Clean code, WRITEUP.md, and aesthetic README.md.",
        "2. 3LC Lineage Archive:",
        "   Intel-Scene-3LC-Project.zip (all revisions & 3D UMAP runs).",
        "3. Kaggle Submissions:",
        "   Final winning submission selected for private evaluation.",
        "4. Google Evaluation Form:",
        "   Completed before the 10:00 AM IST deadline."
    ]
    for dp in deliv_points:
        p = tf2.add_paragraph()
        p.text = dp
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.space_before = Pt(8)

    # Save presentation
    output_path = "D:/Hackblox-AI/3LC_Scene_Classification_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation successfully created at {output_path}")

if __name__ == "__main__":
    create_presentation()
