import { useState, useRef, useCallback, useEffect } from "react";
import { analyzeResume } from "../api/resumeApi";

// ── API ───────────────────────────────────────────────────────────────────────
async function scrapeJobs(query, source = "indeed") {
  const res = await fetch(`/api/scrape?query=${encodeURIComponent(query)}&source=${source}`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

// ── Theme ─────────────────────────────────────────────────────────────────────
const T = {
  bg:       "#030712",
  surface:  "#0a0f1e",
  card:     "#0d1426",
  border:   "#1a2444",
  borderGold: "rgba(212,175,55,.25)",
  gold:     "#d4af37",
  goldLight:"#f0d060",
  goldDim:  "rgba(212,175,55,.15)",
  blue:     "#1e3a5f",
  blueLight:"#2d5a8e",
  text:     "#f0e6c8",
  textDim:  "#8a9ab5",
  textMute: "#3d4f6e",
};

const scoreInfo = (s) =>
  s >= 80 ? { color: "#d4af37", bg: "rgba(212,175,55,.1)", label: "Excellent Match", emoji: "⭐" } :
  s >= 65 ? { color: "#10b981", bg: "rgba(16,185,129,.1)",  label: "Good Match",      emoji: "✅" } :
  s >= 50 ? { color: "#f59e0b", bg: "rgba(245,158,11,.1)",  label: "Fair Match",      emoji: "📈" } :
             { color: "#ef4444", bg: "rgba(239,68,68,.1)",   label: "Needs Work",      emoji: "⚠️" };

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let t0 = null;
    const tick = (ts) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1400, 1);
      setV(Math.round(p * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <>{v}</>;
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const size = 180, stroke = 10;
  const r = (size - stroke) / 2 - 4;
  const circ = 2 * Math.PI * r;
  const { color } = scoreInfo(score);
  const [off, setOff] = useState(circ);
  useEffect(() => {
    const id = setTimeout(() => setOff(circ - (score / 100) * circ), 200);
    return () => clearTimeout(id);
  }, [score, circ]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Outer glow rings */}
      <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: `1px solid ${T.borderGold}`, opacity: 0.5 }} />
      <div style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `1px solid ${T.borderGold}`, opacity: 0.25 }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${color}15 0%, transparent 70%)` }} />
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", position: "relative", zIndex: 1 }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={stroke} />
        {/* Gold tick marks */}
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * 2 * Math.PI;
          const x1 = size/2 + (r - 6) * Math.cos(angle);
          const y1 = size/2 + (r - 6) * Math.sin(angle);
          const x2 = size/2 + (r + 2) * Math.cos(angle);
          const y2 = size/2 + (r + 2) * Math.sin(angle);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.borderGold} strokeWidth="1" />;
        })}
        {/* Progress arc */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 8px ${color})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
        <span style={{ fontSize: 48, fontWeight: 900, color, lineHeight: 1, letterSpacing: "-3px", fontVariantNumeric: "tabular-nums" }}>
          <Counter to={score} />
        </span>
        <span style={{ fontSize: 10, color: T.textMute, letterSpacing: ".2em", marginTop: 4, textTransform: "uppercase" }}>Match Score</span>
      </div>
    </div>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0" }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${T.borderGold})` }} />
      <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.gold }} />
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${T.borderGold}, transparent)` }} />
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ children, style = {}, gold = false }) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${gold ? T.borderGold : T.border}`,
      borderRadius: 16,
      padding: "20px 22px",
      position: "relative",
      overflow: "hidden",
      ...style,
    }}>
      {gold && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold}60, transparent)` }} />}
      {children}
    </div>
  );
}

// ── Label ─────────────────────────────────────────────────────────────────────
function SLabel({ icon, children, count }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: ".12em" }}>{children}</span>
      {count !== undefined && (
        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: T.gold, background: T.goldDim, border: `1px solid ${T.borderGold}`, borderRadius: 20, padding: "1px 10px" }}>{count}</span>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// UPLOAD STEP
// ══════════════════════════════════════════════════════════════════════════════
function UploadStep({ onSubmit }) {
  const [file, setFile]             = useState(null);
  const [mode, setMode]             = useState("paste");
  const [source, setSource]         = useState("indeed");
  const [jd, setJd]                 = useState("");
  const [query, setQuery]           = useState("");
  const [jobs, setJobs]             = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searching, setSearching]   = useState(false);
  const [searchError, setSearchError] = useState("");
  const [dragging, setDragging]     = useState(false);
  const inputRef = useRef();

  const canSubmit = file && (mode === "paste" ? jd.trim().length > 5 : !!selectedJob);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setJobs([]);
    setSelectedJob(null);
    try {
      const data = await scrapeJobs(query, source);
      if (!data.jobs?.length) setSearchError("No jobs found. Try a different search term.");
      setJobs(data.jobs || []);
    } catch {
      setSearchError("Could not fetch jobs. Make sure Python is running.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "12px 0" }}>
        {/* Decorative line */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, transparent, ${T.gold})` }} />
          <span style={{ fontSize: 11, color: T.gold, fontWeight: 700, letterSpacing: ".2em", textTransform: "uppercase" }}>AI-Powered</span>
          <div style={{ width: 40, height: 1, background: `linear-gradient(90deg, ${T.gold}, transparent)` }} />
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.15, margin: "0 0 8px", letterSpacing: "-1.5px" }}>
          <span style={{ color: T.text }}>Elevate Your</span><br />
          <span style={{ background: `linear-gradient(135deg, ${T.gold}, ${T.goldLight}, ${T.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Career Prospects
          </span>
        </h1>
        <p style={{ color: T.textDim, fontSize: 14, lineHeight: 1.7, maxWidth: 360, margin: "0 auto" }}>
          Match your resume against live job listings from Indeed & LinkedIn — powered by AI analysis.
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 12 }}>
        {[["🎯", "AI Scoring"], ["🔍", "Live Jobs"], ["💡", "Smart Tips"]].map(([icon, label]) => (
          <div key={label} style={{
            flex: 1, textAlign: "center", padding: "12px 8px",
            background: T.surface, border: `1px solid ${T.border}`,
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 20, margin: "0 0 4px" }}>{icon}</p>
            <p style={{ fontSize: 11, color: T.textDim, fontWeight: 600, margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      <GoldDivider />

      {/* File upload */}
      <div>
        <SLabel icon="📄">Resume</SLabel>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if(f) setFile(f); }}
          onClick={() => inputRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? T.gold : file ? "#10b981" : T.border}`,
            borderRadius: 16, padding: "32px 24px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            cursor: "pointer", transition: "all .3s",
            background: dragging ? "rgba(212,175,55,.04)" : file ? "rgba(16,185,129,.04)" : T.surface,
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf" style={{ display: "none" }}
            onChange={(e) => { if(e.target.files[0]) setFile(e.target.files[0]); }} />
          {file ? (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>✅</div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: T.text, marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: 12, color: "#10b981" }}>{(file.size / 1024).toFixed(0)} KB · Click to change</p>
              </div>
            </>
          ) : (
            <>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📄</div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontWeight: 600, fontSize: 15, color: T.text, marginBottom: 4 }}>Drop your resume here</p>
                <p style={{ fontSize: 12, color: T.textMute }}>PDF only · Max 5 MB</p>
              </div>
              <div style={{ padding: "8px 20px", borderRadius: 10, background: T.goldDim, border: `1px solid ${T.borderGold}`, color: T.gold, fontSize: 12, fontWeight: 700, letterSpacing: ".03em" }}>
                Browse File
              </div>
            </>
          )}
        </div>
      </div>

      <GoldDivider />

      {/* Job description */}
      <div>
        <SLabel icon="💼">Job Description</SLabel>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 4, background: T.surface, borderRadius: 12, padding: 4, border: `1px solid ${T.border}`, marginBottom: 16 }}>
          {[["paste", "✏️ Paste Manually"], ["search", "🔍 Search Jobs"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setJobs([]); setSelectedJob(null); }} style={{
              flex: 1, padding: "9px", borderRadius: 9, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 700, transition: "all .2s",
              background: mode === m ? T.card : "transparent",
              color: mode === m ? T.gold : T.textDim,
              boxShadow: mode === m ? `inset 0 0 0 1px ${T.borderGold}` : "none",
            }}>{label}</button>
          ))}
        </div>

        {/* Paste mode */}
        {mode === "paste" && (
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description here for best results..."
            rows={6}
            style={{
              width: "100%", background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: 14, padding: "14px 16px", fontSize: 13, color: T.text,
              outline: "none", resize: "none", lineHeight: 1.7, fontFamily: "inherit",
              transition: "border-color .2s",
            }}
            onFocus={(e) => e.target.style.borderColor = T.gold}
            onBlur={(e) => e.target.style.borderColor = T.border}
          />
        )}

        {/* Search mode */}
        {mode === "search" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Source toggle */}
            <div style={{ display: "flex", gap: 8 }}>
              {[["indeed", "Indeed"], ["linkedin", "LinkedIn"]].map(([s, label]) => (
                <button key={s} onClick={() => { setSource(s); setJobs([]); setSelectedJob(null); }} style={{
                  flex: 1, padding: "8px", borderRadius: 10, border: `1px solid ${source === s ? T.borderGold : T.border}`,
                  background: source === s ? T.goldDim : T.surface,
                  color: source === s ? T.gold : T.textDim,
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all .2s",
                }}>{s === "indeed" ? "🏢" : "💼"} {label}</button>
              ))}
            </div>

            {/* Search input */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Software Engineer, Data Analyst..."
                style={{
                  flex: 1, background: T.surface, border: `1px solid ${T.border}`,
                  borderRadius: 12, padding: "12px 16px", fontSize: 13, color: T.text,
                  outline: "none", fontFamily: "inherit", transition: "border-color .2s",
                }}
                onFocus={(e) => e.target.style.borderColor = T.gold}
                onBlur={(e) => e.target.style.borderColor = T.border}
              />
              <button onClick={handleSearch} disabled={searching || !query.trim()} style={{
                padding: "12px 20px", borderRadius: 12, border: `1px solid ${T.borderGold}`,
                cursor: searching || !query.trim() ? "not-allowed" : "pointer",
                background: searching || !query.trim() ? T.surface : T.goldDim,
                color: searching || !query.trim() ? T.textMute : T.gold,
                fontWeight: 700, fontSize: 13, transition: "all .2s", whiteSpace: "nowrap",
              }}>
                {searching ? "⏳ Searching..." : "Search →"}
              </button>
            </div>

            {searchError && (
              <p style={{ fontSize: 12, color: "#f87171", padding: "10px 14px", background: "rgba(239,68,68,.08)", borderRadius: 10, border: "1px solid rgba(239,68,68,.2)" }}>
                ⚠️ {searchError}
              </p>
            )}

            {/* Job cards */}
            {jobs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 320, overflowY: "auto", paddingRight: 4 }}>
                <p style={{ fontSize: 11, color: T.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>
                  {jobs.length} jobs found — select one to analyze
                </p>
                {jobs.map((job, i) => (
                  <div key={i} onClick={() => setSelectedJob(job)} style={{
                    padding: "14px 16px", borderRadius: 14, cursor: "pointer", transition: "all .2s",
                    border: `1px solid ${selectedJob === job ? T.borderGold : T.border}`,
                    background: selectedJob === job ? T.goldDim : T.surface,
                    position: "relative", overflow: "hidden",
                  }}>
                    {selectedJob === job && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: T.gold, borderRadius: "3px 0 0 3px" }} />}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 13, color: T.text, marginBottom: 4 }}>{job.title}</p>
                        <p style={{ fontSize: 12, color: T.textDim, marginBottom: 2 }}>{job.company}</p>
                        <p style={{ fontSize: 11, color: T.textMute }}>{job.location}</p>
                      </div>
                      {selectedJob === job && (
                        <span style={{ fontSize: 11, color: T.gold, fontWeight: 700, background: T.goldDim, border: `1px solid ${T.borderGold}`, borderRadius: 20, padding: "2px 10px", whiteSpace: "nowrap" }}>
                          ✓ Selected
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={() => canSubmit && onSubmit(file, mode === "paste" ? jd : selectedJob?.description)}
        disabled={!canSubmit}
        style={{
          width: "100%", padding: "16px", borderRadius: 16,
          fontSize: 15, fontWeight: 800, border: `1px solid ${canSubmit ? T.borderGold : T.border}`,
          cursor: canSubmit ? "pointer" : "not-allowed",
          background: canSubmit ? `linear-gradient(135deg, ${T.blue}, #0f2040)` : T.surface,
          color: canSubmit ? T.gold : T.textMute,
          boxShadow: canSubmit ? `0 8px 32px rgba(212,175,55,.15), inset 0 1px 0 rgba(212,175,55,.1)` : "none",
          transition: "all .3s", letterSpacing: ".02em", position: "relative", overflow: "hidden",
        }}
      >
        {canSubmit && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(212,175,55,.05), transparent)", pointerEvents: "none" }} />}
        {!file ? "⬆️  Upload a resume to continue" :
         mode === "search" && !selectedJob ? "🔍  Select a job to continue" :
         "✦  Analyze My Resume"}
      </button>

      {/* Footer note */}
      <p style={{ textAlign: "center", fontSize: 11, color: T.textMute }}>
        Your resume is analyzed locally and never stored
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ANALYZING STEP
// ══════════════════════════════════════════════════════════════════════════════
function AnalyzingStep({ fileName }) {
  const steps = ["Uploading your resume", "Extracting document text", "Running AI match analysis", "Generating recommendations"];
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCur((c) => Math.min(c + 1, steps.length - 1)), 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, padding: "48px 0" }}>
      {/* Animated logo */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `1px solid ${T.borderGold}`, animation: "pulse-ring 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 8, borderRadius: "50%", border: `1px solid ${T.borderGold}`, animation: "pulse-ring 2s ease-in-out infinite .5s" }} />
        <svg style={{ position: "absolute", inset: 0, animation: "spin-ring 2s linear infinite" }} width="100" height="100">
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={T.gold}/>
              <stop offset="100%" stopColor={T.goldLight}/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="none" stroke={T.border} strokeWidth="2"/>
          <circle cx="50" cy="50" r="44" fill="none" stroke="url(#goldGrad)" strokeWidth="2"
            strokeLinecap="round" strokeDasharray="276" strokeDashoffset="210"/>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🎯</div>
      </div>

      <div style={{ textAlign: "center" }}>
        <p style={{ fontWeight: 900, fontSize: 20, color: T.text, marginBottom: 8, letterSpacing: "-.5px" }}>Analyzing Your Resume</p>
        <p style={{ fontSize: 12, color: T.textMute, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</p>
      </div>

      <Card style={{ width: "100%", maxWidth: 340 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: i <= cur ? 1 : 0.2, transition: "opacity .5s" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, transition: "all .5s",
                background: i < cur ? "linear-gradient(135deg,#10b981,#059669)" :
                            i === cur ? `linear-gradient(135deg,${T.blue},${T.blueLight})` : T.surface,
                border: `1px solid ${i < cur ? "rgba(16,185,129,.4)" : i === cur ? T.borderGold : T.border}`,
                color: i <= cur ? "#fff" : T.textMute,
                boxShadow: i === cur ? `0 0 16px rgba(212,175,55,.2)` : "none",
              }}>
                {i < cur ? "✓" : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: i <= cur ? T.text : T.textMute, fontWeight: i === cur ? 700 : 400 }}>{s}</span>
                {i === cur && (
                  <div style={{ height: 2, background: T.border, borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                    <div style={{ height: 2, background: `linear-gradient(90deg,${T.gold},${T.goldLight})`, borderRadius: 2, animation: "progress-bar 1.2s ease-in-out infinite" }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// RESULTS STEP
// ══════════════════════════════════════════════════════════════════════════════
function ResultsStep({ data, fileName, onReset }) {
  const { score, skills, suggestions } = data;
  const { color, bg, label, emoji } = scoreInfo(score);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 18, background: `linear-gradient(180deg,${T.gold},${T.goldLight})`, borderRadius: 2 }} />
            <p style={{ fontSize: 20, fontWeight: 900, color: T.text, letterSpacing: "-.5px", margin: 0 }}>Analysis Report</p>
          </div>
          <p style={{ fontSize: 12, color: T.textMute, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>📄 {fileName}</p>
        </div>
        <button onClick={onReset} style={{
          fontSize: 12, color: T.textDim, background: T.surface,
          border: `1px solid ${T.border}`, padding: "8px 16px", borderRadius: 10, cursor: "pointer",
          fontWeight: 600, transition: "all .2s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderGold; e.currentTarget.style.color = T.gold; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textDim; }}>
          ↩ New Analysis
        </button>
      </div>

      {/* Score card */}
      <Card gold style={{ background: `linear-gradient(135deg, ${T.card}, #0a1628)`, animation: "fade-up .5s ease both" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "12px 0" }}>
          <ScoreRing score={score} />
          <div style={{ textAlign: "center" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 14, fontWeight: 700, color,
              background: bg, border: `1px solid ${color}35`,
              borderRadius: 30, padding: "8px 24px", marginBottom: 12,
            }}>{emoji} {label}</span>
            <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
              {score >= 75 ? "Strong alignment with this role. Review the suggestions below to maximize your chances." :
               score >= 55 ? "Moderate match. Incorporating the missing keywords could significantly improve shortlisting odds." :
               "Low match detected. Consider tailoring your resume more closely to this specific job description."}
            </p>
          </div>
        </div>
      </Card>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <Card style={{ animation: "fade-up .5s ease both .1s" }}>
          <SLabel icon="✅" count={skills.length}>Matched Keywords</SLabel>
          <GoldDivider />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {skills.map((s) => (
              <span key={s} style={{
                padding: "6px 14px", borderRadius: 30, fontSize: 12, fontWeight: 600,
                background: "rgba(16,185,129,.08)", color: "#34d399",
                border: "1px solid rgba(16,185,129,.2)", letterSpacing: ".01em",
              }}>{s}</span>
            ))}
          </div>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <Card style={{ animation: "fade-up .5s ease both .2s" }}>
          <SLabel icon="💡">Recommendations</SLabel>
          <GoldDivider />
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{
                display: "flex", gap: 14, padding: "14px 16px",
                background: T.surface, borderRadius: 12,
                border: `1px solid ${T.border}`,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg,${T.gold},transparent)` }} />
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: T.goldDim, border: `1px solid ${T.borderGold}`,
                  color: T.gold, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 900, marginTop: 1,
                }}>{i + 1}</span>
                <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.7, margin: 0 }}>{s}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer */}
      <button onClick={onReset} style={{
        width: "100%", padding: "14px", borderRadius: 14,
        background: T.surface, border: `1px solid ${T.border}`,
        color: T.textDim, fontSize: 13, cursor: "pointer", fontWeight: 600,
        transition: "all .2s", marginTop: 4,
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.borderGold; e.currentTarget.style.color = T.gold; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textDim; }}>
        ✦ Analyze Another Resume
      </button>
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
        msg = "Backend error (500). Check that Java and Python are both running.";
      setError(msg);
      setPhase("error");
    }
  }, []);

  const reset = () => { setPhase("upload"); setFile(null); setResult(null); setError(""); };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',system-ui,sans-serif", color: T.text }}>
      <style>{`
        @keyframes spin-ring { to { transform: rotate(360deg); } }
        @keyframes fade-up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse-ring { 0%,100% { opacity:.3; transform:scale(1); } 50% { opacity:.6; transform:scale(1.03); } }
        @keyframes progress-bar { 0% { width:0%; margin-left:0; } 50% { width:60%; } 100% { width:0%; margin-left:100%; } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${T.surface}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Background decorations */}
      <div style={{ position: "fixed", top: "10%", right: "-10%", width: 400, height: 400, background: `radial-gradient(circle, rgba(212,175,55,.04) 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "5%", left: "-10%", width: 500, height: 500, background: `radial-gradient(circle, rgba(30,58,95,.3) 0%, transparent 70%)`, pointerEvents: "none" }} />
      {/* Top gold line */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)`, zIndex: 100 }} />

      <div style={{ position: "relative", maxWidth: 620, margin: "0 auto", padding: "40px 20px 60px" }}>

        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: `linear-gradient(135deg, ${T.blue}, #0a1e38)`,
              border: `1px solid ${T.borderGold}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, boxShadow: `0 4px 20px rgba(212,175,55,.15)`,
            }}>🎯</div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-.5px", margin: 0, color: T.text }}>ResumeIQ</p>
              <p style={{ fontSize: 10, color: T.gold, letterSpacing: ".15em", textTransform: "uppercase", margin: 0, fontWeight: 600 }}>Career Intelligence</p>
            </div>
          </div>
          <div style={{ fontSize: 11, color: T.textMute, border: `1px solid ${T.border}`, padding: "5px 12px", borderRadius: 20 }}>
            AI-Powered
          </div>
        </div>

        {phase === "upload"    && <UploadStep onSubmit={handleSubmit} />}
        {phase === "analyzing" && <AnalyzingStep fileName={file?.name ?? ""} />}
        {phase === "results"   && result && <ResultsStep data={result} fileName={file?.name ?? ""} onReset={reset} />}
        {phase === "error"     && (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>⚠️</p>
            <p style={{ fontWeight: 900, color: "#f87171", fontSize: 18, marginBottom: 8 }}>Analysis Failed</p>
            <p style={{ color: T.textDim, fontSize: 13, lineHeight: 1.7, marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>{error}</p>
            <button onClick={reset} style={{
              padding: "12px 32px", borderRadius: 12,
              background: T.goldDim, border: `1px solid ${T.borderGold}`,
              color: T.gold, fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}>↩ Try Again</button>
          </Card>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <GoldDivider />
          <p style={{ fontSize: 11, color: T.textMute, marginTop: 16, letterSpacing: ".05em" }}>
            ResumeIQ · Powered by AI · Your data stays private
          </p>
        </div>
      </div>
    </div>
  );
}
