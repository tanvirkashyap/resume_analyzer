import { useState, useRef, useCallback, useEffect } from "react";
import { analyzeResume } from "../api/resumeApi";

// ── Colour helpers ────────────────────────────────────────────────────────────
const scoreInfo = (s) =>
  s >= 80 ? { color: "#10b981", label: "Excellent" } :
  s >= 65 ? { color: "#f59e0b", label: "Good" }      :
  s >= 50 ? { color: "#fb923c", label: "Fair" }      :
             { color: "#ef4444", label: "Needs Work" };

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1100, 1);
      setV(Math.round(p * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <>{v}</>;
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 52, circ = 2 * Math.PI * r;
  const { color, label } = scoreInfo(score);
  const [off, setOff] = useState(circ);
  useEffect(() => {
    const id = setTimeout(() => setOff(circ - (score / 100) * circ), 100);
    return () => clearTimeout(id);
  }, [score, circ]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 136, height: 136 }}>
        <svg width="136" height="136" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="68" cy="68" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle cx="68" cy="68" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.4,0,.2,1)" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black leading-none" style={{ color }}>
            <Counter to={score} />
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-semibold px-4 py-1 rounded-full"
        style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}>
        {label}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Upload form
// ══════════════════════════════════════════════════════════════════════════════
function UploadStep({ onSubmit }) {
  const [file, setFile]         = useState(null);
  const [jd, setJd]             = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const canSubmit = !!file;

  return (
    <div className="flex flex-col gap-6">
      {/* Hero */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-5">
          <span className="w-2 h-2 rounded-full bg-indigo-400" style={{ boxShadow:"0 0 8px #818cf8" }} />
          <span className="text-xs text-indigo-300 font-medium">AI-Powered Resume Analyzer</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight leading-tight text-white">
          Analyze your resume<br />
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            with AI
          </span>
        </h1>
        <p className="text-slate-500 text-sm mt-3 max-w-sm mx-auto">
          Upload your resume and get an instant score, matched skills, and improvement suggestions.
        </p>
      </div>

      {/* File upload */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
          Resume <span className="text-red-400">*</span>
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if(f) setFile(f); }}
          onClick={() => inputRef.current.click()}
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3
            cursor-pointer transition-all duration-200 select-none
            ${dragging ? "border-indigo-400 bg-indigo-500/8" : "border-slate-800 bg-slate-900/40 hover:border-slate-600"}`}
        >
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={(e) => { if(e.target.files[0]) setFile(e.target.files[0]); }} />

          {file ? (
            <>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-2xl">📄</div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">{file.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{(file.size / 1024).toFixed(0)} KB · click to change</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl">📄</div>
              <div className="text-center">
                <p className="text-slate-300 font-medium text-sm">Drop your resume here</p>
                <p className="text-slate-600 text-xs mt-0.5">PDF · DOC · DOCX</p>
              </div>
              <span className="text-xs text-indigo-400 border border-indigo-500/30 px-4 py-1.5 rounded-lg bg-indigo-500/8">
                Browse file
              </span>
            </>
          )}
        </div>
      </div>

      {/* Job description (optional) */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
          Job Description <span className="text-slate-600">(optional)</span>
        </label>
        <textarea
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the job description to get a better match analysis..."
          rows={5}
          className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-3 text-sm
            text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50
            transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Submit */}
      <button
        onClick={() => canSubmit && onSubmit(file, jd)}
        disabled={!canSubmit}
        className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-200
          ${canSubmit
            ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 cursor-pointer"
            : "bg-slate-800 text-slate-600 cursor-not-allowed"}`}
      >
        {!file ? "Upload a resume to continue" : "Analyze Resume →"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Analyzing
// ══════════════════════════════════════════════════════════════════════════════
function AnalyzingStep({ fileName }) {
  const steps = ["Uploading resume", "Extracting text", "Running ML analysis", "Building results"];
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCur((c) => Math.min(c + 1, steps.length - 1)), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-8 py-12">
      <div className="relative w-20 h-20">
        <svg className="absolute inset-0 spin-ring" width="80" height="80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#1e293b" strokeWidth="6"/>
          <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" strokeWidth="6"
            strokeLinecap="round" strokeDasharray="213" strokeDashoffset="160"/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🤖</div>
      </div>
      <div className="text-center">
        <p className="font-bold text-white">Analyzing resume…</p>
        <p className="text-slate-500 text-xs mt-1 max-w-[220px] truncate">{fileName}</p>
      </div>
      <div className="flex flex-col gap-2.5 w-full max-w-xs">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 transition-opacity duration-300"
            style={{ opacity: i <= cur ? 1 : 0.25 }}>
            <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold transition-colors duration-300
              ${i < cur ? "bg-emerald-500 text-white" : i === cur ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-500"}`}>
              {i < cur ? "✓" : i + 1}
            </div>
            <span className={`text-sm ${i <= cur ? "text-slate-300" : "text-slate-600"}`}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Results — matches ResumeResponseDTO exactly
//   { score: Integer, skills: String[], suggestions: String[] }
// ══════════════════════════════════════════════════════════════════════════════
function ResultsStep({ data, fileName, onReset }) {
  const { score, skills, suggestions } = data;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-white text-lg">Results</p>
          <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[250px]">{fileName}</p>
        </div>
        <button onClick={onReset}
          className="text-xs text-slate-500 border border-slate-800 px-3 py-1.5 rounded-lg hover:border-slate-600 hover:text-slate-300 transition-all">
          ↩ Try another
        </button>
      </div>

      {/* Score */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center gap-3 fade-up">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Match Score</p>
        <ScoreRing score={score} />
      </div>

      {/* Skills */}
      {skills?.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 fade-up" style={{ animationDelay: ".05s" }}>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3">
            ✅ Matched Skills
            <span className="ml-2 text-emerald-500">{skills.length}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background:"rgba(16,185,129,.1)", color:"#34d399", border:"1px solid rgba(16,185,129,.25)" }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions?.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 fade-up" style={{ animationDelay: ".1s" }}>
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">
            💡 Suggestions
          </p>
          <div className="flex flex-col gap-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-indigo-500/15 border border-indigo-500/25
                  text-indigo-400 flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════════════════════
export default function ResumeAnalyzer() {
  const [phase, setPhase]   = useState("upload");
  const [file, setFile]     = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError]   = useState("");

  const handleSubmit = useCallback(async (file, jd) => {
    setFile(file);
    setPhase("analyzing");
    setError("");
    try {
      const data = await analyzeResume(file, jd);
      setResult(data);
      setPhase("results");
    } catch (err) {
      const status = err.response?.status;
      let msg = err.response?.data?.message || err.message || "Something went wrong.";
      if (!status && err.message?.includes("Network"))
        msg = "Cannot reach the server. Make sure the Java backend is running on port 8080.";
      if (status === 500)
        msg = "Backend error (500). Check that the Java backend and Python ML API are both running.";
      setError(msg);
      setPhase("error");
    }
  }, []);

  const reset = () => { setPhase("upload"); setFile(null); setResult(null); setError(""); };

  return (
    <div className="min-h-screen bg-[#020617] text-white" style={{ fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div className="fixed pointer-events-none"
        style={{ top:"-15%", left:"50%", transform:"translateX(-50%)", width:700, height:500,
          background:"radial-gradient(ellipse, rgba(99,102,241,.09) 0%, transparent 68%)" }} />

      <div className="relative max-w-[580px] mx-auto px-5 py-10 pb-16">
        {/* Nav */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/40">
            🎯
          </div>
          <span className="font-bold text-[17px] tracking-tight">ResumeIQ</span>
        </div>

        {phase === "upload"    && <UploadStep onSubmit={handleSubmit} />}
        {phase === "analyzing" && <AnalyzingStep fileName={file?.name ?? ""} />}
        {phase === "results"   && result && <ResultsStep data={result} fileName={file?.name ?? ""} onReset={reset} />}
        {phase === "error"     && (
          <div className="flex flex-col gap-4">
            <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-8 text-center">
              <p className="text-3xl mb-3">⚠️</p>
              <p className="font-bold text-red-400 mb-2">Analysis failed</p>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">{error}</p>
              <button onClick={reset}
                className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors">
                ↩ Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
