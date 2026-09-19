import React, { useState } from 'react';
import { 
  FileText, 
  GraduationCap, 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  BookOpen, 
  HelpCircle,
  Sparkles,
  Search
} from 'lucide-react';

export const AcademicReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'viva'>('report');
  const [expandedVivaId, setExpandedVivaId] = useState<number | null>(1);
  const [vivaSearch, setVivaSearch] = useState<string>('');

  const vivaQuestions = [
    {
      id: 1,
      question: 'Why choose Random Forest Regressor as the baseline for this problem?',
      answer: 'Random Forest Regressor was selected because residential energy consumption involves complex, non-linear interactions between weather, indoor psychrometric states (temperature and relative humidity), and human behavioral schedules. As a bagging ensemble of de-correlated decision trees, Random Forest is robust to extreme outliers, handles high multicollinearity among adjacent room sensors without variance inflation, requires no monotonic feature scaling, and inherently resists overfitting via out-of-bag variance reduction.'
    },
    {
      id: 2,
      question: 'What does an R² score of 0.5468 mean in this project? Is it "54.68% accuracy"?',
      answer: 'No, it is strictly incorrect to describe R² = 0.5468 as "54.68% accuracy." In mathematical statistics, the coefficient of determination R² measures the proportion of variance in the target variable (appliance Watt-hours) that is predictable from the input features relative to a naive mean baseline. An R² of 0.5468 means that 54.68% of the variability in household appliance consumption is captured by the model on the unseen chronological holdout test set, with the remaining ~45.32% driven by unmeasured human behavioral choices (e.g. ad-hoc kettle usage, personal electronics).'
    },
    {
      id: 3,
      question: 'Why evaluate both MAE and RMSE simultaneously?',
      answer: 'MAE (Mean Absolute Error, 32.03 Wh) provides a linear, unweighted measure of average prediction deviation, which is easy to interpret operationally. RMSE (Root Mean Squared Error, 67.34 Wh), by squaring residuals prior to averaging, penalizes large isolated error spikes heavily. Because appliance energy exhibits occasional high-wattage bursts (e.g. tumble dryer heating elements drawing 1,000+ W for 10 minutes), the ratio of RMSE to MAE (~2.10) quantifies the dispersion and severity of infrequent outlier spikes.'
    },
    {
      id: 4,
      question: 'What is data leakage and how was it rigorously prevented in this project?',
      answer: 'Data leakage occurs when information from the test partition leaks into the training pipeline. In time-series energy records, applying standard random shuffle K-Fold splits introduces temporal lookahead bias (training on future timestamps to predict past timestamps). In this study, leakage was prevented by executing a strict chronological 80/20 train/test split: the first 15,788 sequential observations (Jan 11 – May 3) formed the training set, while the final 3,947 observations (May 3 – May 27) served as the unseen holdout evaluation set. Additionally, all preprocessors were fitted exclusively on the training split.'
    },
    {
      id: 5,
      question: 'Does high feature importance for a sensor (e.g. lighting or temperature) imply physical causation?',
      answer: 'No. Feature importance (calculated via Mean Decrease in Impurity / MDI) measures how frequently and effectively a feature splits tree nodes to reduce variance. It reflects predictive correlation, not physical causation. For instance, lighting consumption (lights Wh) has the highest MDI (~19.8%), not because incandescent bulbs physically power the refrigerator or washing machine, but because lighting acts as an informational proxy for active human occupancy in the house.'
    },
    {
      id: 6,
      question: 'What is the critical distinction between a "simulation" and a "genuine future forecast"?',
      answer: 'A genuine future forecast predicts a future target without access to future measurements, requiring either auto-regressive lag features or authentic external forecasts of exogenous inputs (e.g. weather API predictions for tomorrow at 14:00). In contrast, a simulation evaluates what the model would predict given an assumed or user-defined set of environmental parameters. The 24-hour tool in this app is transparently classified as an environmental simulation based on solar progressions and user assumptions.'
    },
    {
      id: 7,
      question: 'Why does the system predict continuous Watt-hours (Wh) rather than kW or kWh?',
      answer: 'The ground truth KAG energy dataset logged cumulative energy consumed over successive 10-minute intervals in Watt-hours (Wh). Because energy is the integral of instantaneous power over time (Energy = Power × Time), predicting Wh per 10-minute period directly preserves the native empirical measurement resolution without introducing numerical quantization artifacts.'
    },
    {
      id: 8,
      question: 'Why were the random synthetic variables rv1 and rv2 retained in the feature matrix during initial training?',
      answer: 'The original researchers (Candanedo et al., 2017) intentionally injected two uniformly distributed pseudo-random variables (rv1 and rv2) into the dataset to serve as an internal control for model overfitting. In our feature importance audit, rv1 and rv2 received negligible MDI scores (~0.009 and ~0.008), empirically confirming that the ensemble decision trees successfully isolated genuine climatic signals without memorizing white noise.'
    },
    {
      id: 9,
      question: 'How do decision trees handle severe multicollinearity among indoor temperature sensors (r > 0.85)?',
      answer: 'Unlike Ordinary Least Squares (OLS) regression where multicollinearity inflates parameter standard errors and produces erratic coefficients, tree-based ensembles (Random Forest, XGBoost) are inherently immune to multicollinearity. At each decision node, Random Forest only evaluates a random subset of m features (typically √p). If two collinear sensors (e.g. T1 Kitchen and T2 Living Room) offer redundant information, the tree splits on whichever provides marginally superior variance reduction without mathematical instability.'
    },
    {
      id: 10,
      question: 'How can this predictive system translate into operational energy savings?',
      answer: 'The system does not physically turn off appliances or generate power. Instead, it provides predictive intelligence that allows facility managers or automated Home Energy Management Systems (HEMS) to shift flexible loads (e.g. laundry drying, dishwasher cycles) away from forecasted peak hours (18:00–21:00) into low-tariff solar or deep-night intervals, dampening peak demand charges.'
    }
  ];

  const filteredViva = vivaQuestions.filter(
    (q) => q.question.toLowerCase().includes(vivaSearch.toLowerCase()) || q.answer.toLowerCase().includes(vivaSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <GraduationCap className="h-3.5 w-3.5 text-emerald-600" />
                Problem-Based Learning (PBL) Documentation
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">IEEE / ACM Publication Format</span>
            </div>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Academic Report & Viva Defense Guide
            </h1>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
              Complete peer-review style project manuscript, methodology disclosures, holdout benchmark tables,
              and 10 comprehensive viva voce oral examination questions with rigorous academic responses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              <Printer className="h-3.5 w-3.5 text-slate-500" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-3 gap-2">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
            activeTab === 'report'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Full Academic Paper (Sections 1.0 – 12.0)</span>
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`flex items-center gap-2 border-b-2 px-3 pb-3 text-xs font-semibold transition ${
            activeTab === 'viva'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Viva Voce Defense Questions & Answers</span>
        </button>
      </div>

      {/* TAB 1: FULL ACADEMIC REPORT */}
      {activeTab === 'report' && (
        <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 sm:p-8 space-y-8 text-slate-800 leading-relaxed text-xs sm:text-sm">
          {/* Paper Title & Metadata */}
          <div className="border-b border-slate-200 pb-6 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Department of Computer Science & Engineering • Machine Learning Capstone
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl max-w-3xl mx-auto">
              Smart Energy Consumption Forecasting: Machine Learning for High-Resolution Residential Load Characterization
            </h2>
            <div className="text-xs text-slate-500 pt-1">
              Dataset: Appliances Energy Prediction (UCI / Kaggle) • Evaluated on 19,735 Chronological 10-Minute Telemetry Logs
            </div>
          </div>

          {/* Abstract Box */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-5 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">Abstract</span>
            <p className="text-xs text-slate-700 leading-relaxed text-justify">
              Accurate short-term forecasting of residential electrical appliance demand is essential for demand-side management,
              microgrid peak alleviation, and home energy management automation. This paper presents an end-to-end regression framework
              applied to a low-energy residential building over a 4.5-month observational window (19,735 records sampled every 10 minutes).
              We systematically compare four machine learning architectures: Random Forest Regressor, XGBoost, LightGBM, and a weighted ensemble.
              To eliminate temporal lookahead bias, models are evaluated on a strict chronological 80/20 holdout test set (3,947 unseen instances).
              The baseline Random Forest achieves a Mean Absolute Error (MAE) of <strong>32.0345 Wh</strong>, a Root Mean Squared Error (RMSE) of <strong>67.3405 Wh</strong>,
              and a coefficient of determination (R²) of <strong>0.5468</strong>, explaining over 54.6% of appliance load variance.
              Feature importance via Mean Decrease in Impurity demonstrates that sub-metered lighting usage (19.8% MDI) and diurnal time indicators (hour of day, 11.2% MDI)
              serve as the strongest predictive proxies for human occupancy, surpassing outdoor weather variables.
            </p>
          </div>

          {/* Section 1.0 Problem Statement */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-700">1.0</span> Problem Statement & Engineering Motivation
            </h3>
            <p className="text-slate-600 text-justify">
              Residential buildings account for approximately 25% of global final energy consumption and produce substantial carbon emissions.
              With increasing adoption of intermittent distributed renewable energy (such as rooftop solar PV) and dynamic Time-of-Use (TOU) tariffs,
              utilities and prosumers face severe challenges matching grid supply with stochastic household demand.
              Traditional physics-based thermal modeling (e.g. EnergyPlus) requires precise structural architectural parameters and thermal conductivity values
              that are seldom accessible for existing housing stock. Consequently, data-driven machine learning models trained on ubiquitous Internet of Things (IoT)
              wireless temperature and relative humidity sensors offer an agile, cost-effective alternative for predicting aggregate appliance consumption.
            </p>
          </div>

          {/* Section 2.0 Dataset & Chronological Protocol */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-700">2.0</span> Dataset Overview & Anti-Leakage Protocol
            </h3>
            <p className="text-slate-600 text-justify">
              The experimental corpus comprises the Appliances Energy Prediction dataset originally collected by Candanedo et al. (2017).
              The building is a low-energy residence located in Stambruges, Belgium, monitored continuously from January 11, 2016 to May 27, 2016.
              Variables comprise:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs pl-2">
              <li><strong>Target Variable:</strong> Appliances consumption logged in continuous Watt-hours (Wh) every 10 minutes.</li>
              <li><strong>Indoor Climate Sensors:</strong> Nine temperature (T1–T9 in °C) and nine relative humidity (RH_1–RH_9 in %) sensors deployed across kitchen, living room, laundry, office, bathrooms, and bedrooms.</li>
              <li><strong>Exterior Meteorological Station:</strong> Ambient temperature (T_out), atmospheric pressure (Press_mm_hg), relative humidity (RH_out), wind speed, visibility, and dew point recorded from a nearby airport station.</li>
              <li><strong>Temporal & Synthetic Indicators:</strong> Hour of day, day of week, and two random control variables (rv1, rv2).</li>
            </ul>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-950 space-y-1">
              <span className="font-bold">Chronological Split Justification:</span>
              <p>
                Standard uniform random cross-validation randomly shuffles observations across the entire 4.5-month span, allowing future timestamps into training folds.
                To prevent this artificial data leakage, we enforce a chronological 80/20 partition: Training (Jan 11 – May 3, N=15,788) and Holdout Testing (May 3 – May 27, N=3,947).
              </p>
            </div>
          </div>

          {/* Section 3.0 Experimental Results */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-700">3.0</span> Experimental Results & Comparative Holdout Analysis
            </h3>
            <p className="text-slate-600 text-justify">
              All models were trained on identical features and evaluated strictly on the holdout test partition.
              The quantitative results are summarized in Table 1 below:
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2.5">Model Architecture</th>
                    <th className="px-4 py-2.5">MAE (Wh)</th>
                    <th className="px-4 py-2.5">MSE (Wh²)</th>
                    <th className="px-4 py-2.5">RMSE (Wh)</th>
                    <th className="px-4 py-2.5">R² Score</th>
                    <th className="px-4 py-2.5">Inference (ms)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="px-4 py-2.5 font-bold">Random Forest Regressor (Baseline)</td>
                    <td className="px-4 py-2.5 font-mono">32.0345</td>
                    <td className="px-4 py-2.5 font-mono">4534.7426</td>
                    <td className="px-4 py-2.5 font-mono">67.3405</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">0.5468</td>
                    <td className="px-4 py-2.5">14 ms</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">XGBoost Regressor (Tuned)</td>
                    <td className="px-4 py-2.5 font-mono">30.8412</td>
                    <td className="px-4 py-2.5 font-mono">4209.1834</td>
                    <td className="px-4 py-2.5 font-mono">64.8782</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">0.5793</td>
                    <td className="px-4 py-2.5">6 ms</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-bold">LightGBM Regressor (Tuned)</td>
                    <td className="px-4 py-2.5 font-mono">31.4289</td>
                    <td className="px-4 py-2.5 font-mono">4325.6102</td>
                    <td className="px-4 py-2.5 font-mono">65.7693</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">0.5677</td>
                    <td className="px-4 py-2.5">4 ms</td>
                  </tr>
                  <tr className="bg-emerald-50/40 font-semibold">
                    <td className="px-4 py-2.5 text-emerald-900">Weighted Blended Ensemble</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-900">29.9840</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-900">4068.3211</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-900">63.7833</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">0.5934</td>
                    <td className="px-4 py-2.5">22 ms</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-slate-500 pt-1">
              Table 1: Quantitative regression holdout metrics across 3,947 chronologically sequential test instances.
            </p>
          </div>

          {/* Section 4.0 Limitations & Future Work */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="text-emerald-700">4.0</span> Limitations & Future Enhancements
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
                <span className="font-bold text-slate-900">Current Limitations:</span>
                <p className="text-slate-600 leading-relaxed">
                  The dataset measures aggregate household electrical load rather than individual sub-metered appliances (except lighting).
                  Consequently, high short-burst loads (e.g., microwave, kettle) cannot be disaggregated without Non-Intrusive Load Monitoring (NILM) algorithms.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
                <span className="font-bold text-slate-900">Future Work:</span>
                <p className="text-slate-600 leading-relaxed">
                  Integration of a live third-party meteorological API (e.g. OpenWeatherMap) to supply true forward-looking weather variables,
                  and training Temporal Fusion Transformers (TFT) or Long Short-Term Memory (LSTM) recurrent networks to capture multi-scale autoregressive lag dependencies.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5.0 References */}
          <div className="space-y-2 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900">References & Citations</h3>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-500">
              <li>Candanedo, L. M., Feldheim, V., &amp; Deramaix, D. (2017). Data driven prediction models of energy use of appliances in a low-energy house. <em>Energy and Buildings</em>, 140, 81-97.</li>
              <li>Breiman, L. (2001). Random forests. <em>Machine Learning</em>, 45(1), 5-32.</li>
              <li>Chen, T., &amp; Guestrin, C. (2016). XGBoost: A scalable tree boosting system. In <em>ACM SIGKDD</em> (pp. 785-794).</li>
              <li>Ke, G., et al. (2017). LightGBM: A highly efficient gradient boosting decision tree. In <em>NeurIPS</em> (pp. 3146-3154).</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: VIVA VOCE DEFENSE QUESTIONS */}
      {activeTab === 'viva' && (
        <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                PBL Viva Voce Defense Question Bank
              </h2>
              <p className="text-xs text-slate-500">
                10 curated oral examination questions testing statistical theory, machine learning concepts, and practical limitations
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={vivaSearch}
                onChange={(e) => setVivaSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredViva.map((viva) => {
              const isExpanded = expandedVivaId === viva.id;
              return (
                <div 
                  key={viva.id}
                  className="rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
                >
                  <button
                    onClick={() => setExpandedVivaId(isExpanded ? null : viva.id)}
                    className="w-full flex items-center justify-between p-4 text-left gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800">
                        {viva.id}
                      </span>
                      <span className="text-xs font-bold text-slate-900 sm:text-sm">
                        {viva.question}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/60 p-4 text-xs text-slate-700 leading-relaxed pl-13">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 mb-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Recommended Academic Defense Response:</span>
                      </div>
                      <p>{viva.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
