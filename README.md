# Continuous Probability Distributions: Industry Applications
**Interactive Educational Web Application for Undergraduate AIML Students**

---

## 🌟 Overview
This interactive web application teaches undergraduate Artificial Intelligence & Machine Learning (AIML) students the foundational concepts and industry utility of continuous probability distributions. Rather than abstract mathematics alone, each module bridges theory with tangible, high-stakes industrial engineering problems.

---

## 🏗️ Architecture & Technology Stack
- **Framework & Structure**: Pure HTML5, modern CSS, and Vanilla JavaScript (ES6+).
- **Styling**: Tailwind CSS (via CDN) paired with custom dark-mode styling in `css/styles.css` tailored for engineering dashboards.
- **Formula Typesetting**: KaTeX (via CDN) for high-performance LaTeX formula rendering with real-time variable substitutions.
- **Dynamic Visualization**: Chart.js (via CDN) with continuous linear coordinates, fill-to-origin multi-region shading, and interactive coordinate probes.
- **Icons**: Lucide Icons (via CDN).
- **Zero build dependencies**: Runs directly in any modern browser or through lightweight static servers.

---

## 📂 Project Structure
```
d:\sat_vibe/
├── index.html          # Main single-page application layout with navigation & modules
├── css/
│   └── styles.css      # Glassmorphism, typography, formula cards & layout styling
├── js/
│   └── app.js          # SPA navigation router, Normal CDF math engine, inputs sync, and Chart.js visualizers
└── README.md           # Documentation, engineering specifications & tutorial guide
```

---

## ⚙️ Module 1: Normal Distribution — Manufacturing Quality Control (Implemented)

### 1. Illustrative Benchmark Scenario:
- **Component**: Precision CNC-turned steel automotive drive shafts.
- **Target Diameter**: $\mu = 10.00\text{ mm}$
- **Process Standard Deviation**: $\sigma = 0.050\text{ mm}$
- **Lower Specification Limit (LSL)**: $9.90\text{ mm}$
- **Upper Specification Limit (USL)**: $10.10\text{ mm}$
- **Selected Inspection Probe**: $x = 10.00\text{ mm}$

### 2. Interactive Input Controls:
- **Process Mean ($\mu$)**: Slider & numeric input (`9.70 mm – 10.30 mm`, step `0.005 mm`).
- **Standard Deviation ($\sigma$)**: Slider & numeric input (`0.010 mm – 0.150 mm`, step `0.002 mm`).
- **Lower Limit ($LSL$)**: Slider & numeric input (`9.60 mm – 10.00 mm`, step `0.005 mm`).
- **Upper Limit ($USL$)**: Slider & numeric input (`10.00 mm – 10.40 mm`, step `0.005 mm`).
- **Selected Diameter ($x$)**: Slider & numeric input (`9.75 mm – 10.25 mm`, step `0.005 mm`).
- **Presets**:
  1. *Benchmark*: $\mu=10.00$, $\sigma=0.050$, $LSL=9.90$, $USL=10.10$, $x=10.00$.
  2. *Six-Sigma Precision*: $\mu=10.00$, $\sigma=0.025$, $LSL=9.90$, $USL=10.10$, $x=10.00$.
  3. *Tool-Wear Drift*: $\mu=10.04$, $\sigma=0.045$, $LSL=9.90$, $USL=10.10$, $x=10.04$.
  4. *Wide Tolerance*: $\mu=10.00$, $\sigma=0.050$, $LSL=9.85$, $USL=10.15$, $x=10.00$.

### 3. Validation Rules:
- **$\sigma > 0$**: Standard deviation must be strictly positive.
- **$LSL < USL$**: Lower specification limit must be strictly less than the upper specification limit.
- **Real-Time Warning Banner**: Highlights faulty inputs in red and prevents calculation/chart errors.

### 4. Mathematical Engine & Formulas:
- **High-Precision Error Function ($\text{erf}$)**: Abramowitz and Stegun 7.1.26 ($|\epsilon| \le 1.5 \times 10^{-7}$).
- **Standard Normal CDF**: $\Phi(z) = \frac{1}{2}\left[1 + \text{erf}\left(\frac{z}{\sqrt{2}}\right)\right]$.
- **Probability Density at $x$**:
  $$f(x) = \frac{1}{\sigma \sqrt{2\pi}} \exp\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)$$
  *At $x = 10.00\text{ mm}$ for benchmark: $f(10.00) = 7.9788\text{ mm}^{-1}$.*
- **In-Specification Interval Probability (Yield)**:
  $$P(LSL \le X \le USL) = \Phi\left(\frac{USL - \mu}{\sigma}\right) - \Phi\left(\frac{LSL - \mu}{\sigma}\right)$$
  *For benchmark: $\Phi(+2.00) - \Phi(-2.00) = 0.97725 - 0.02275 = 95.4500\%$.*
- **Probability Below Lower Limit (Scrap)**:
  $$P(X < LSL) = \Phi\left(\frac{LSL - \mu}{\sigma}\right)$$
  *For benchmark: $\Phi(-2.00) = 2.2750\%$ ($22,750\text{ PPM}$).*
- **Probability Above Upper Limit (Rework)**:
  $$P(X > USL) = 1 - \Phi\left(\frac{USL - \mu}{\sigma}\right)$$
  *For benchmark: $1 - \Phi(+2.00) = 2.2750\%$ ($22,750\text{ PPM}$).*
- **Expected Defective Percentage**:
  $$P(\text{Defective}) = P(X < LSL) + P(X > USL) = 4.5500\% \quad (45,500\text{ PPM})$$
- **Process Capability**:
  $$C_p = \frac{USL - LSL}{6\sigma} = \frac{0.20}{0.30} = 0.667$$
  $$C_{pk} = \min\left(\frac{USL - \mu}{3\sigma}, \frac{\mu - LSL}{3\sigma}\right) = 0.667$$

### 5. Dynamic Chart Visualization with Multi-Region Shading:
- **Undersized Scrap ($X < LSL$)**: Crimson Red shaded area (`rgba(239, 68, 68, 0.40)`).
- **Acceptable In-Spec ($LSL \le X \le USL$)**: Emerald Green shaded area (`rgba(16, 185, 129, 0.40)`).
- **Oversized Rework ($X > USL$)**: Amber Yellow shaded area (`rgba(245, 158, 11, 0.40)`).
- **Normal Bell Curve Outline**: Violet/Indigo line (`#818cf8`, 2.5px).
- **Inspection Diameter Marker**: Hot-pink probe point at $(x, f(x))$ with live coordinate tooltip.

### 6. Plain-Language Quality-Control Interpretation:
- Contextual interpretation cards updating in real-time:
  - **Process Health Verdict**: Classifies manufacturing line into *Incapable ($C_p < 1.0$)*, *Marginal ($1.0 \le C_p < 1.33$)*, *Capable ($C_p \ge 1.33$)*, or *Six-Sigma ($C_p \ge 2.0$)*.
  - **Financial Cost Realism**: Explains the physical difference between scrap (undersized shafts lack metal and must be discarded, 100% loss) vs rework (oversized shafts require re-chucking on lathes for finish skimming).
  - **Actionable Engineering Remedy**: Computes the exact standard deviation reduction required (e.g. reducing $\sigma$ from $0.05\text{ mm}$ to $\le 0.025\text{ mm}$) to achieve world-class Six Sigma yields.
  - **AIML & Modern Vision Connection**: Ties Gaussian likelihood bounds to computer vision automated optical inspection (AOI) classification and anomaly detection.

---

## 💻 How to Run
Open [index.html](file:///d:/sat_vibe/index.html) directly in any browser, or run:
```powershell
python -m http.server 8000
```
Then navigate to `http://localhost:8000`.
