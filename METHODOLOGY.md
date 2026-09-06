# 🔬 METHODOLOGY: DATA-CENTRIC SCENE CLASSIFICATION
## Algorithmic Deep-Dive & Mathematical Foundations
**Team**: GenWin  
**Platform**: 3LC AI Platform  

---

## 1. The Core Data-Centric Thesis

In standard machine learning, practitioners treat data as a commodity and spend immense compute tuning neural network hyperparameters. In contrast, **Data-Centric AI** holds the model architecture fixed and treats dataset engineering as the primary iterative loop:

$$\max_{\mathcal{D} \subset \mathcal{U}, \, |\mathcal{D}| \le 3000} \mathbb{E}_{(x, y) \sim \mathcal{P}_{\text{test}}} \left[ \mathbf{1}\left(\arg\max f_{\theta^*(\mathcal{D})}(x) = y\right) \right]$$

Subject to:
$$f_{\theta} \in \text{ResNet-18}, \quad \theta_{\text{init}} \sim \mathcal{N}(0, \sigma^2)$$

Where:
* $\mathcal{U}$ is the 6,000-image unlabeled pool (`undefined`).
* $\mathcal{D}$ is the active subset admitted to training ($\text{weight}=1$).
* $f_{\theta}$ is ResNet-18 initialized from scratch without external knowledge.

---

## 2. Latent Space Diagnostics (3D UMAP Formulation)

To diagnose model behavior, 3LC maps the 512-dimensional feature representations $\mathbf{z}_i = \text{GAP}(\text{ResNet}(x_i))$ into 3D manifold coordinates $\mathbf{y}_i \in \mathbb{R}^3$.

UMAP minimizes fuzzy set cross-entropy between high-dimensional similarities $p_{ij}$ and low-dimensional similarities $q_{ij}$:

$$\mathcal{L}_{\text{UMAP}} = \sum_{i \ne j} \left[ p_{ij} \log \left(\frac{p_{ij}}{q_{ij}}\right) + (1 - p_{ij}) \log \left(\frac{1 - p_{ij}}{1 - q_{ij}}\right) \right]$$

### The Empirical Finding:
* **Separable Manifolds**: `forest` ($\kappa_1$) and `buildings` ($\kappa_0$) formed dense, isolated clusters with large geodesic distances from all other classes.
* **The Bayes Error Triangle**: `glacier` ($\kappa_2$), `mountain` ($\kappa_3$), and `sea` ($\kappa_4$) exhibited heavy overlapping support in the feature manifold. Shared visual primitives (snow cover on rocks, blue specular ice reflection, sky-horizon lines) created ambiguous decision boundaries.

---

## 3. Active Learning via Probability Margin Mining

Naive active learning methods select samples based on highest confidence:
$$x^* = \arg\max_{x \in \mathcal{U}} \max_c P(y=c \mid x)$$
However, high-confidence samples lie deep inside already-known class manifolds, providing near-zero gradient information:
$$\nabla_{\theta} \mathcal{L}_{\text{CE}}(f(x^*), y) \approx 0$$

### Our Margin Sampling Metric:
Instead, we mine samples located directly along the multi-class decision boundaries:
$$\text{Margin}(x) = P_{(1)}(x) - P_{(2)}(x)$$
Where:
* $P_{(1)}(x) = \max_c P(y=c \mid x)$ (probability of the most likely class).
* $P_{(2)}(x) = \max_{c \ne \hat{y}} P(y=c \mid x)$ (probability of the runner-up class).

### Dual-View Consensus Constraint:
To eliminate false positives caused by camera perspective or off-center composition, we enforced dual-view consensus:
$$\bar{P}(y=c \mid x) = \frac{1}{2} \left[ \sigma(f(x))_c + \sigma(f(\text{flip}(x)))_c \right]$$
A sample was only admitted if both original and horizontally flipped orientations agreed on the top prediction with:
$$\text{Margin}_{\text{consensus}}(x) \in [\tau_{\min}, \tau_{\max}]$$

---

## 4. Asymmetric Quota Allocation

Because `forest`, `buildings`, and `street` converged quickly, allocating equal quotas (500 samples/class) would waste 40% of our precious 3,000-row budget.

We formulated an **asymmetric allocation strategy** proportional to the error entropy observed in the baseline confusion matrix:

$$N_c = N_{\text{base}} + \alpha \cdot \mathcal{H}(c)$$

| Class Index | Class Name | Observed Confusion Rate | Active Quota Allocated |
|:---:|---|:---:|:---:|
| 0 | `buildings` | Low (12%) | **360 rows** |
| 1 | `forest` | Minimal (6%) | **320 rows** |
| 2 | `glacier` | **High (29%)** | **440 rows** |
| 3 | `mountain` | **High (28%)** | **440 rows** |
| 4 | `sea` | **High (26%)** | **440 rows** |
| 5 | `street` | Moderate (15%) | **360 rows** |
| **Total** | | | **2,960 / 3,000 rows** |

---

## 5. Training Innovations on Scratched ResNet-18

### 1. Receptive Field Optimization ($150\text{px} \to 224\text{px}$)
ResNet-18 utilizes 5 downsampling residual stages ($224 \to 112 \to 56 \to 28 \to 14 \to 7$). At 150px, the final feature map shrinks to $4 \times 4$ pixels before global average pooling, destroying spatial phase relationships. Scaling to native 224px preserves critical scene textures.

### 2. Batch Normalization Classifier Head
Standard architectures place dropout immediately after global average pooling. With random initializations, this starves early backpropagation signals. We added `BatchNorm1d` before the linear projection to standardize feature variance across minibatches:
$$\hat{\mathbf{z}} = \frac{\mathbf{z} - \mu_{\mathcal{B}}}{\sqrt{\sigma^2_{\mathcal{B}} + \epsilon}}, \quad \mathbf{h} = \text{ReLU}(\mathbf{W}_1 \hat{\mathbf{z}} + \mathbf{b}_1), \quad \hat{\mathbf{y}} = \mathbf{W}_2 \text{Dropout}_{0.2}(\mathbf{h}) + \mathbf{b}_2$$

### 3. Mixup Regularization ($\alpha = 0.3$)
To prevent the model from forming sharp, non-linear decision boundaries between the entangled topological classes, we applied convex combination regularization:
$$\tilde{x} = \lambda x_i + (1 - \lambda) x_j, \quad \tilde{y} = \lambda y_i + (1 - \lambda) y_j, \quad \lambda \sim \text{Beta}(\alpha, \alpha)$$

---

## 6. Multi-Scale Test-Time Augmentation (TTA) & Soft Prior Rebalancing

During inference on `data/test/`, rather than computing a single center-crop forward pass, each image is decomposed into **14 multi-scale spatial views**:
1. Five crops at scale 256px (Center, Top-Left, Top-Right, Bottom-Left, Bottom-Right)
2. Wide-angle uncropped view (224px)
3. Zoom close-up view (288px)
4. All 7 views horizontally mirrored

### Probability Consensus:
$$\bar{P}(y=c \mid x) = \sum_{v=1}^{14} w_v \cdot \sigma\left(\frac{f(x_v)}{T}\right)_c$$
Where:
* $w_v$ applies $2.0\times$ weight to center and wide-angle views.
* $T = 0.85$ (Temperature sharpening).

### Bayesian Soft Prior Calibration:
Given that the test set is stratified and balanced ($P_{\text{true}}(y=c) = 1/6$), but our raw classifier over-predicted Sea (346 predictions) relative to Glacier (258 predictions), we applied soft square-root prior rebalancing:
$$P_{\text{calib}}(y=c \mid x) = \frac{\bar{P}(y=c \mid x)}{\left( \frac{1}{N} \sum_{i=1}^N \bar{P}(y=c \mid x_i) \right)^{\gamma}}$$
With $\gamma = 0.35$. This restored misclassified borderline Sea samples to their true Glacier and Mountain categories, pushing test accuracy to **0.83333 on Kaggle**.
