/**
 * Continuous Probability Distributions: Industry Applications
 * Application Router, Math Engine, Interactive Calculations & Visualizations
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initKaTeX();
  initNormalDistributionModule();
  initExponentialChart();
  initCltChart();
  initPlaceholderInputs();
});

// Global state
let currentView = 'home';
const chartInstances = {};

/* ========================================================================== */
/* 1. NAVIGATION & ROUTING                                                    */
/* ========================================================================== */

function initNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const navTabsMobile = document.querySelectorAll('.nav-tab-mobile');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  // Desktop Navigation
  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('data-target');
      switchView(target);
    });
  });

  // Mobile Navigation
  navTabsMobile.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const target = tab.getAttribute('data-target');
      switchView(target);
      if (mobileMenu) {
        mobileMenu.classList.add('hidden');
      }
    });
  });

  // Mobile Menu Toggle
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Quick navigation buttons
  document.querySelectorAll('[data-navigate]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-navigate');
      switchView(target);
    });
  });

  // Handle URL hash if provided
  const hash = window.location.hash.replace('#', '');
  if (['home', 'normal', 'exponential', 'clt'].includes(hash)) {
    switchView(hash);
  }
}

function switchView(viewId) {
  currentView = viewId;
  window.location.hash = viewId;

  // Update sections visibility
  document.querySelectorAll('.page-view').forEach(view => {
    if (view.id === `${viewId}-view`) {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }
  });

  // Update Desktop Nav Active States
  document.querySelectorAll('.nav-tab').forEach(tab => {
    if (tab.getAttribute('data-target') === viewId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Update Mobile Nav Active States
  document.querySelectorAll('.nav-tab-mobile').forEach(tab => {
    if (tab.getAttribute('data-target') === viewId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-render math expressions and resize charts on view switch
  setTimeout(() => {
    initKaTeX();
    if (viewId === 'normal' && chartInstances.normal) {
      chartInstances.normal.resize();
      chartInstances.normal.update();
    }
    if (viewId === 'exponential' && chartInstances.exponential) chartInstances.exponential.resize();
    if (viewId === 'clt' && chartInstances.clt) chartInstances.clt.resize();
  }, 60);
}

function initKaTeX() {
  if (window.renderMathInElement) {
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  }
}

/* ========================================================================== */
/* 2. MATHEMATICAL FOUNDATIONS & NORMAL CDF / PDF ENGINE                      */
/* ========================================================================== */

/**
 * High-Precision Gauss Error Function (erf)
 * Abramowitz & Stegun approximation formula 7.1.26
 * Maximum error |epsilon(x)| <= 1.5e-7
 */
function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

/**
 * Standard Normal CDF: Phi(z) = P(Z <= z) for Z ~ N(0, 1)
 */
function standardNormalCdf(z) {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

/**
 * Normal Cumulative Distribution Function for X ~ N(mean, std)
 */
function normalCdf(x, mean, std) {
  if (std <= 0) return 0;
  const z = (x - mean) / std;
  return standardNormalCdf(z);
}

/**
 * Normal Probability Density Function: f(x; mu, sigma)
 */
function normalPdf(x, mean, std) {
  if (std <= 0) return 0;
  const z = (x - mean) / std;
  return (1.0 / (std * Math.sqrt(2.0 * Math.PI))) * Math.exp(-0.5 * z * z);
}

/* ========================================================================== */
/* 3. NORMAL DISTRIBUTION — MANUFACTURING QUALITY CONTROL MODULE              */
/* ========================================================================== */

// Illustrative Benchmark Default State: Target Shaft Diameter
const normalState = {
  mean: 10.00,
  std: 0.050,
  lsl: 9.90,
  usl: 10.10,
  x: 10.00
};

function initNormalDistributionModule() {
  initNormalChart();
  bindNormalInputs();
  bindNormalPresets();
  updateNormalModule(); // Initial calculation and chart render
}

/**
 * Bind two-way synced slider and numeric inputs with real-time recalculation
 */
function bindNormalInputs() {
  const controls = [
    { slider: 'normal-mean', num: 'normal-mean-num', key: 'mean' },
    { slider: 'normal-std', num: 'normal-std-num', key: 'std' },
    { slider: 'normal-lsl', num: 'normal-lsl-num', key: 'lsl' },
    { slider: 'normal-usl', num: 'normal-usl-num', key: 'usl' },
    { slider: 'normal-x', num: 'normal-x-num', key: 'x' }
  ];

  controls.forEach(ctrl => {
    const sliderEl = document.getElementById(ctrl.slider);
    const numEl = document.getElementById(ctrl.num);

    if (sliderEl && numEl) {
      // Slider input event -> updates number input and state
      sliderEl.addEventListener('input', () => {
        const val = parseFloat(sliderEl.value);
        numEl.value = val.toFixed(ctrl.key === 'std' ? 3 : 2);
        normalState[ctrl.key] = val;
        updateNormalModule();
      });

      // Number input event -> updates slider and state
      numEl.addEventListener('input', () => {
        const val = parseFloat(numEl.value);
        if (!isNaN(val)) {
          normalState[ctrl.key] = val;
          // Clamp slider position if within range
          if (val >= parseFloat(sliderEl.min) && val <= parseFloat(sliderEl.max)) {
            sliderEl.value = val;
          }
          updateNormalModule();
        }
      });
    }
  });
}

/**
 * Preset button handlers
 */
function bindNormalPresets() {
  document.querySelectorAll('[data-preset]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const preset = btn.getAttribute('data-preset');
      applyNormalPreset(preset);
    });
  });
}

function applyNormalPreset(preset) {
  if (preset === 'shaft-standard') {
    // Illustrative Example from problem specification
    setNormalInputs({ mean: 10.00, std: 0.050, lsl: 9.90, usl: 10.10, x: 10.00 });
  } else if (preset === 'six-sigma') {
    // Six-Sigma Quality benchmark
    setNormalInputs({ mean: 10.00, std: 0.025, lsl: 9.90, usl: 10.10, x: 10.00 });
  } else if (preset === 'tool-wear') {
    // Tool wear drift scenario
    setNormalInputs({ mean: 10.04, std: 0.045, lsl: 9.90, usl: 10.10, x: 10.04 });
  } else if (preset === 'wide-tolerance') {
    // Looser specification limits
    setNormalInputs({ mean: 10.00, std: 0.050, lsl: 9.85, usl: 10.15, x: 10.00 });
  }
}

function setNormalInputs({ mean, std, lsl, usl, x }) {
  normalState.mean = mean;
  normalState.std = std;
  normalState.lsl = lsl;
  normalState.usl = usl;
  normalState.x = x;

  setCtrlValue('normal-mean', 'normal-mean-num', mean, 2);
  setCtrlValue('normal-std', 'normal-std-num', std, 3);
  setCtrlValue('normal-lsl', 'normal-lsl-num', lsl, 2);
  setCtrlValue('normal-usl', 'normal-usl-num', usl, 2);
  setCtrlValue('normal-x', 'normal-x-num', x, 2);

  updateNormalModule();
}

function setCtrlValue(sliderId, numId, value, decimals) {
  const slider = document.getElementById(sliderId);
  const num = document.getElementById(numId);
  if (slider) slider.value = value;
  if (num) num.value = value.toFixed(decimals);
}

/**
 * Validation Logic
 * Validates:
 * 1. Standard deviation sigma must be strictly positive (sigma > 0).
 * 2. Lower Specification Limit (LSL) must be strictly less than Upper Specification Limit (USL).
 */
function validateNormalInputs(mean, std, lsl, usl) {
  const errors = [];
  const invalidFields = [];

  if (isNaN(std) || std <= 0) {
    errors.push('Standard deviation (σ) must be strictly positive (σ > 0).');
    invalidFields.push('normal-std-wrapper');
  }

  if (isNaN(lsl) || isNaN(usl) || lsl >= usl) {
    errors.push(`Lower Specification Limit (LSL = ${isNaN(lsl) ? '—' : lsl.toFixed(2)} mm) must be strictly less than Upper Specification Limit (USL = ${isNaN(usl) ? '—' : usl.toFixed(2)} mm).`);
    invalidFields.push('normal-lsl-wrapper');
    invalidFields.push('normal-usl-wrapper');
  }

  return { isValid: errors.length === 0, errors, invalidFields };
}

/**
 * Master update function for Normal Distribution calculations and dynamic visualization
 */
function updateNormalModule() {
  const { mean, std, lsl, usl, x } = normalState;
  const validation = validateNormalInputs(mean, std, lsl, usl);

  const alertEl = document.getElementById('normal-validation-alert');
  const alertMsgEl = document.getElementById('normal-validation-message');
  const statusBadge = document.getElementById('normal-status-badge');

  // Reset error border highlights
  ['normal-std-wrapper', 'normal-lsl-wrapper', 'normal-usl-wrapper'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('border-rose-500', 'ring-1', 'ring-rose-500');
    }
  });

  if (!validation.isValid) {
    // Show validation error banner
    if (alertEl && alertMsgEl) {
      alertEl.classList.remove('hidden');
      alertMsgEl.innerHTML = validation.errors.map(err => `<div>• ${err}</div>`).join('');
    }
    // Highlight invalid inputs
    validation.invalidFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('border-rose-500', 'ring-1', 'ring-rose-500');
      }
    });
    // Set status badge to warning
    if (statusBadge) {
      statusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Invalid Inputs';
      statusBadge.className = 'text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-medium border border-rose-500/30 flex items-center gap-1';
    }
    return;
  }

  // Hide validation banner if valid
  if (alertEl) alertEl.classList.add('hidden');
  if (statusBadge) {
    statusBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live Synced';
    statusBadge.className = 'text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 flex items-center gap-1';
  }

  // ==========================================
  // MATHEMATICAL CALCULATIONS
  // ==========================================

  // 1. Z-scores
  const zLsl = (lsl - mean) / std;
  const zUsl = (usl - mean) / std;

  // 2. Normal CDF Interval Probabilities
  const cdfLsl = standardNormalCdf(zLsl);
  const cdfUsl = standardNormalCdf(zUsl);

  // Probability below lower limit (Undersized Scrap)
  const pScrap = cdfLsl;

  // Probability above upper limit (Oversized Rework)
  const pRework = Math.max(0, 1.0 - cdfUsl);

  // Probability between LSL and USL (In-Spec Yield)
  const pInSpec = Math.max(0, Math.min(1.0, cdfUsl - cdfLsl));

  // Expected percentage of defective products (Scrap + Rework)
  const pDefect = pScrap + pRework;

  // Parts Per Million (PPM)
  const ppmScrap = Math.round(pScrap * 1_000_000);
  const ppmRework = Math.round(pRework * 1_000_000);
  const ppmDefect = Math.round(pDefect * 1_000_000);

  // 3. Probability Density at Selected Diameter x
  const pdfVal = normalPdf(x, mean, std);

  // 4. Industrial Capability Indices
  const cp = (usl - lsl) / (6.0 * std);
  const cpu = (usl - mean) / (3.0 * std);
  const cpl = (mean - lsl) / (3.0 * std);
  const cpk = Math.min(cpu, cpl);
  const toleranceSpread = usl - lsl;

  // ==========================================
  // UPDATE DOM CALCULATION METRIC CARDS
  // ==========================================

  setText('normal-calc-pdf', `${pdfVal.toFixed(4)} `);
  const pdfSpan = document.createElement('span');
  pdfSpan.className = 'text-xs font-normal text-slate-400';
  pdfSpan.textContent = 'mm⁻¹';
  const pdfCard = document.getElementById('normal-calc-pdf');
  if (pdfCard) {
    pdfCard.innerHTML = `${pdfVal.toFixed(4)} <span class="text-xs font-normal text-slate-400">mm⁻¹</span>`;
  }

  setText('normal-calc-x-label', `x = ${x.toFixed(2)} mm`);
  setText('normal-calc-inspec', `${(pInSpec * 100).toFixed(4)}%`);
  setText('normal-calc-inspec-prob', pInSpec.toFixed(4));
  setText('normal-calc-scrap', `${(pScrap * 100).toFixed(4)}%`);
  setText('normal-calc-scrap-ppm', `${ppmScrap.toLocaleString()} PPM`);
  setText('normal-calc-rework', `${(pRework * 100).toFixed(4)}%`);
  setText('normal-calc-rework-ppm', `${ppmRework.toLocaleString()} PPM`);
  setText('normal-calc-defect', `${(pDefect * 100).toFixed(4)}%`);
  setText('normal-calc-defect-ppm', `${ppmDefect.toLocaleString()} PPM`);

  setText('normal-calc-zlsl', zLsl >= 0 ? `+${zLsl.toFixed(3)}` : zLsl.toFixed(3));
  setText('normal-calc-zusl', zUsl >= 0 ? `+${zUsl.toFixed(3)}` : zUsl.toFixed(3));
  setText('normal-calc-cp', cp.toFixed(3));
  setText('normal-calc-cpk', cpk.toFixed(3));

  setText('normal-tolerance-width', `${toleranceSpread.toFixed(3)} mm (±${(toleranceSpread / 2).toFixed(3)} mm)`);

  // Chart Legends & Axis Labels
  setText('legend-scrap-pct', `${(pScrap * 100).toFixed(2)}%`);
  setText('legend-inspec-pct', `${(pInSpec * 100).toFixed(2)}%`);
  setText('legend-rework-pct', `${(pRework * 100).toFixed(2)}%`);

  setText('lbl-chart-lsl', `${lsl.toFixed(2)} mm`);
  setText('lbl-chart-mean', `${mean.toFixed(2)} mm`);
  setText('lbl-chart-usl', `${usl.toFixed(2)} mm`);

  // ==========================================
  // UPDATE DYNAMIC FORMULAS SUBSTITUTION
  // ==========================================
  updateNormalFormulaSubstitution(mean, std, lsl, usl, x, zLsl, zUsl, cdfLsl, cdfUsl, pInSpec, pdfVal);

  // ==========================================
  // UPDATE QUALITY-CONTROL INTERPRETATION
  // ==========================================
  updateNormalInterpretation(mean, std, lsl, usl, cp, cpk, pInSpec, pScrap, pRework, pDefect, ppmDefect);

  // ==========================================
  // UPDATE DYNAMIC CHART WITH MULTI-REGION SHADING
  // ==========================================
  updateNormalChart(mean, std, lsl, usl, x, pdfVal);
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/**
 * Render dynamic mathematical formula substitution using KaTeX
 */
function updateNormalFormulaSubstitution(mean, std, lsl, usl, x, zLsl, zUsl, cdfLsl, cdfUsl, pInSpec, pdfVal) {
  const container = document.getElementById('normal-live-substitution');
  if (!container || !window.katex) return;

  const signZLsl = zLsl >= 0 ? `+${zLsl.toFixed(3)}` : zLsl.toFixed(3);
  const signZUsl = zUsl >= 0 ? `+${zUsl.toFixed(3)}` : zUsl.toFixed(3);

  const latexContent = `
    \\begin{aligned}
    &Z_{\\text{LSL}} = \\frac{${lsl.toFixed(2)} - ${mean.toFixed(2)}}{${std.toFixed(3)}} = ${signZLsl}, \\quad 
     Z_{\\text{USL}} = \\frac{${usl.toFixed(2)} - ${mean.toFixed(2)}}{${std.toFixed(3)}} = ${signZUsl} \\\\[4pt]
    &P(${lsl.toFixed(2)} \\le X \\le ${usl.toFixed(2)}) = \\Phi(${signZUsl}) - \\Phi(${signZLsl}) = ${cdfUsl.toFixed(4)} - ${cdfLsl.toFixed(4)} = ${(pInSpec * 100).toFixed(2)}\\% \\\\[4pt]
    &f(${x.toFixed(2)}) = \\frac{1}{${std.toFixed(3)}\\sqrt{2\\pi}} \\exp\\left(-\\frac{(${x.toFixed(2)} - ${mean.toFixed(2)})^2}{2(${std.toFixed(3)})^2}\\right) = ${pdfVal.toFixed(4)} \\text{ mm}^{-1}
    \\end{aligned}
  `;

  try {
    katex.render(latexContent, container, { displayMode: true, throwOnError: false });
  } catch (err) {
    console.error('KaTeX rendering error:', err);
  }
}

/**
 * Render contextual, plain-language Quality-Control interpretation
 */
function updateNormalInterpretation(mean, std, lsl, usl, cp, cpk, pInSpec, pScrap, pRework, pDefect, ppmDefect) {
  const healthBadge = document.getElementById('normal-health-badge');
  const healthCallout = document.getElementById('normal-health-callout');
  const narrativeEl = document.getElementById('normal-dynamic-narrative');
  const scrapReworkEl = document.getElementById('normal-interp-scraprework');
  const fixEl = document.getElementById('normal-interp-fix');

  let statusTitle = '';
  let statusBadgeClass = '';
  let narrativeText = '';

  const defectPct = (pDefect * 100).toFixed(2);
  const scrapPct = (pScrap * 100).toFixed(2);
  const reworkPct = (pRework * 100).toFixed(2);
  const yieldPct = (pInSpec * 100).toFixed(2);

  if (cp >= 2.0 && cpk >= 1.5) {
    statusTitle = 'World-Class Six Sigma Quality (Cp ≥ 2.0)';
    statusBadgeClass = 'text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1.5';
    if (healthCallout) healthCallout.className = 'p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 leading-relaxed';
    narrativeText = `The manufacturing process exhibits exceptional stability. With Cp = ${cp.toFixed(2)} and Cpk = ${cpk.toFixed(2)}, the natural spread (6σ = ${(6 * std).toFixed(3)} mm) is comfortably nested well inside the tolerance window (${(usl - lsl).toFixed(3)} mm). Total defect rate is exceptionally low (${ppmDefect} PPM). Defective parts are virtually eliminated.`;
  } else if (cp >= 1.33 && cpk >= 1.33) {
    statusTitle = 'Industrially Capable (Cp ≥ 1.33)';
    statusBadgeClass = 'text-xs px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold flex items-center gap-1.5';
    if (healthCallout) healthCallout.className = 'p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-xs text-indigo-200 leading-relaxed';
    narrativeText = `Standard 4-Sigma industrial capability achieved. With Cp = ${cp.toFixed(2)} and Cpk = ${cpk.toFixed(2)}, approximately ${yieldPct}% of shafts satisfy mechanical bearing tolerances. Process variance is adequately controlled for commercial manufacturing lines.`;
  } else if (cp >= 1.0) {
    statusTitle = 'Marginal Process Capability (1.0 ≤ Cp < 1.33)';
    statusBadgeClass = 'text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1.5';
    if (healthCallout) healthCallout.className = 'p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 leading-relaxed';
    narrativeText = `Warning: The process spread closely touches specification boundaries (Cp = ${cp.toFixed(2)}). An expected ${defectPct}% of manufactured shafts fail inspection (${ppmDefect} PPM). Any slight machine thermal expansion or tool wear drift will immediately spike defective output.`;
  } else {
    statusTitle = 'Incapable Process (Cp < 1.0) — High Scrap Risk';
    statusBadgeClass = 'text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold flex items-center gap-1.5';
    if (healthCallout) healthCallout.className = 'p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 leading-relaxed';
    narrativeText = `Critical Defect Alert: The manufacturing spread (6σ = ${(6 * std).toFixed(3)} mm) exceeds the allowable tolerance window (${(usl - lsl).toFixed(3)} mm). The defect rate is ${defectPct}% (${ppmDefect} PPM), meaning approximately 1 in every ${Math.round(100 / Math.max(0.01, pDefect * 100))} manufactured shafts fails specification! Continuous sorting and machine calibration are mandatory.`;
  }

  if (healthBadge) {
    healthBadge.className = statusBadgeClass;
    healthBadge.innerHTML = `<i data-lucide="info" class="w-3.5 h-3.5"></i> ${statusTitle}`;
  }

  if (narrativeEl) {
    narrativeEl.innerHTML = narrativeText;
  }

  if (scrapReworkEl) {
    scrapReworkEl.innerHTML = `
      <strong>${scrapPct}% Scrap (Undersized):</strong> Shafts under ${lsl.toFixed(2)} mm lack material and cannot be salvaged. They represent complete loss of raw steel and CNC cycle time.<br>
      <strong>${reworkPct}% Rework (Oversized):</strong> Shafts over ${usl.toFixed(2)} mm can theoretically be skimmed down, but tie up machine operators and create factory bottlenecks.
    `;
  }

  if (fixEl) {
    const targetSixSigmaStd = (usl - lsl) / 12.0;
    fixEl.innerHTML = `
      To reach <strong>Six-Sigma quality</strong> (${(usl - lsl).toFixed(2)} mm tolerance band), machine vibration and tool deflection must be reduced to achieve a standard deviation of <strong>σ ≤ ${targetSixSigmaStd.toFixed(3)} mm</strong>. This would drive defects from ${ppmDefect.toLocaleString()} PPM down to &le; 3.4 PPM.
    `;
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

/* ========================================================================== */
/* 4. DYNAMIC CHART.JS BELL CURVE WITH 3-REGION COLOR SHADING                 */
/* ========================================================================== */

function initNormalChart() {
  const canvas = document.getElementById('normal-distribution-chart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  chartInstances.normal = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        // Dataset 0: Undersized Scrap Region (Red fill)
        {
          label: 'Undersized Scrap (X < LSL)',
          data: [],
          borderColor: '#ef4444',
          borderWidth: 1.5,
          backgroundColor: 'rgba(239, 68, 68, 0.40)',
          fill: 'origin',
          pointRadius: 0,
          tension: 0
        },
        // Dataset 1: In-Spec Acceptable Region (Emerald Green fill)
        {
          label: 'Acceptable In-Spec (LSL ≤ X ≤ USL)',
          data: [],
          borderColor: '#10b981',
          borderWidth: 1.5,
          backgroundColor: 'rgba(16, 185, 129, 0.40)',
          fill: 'origin',
          pointRadius: 0,
          tension: 0
        },
        // Dataset 2: Oversized Rework Region (Amber fill)
        {
          label: 'Oversized Rework (X > USL)',
          data: [],
          borderColor: '#f59e0b',
          borderWidth: 1.5,
          backgroundColor: 'rgba(245, 158, 11, 0.40)',
          fill: 'origin',
          pointRadius: 0,
          tension: 0
        },
        // Dataset 3: Full Normal PDF Outline Curve (Indigo)
        {
          label: 'Normal PDF f(x)',
          data: [],
          borderColor: '#818cf8',
          borderWidth: 2.5,
          fill: false,
          pointRadius: 0,
          tension: 0
        },
        // Dataset 4: Selected Inspection Diameter Probe (Pink marker point)
        {
          label: 'Selected Diameter x',
          data: [],
          borderColor: '#ffffff',
          borderWidth: 2,
          backgroundColor: '#f43f5e',
          pointRadius: 6,
          pointHoverRadius: 8,
          showLine: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0 // Instantaneous real-time update on slider drag
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#cbd5e1',
            font: { family: 'Inter', size: 11 },
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: false
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#e2e8f0',
          bodyColor: '#94a3b8',
          borderColor: '#334155',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            title: function (items) {
              if (!items.length) return '';
              const xVal = items[0].parsed.x;
              return `Diameter: ${xVal.toFixed(3)} mm`;
            },
            label: function (context) {
              const xVal = context.parsed.x;
              const yVal = context.parsed.y;
              const { lsl, usl } = normalState;
              let region = '';
              if (xVal < lsl) region = ' [Undersized Scrap]';
              else if (xVal > usl) region = ' [Oversized Rework]';
              else region = ' [Acceptable In-Spec]';

              return `Density f(x): ${yVal.toFixed(4)} mm⁻¹${region}`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Shaft Diameter Dimension (mm)',
            color: '#94a3b8',
            font: { size: 12, weight: '500' }
          },
          grid: { color: '#1e293b' },
          ticks: {
            color: '#94a3b8',
            callback: function (val) {
              return val.toFixed(2);
            }
          }
        },
        y: {
          min: 0,
          title: {
            display: true,
            text: 'Probability Density f(x) (mm⁻¹)',
            color: '#94a3b8',
            font: { size: 12, weight: '500' }
          },
          grid: { color: '#1e293b' },
          ticks: {
            color: '#94a3b8',
            callback: function (val) {
              return val.toFixed(1);
            }
          }
        }
      }
    }
  });
}

/**
 * Regenerate data points and update Chart.js datasets with 3 shaded regions
 */
function updateNormalChart(mean, std, lsl, usl, selX, selPdf) {
  if (!chartInstances.normal) return;

  const chart = chartInstances.normal;
  const xMin = Math.min(mean - 3.8 * std, lsl - 0.3 * std);
  const xMax = Math.max(mean + 3.8 * std, usl + 0.3 * std);
  const steps = 240;
  const step = (xMax - xMin) / steps;

  const belowLsl = [];
  const inSpec = [];
  const aboveUsl = [];
  const fullCurve = [];

  for (let i = 0; i <= steps; i++) {
    const curX = xMin + i * step;
    const curY = normalPdf(curX, mean, std);
    const pt = { x: parseFloat(curX.toFixed(4)), y: curY };

    fullCurve.push(pt);

    if (curX <= lsl) {
      belowLsl.push(pt);
    }
    if (curX >= lsl && curX <= usl) {
      inSpec.push(pt);
    }
    if (curX >= usl) {
      aboveUsl.push(pt);
    }
  }

  // Ensure exact boundary continuity at LSL
  if (lsl >= xMin && lsl <= xMax) {
    const yLsl = normalPdf(lsl, mean, std);
    const ptLsl = { x: parseFloat(lsl.toFixed(4)), y: yLsl };
    if (!belowLsl.some(p => Math.abs(p.x - lsl) < 1e-4)) belowLsl.push(ptLsl);
    if (!inSpec.some(p => Math.abs(p.x - lsl) < 1e-4)) inSpec.unshift(ptLsl);
  }

  // Ensure exact boundary continuity at USL
  if (usl >= xMin && usl <= xMax) {
    const yUsl = normalPdf(usl, mean, std);
    const ptUsl = { x: parseFloat(usl.toFixed(4)), y: yUsl };
    if (!inSpec.some(p => Math.abs(p.x - usl) < 1e-4)) inSpec.push(ptUsl);
    if (!aboveUsl.some(p => Math.abs(p.x - usl) < 1e-4)) aboveUsl.unshift(ptUsl);
  }

  // Update datasets
  chart.data.datasets[0].data = belowLsl;
  chart.data.datasets[1].data = inSpec;
  chart.data.datasets[2].data = aboveUsl;
  chart.data.datasets[3].data = fullCurve;
  chart.data.datasets[4].data = [{ x: parseFloat(selX.toFixed(3)), y: selPdf }];

  // Update axis limits
  chart.options.scales.x.min = parseFloat(xMin.toFixed(3));
  chart.options.scales.x.max = parseFloat(xMax.toFixed(3));

  // Render chart update smoothly
  chart.update('none');
}

/* ========================================================================== */
/* 5. PLACEHOLDER / STARTER CHARTS (EXPONENTIAL & CLT MODULES)                 */
/* ========================================================================== */

function initPlaceholderInputs() {
  syncInputWithDisplay('exp-lambda', 'exp-lambda-val');
  syncInputWithDisplay('exp-time', 'exp-time-val');
  syncInputWithDisplay('clt-samplesize', 'clt-samplesize-val');
  syncInputWithDisplay('clt-reps', 'clt-reps-val');
}

function syncInputWithDisplay(inputId, displayId) {
  const input = document.getElementById(inputId);
  const display = document.getElementById(displayId);
  if (input && display) {
    input.addEventListener('input', () => {
      display.textContent = input.value;
    });
  }
}

function initExponentialChart() {
  const canvas = document.getElementById('exponential-distribution-chart');
  if (!canvas) return;

  const lambda = 4.0;
  const { labels, dataPoints } = generateExponentialData(lambda);

  chartInstances.exponential = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Inter-arrival PDF f(t) = λe^(-λt)',
          data: dataPoints,
          borderColor: '#38bdf8',
          borderWidth: 2.5,
          backgroundColor: 'rgba(56, 189, 248, 0.18)',
          fill: true,
          tension: 0.35,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#cbd5e1', font: { family: 'Inter' } } },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#e2e8f0',
          bodyColor: '#94a3b8',
          borderColor: '#475569',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Inter-arrival Time t (seconds)', color: '#94a3b8' },
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          title: { display: true, text: 'Density f(t)', color: '#94a3b8' },
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

function generateExponentialData(lambda) {
  const points = 60;
  const maxTime = 4 / lambda;
  const step = maxTime / points;

  const labels = [];
  const dataPoints = [];

  for (let i = 0; i <= points; i++) {
    const t = i * step;
    labels.push(t.toFixed(3));
    const density = lambda * Math.exp(-lambda * t);
    dataPoints.push(density);
  }

  return { labels, dataPoints };
}

function initCltChart() {
  const canvas = document.getElementById('clt-distribution-chart');
  if (!canvas) return;

  const sampleSize = 30;
  const reps = 500;
  const { labels, sampleMeansData, populationCurve } = generateCltData(sampleSize, reps);

  chartInstances.clt = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Sampling Distribution of Means x̄',
          data: sampleMeansData,
          backgroundColor: 'rgba(16, 185, 129, 0.45)',
          borderColor: '#10b981',
          borderWidth: 1,
          barPercentage: 0.95
        },
        {
          type: 'line',
          label: 'Theoretical Normal Fit N(μ, σ²/n)',
          data: populationCurve,
          borderColor: '#fbbf24',
          borderWidth: 2.5,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#cbd5e1', font: { family: 'Inter' } } },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#e2e8f0',
          bodyColor: '#94a3b8',
          borderColor: '#475569',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Batch Average Picking Time x̄ (mins)', color: '#94a3b8' },
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' }
        },
        y: {
          title: { display: true, text: 'Frequency / Density', color: '#94a3b8' },
          grid: { color: '#334155' },
          ticks: { color: '#94a3b8' }
        }
      }
    }
  });
}

function generateCltData(sampleSize, reps) {
  const popMean = 12.0;
  const popStd = 6.0;
  const se = popStd / Math.sqrt(sampleSize);

  const bins = 25;
  const minX = popMean - 3.5 * se;
  const maxX = popMean + 3.5 * se;
  const step = (maxX - minX) / bins;

  const labels = [];
  const sampleMeansData = [];
  const populationCurve = [];

  for (let i = 0; i < bins; i++) {
    const xMid = minX + (i + 0.5) * step;
    labels.push(xMid.toFixed(1));

    const exponent = -0.5 * Math.pow((xMid - popMean) / se, 2);
    const normalVal = (1 / (se * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

    const simulatedFreq = normalVal * reps * step * 0.95 + (Math.random() * 2 - 1);
    sampleMeansData.push(Math.max(0, parseFloat(simulatedFreq.toFixed(1))));
    populationCurve.push(parseFloat((normalVal * reps * step).toFixed(1)));
  }

  return { labels, sampleMeansData, populationCurve };
}
