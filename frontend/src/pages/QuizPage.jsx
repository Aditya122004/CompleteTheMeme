import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions, checkAnswer, submitQuiz } from "../services/api";

const QUESTION_TIME = 60;

// ── Parse answerPattern into word-groups ───────────────────────
function parsePattern(pattern) {
  const segments = [];
  const parts = pattern.split(" ");
  parts.forEach((part, pi) => {
    if (pi > 0) segments.push({ type: "space" });
    if (!part) return;
    if (/^_+$/.test(part)) {
      segments.push({ type: "input", length: part.length });
    } else {
      let i = 0;
      while (i < part.length) {
        if (part[i] === "_") {
          let len = 0;
          while (i < part.length && part[i] === "_") { len++; i++; }
          segments.push({ type: "input", length: len });
        } else {
          segments.push({ type: "literal", char: part[i] });
          i++;
        }
      }
    }
  });
  return segments;
}

function buildAnswer(segments, values) {
  let answer = "";
  let idx = 0;
  for (const seg of segments) {
    if (seg.type === "input") {
      answer += (values[idx] || "").slice(0, seg.length);
      idx++;
    }
  }
  return answer;
}

function isComplete(segments, values) {
  let idx = 0;
  for (const seg of segments) {
    if (seg.type === "input") {
      if (!values[idx] || values[idx].length < seg.length) return false;
      idx++;
    }
  }
  return true;
}

// ── Timer arc ──────────────────────────────────────────────────
function TimerRing({ seconds, total }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * (seconds / total);
  const urgent = seconds <= 10;
  const warn   = seconds <= 30;
  const color  = urgent ? "var(--color-error)" : warn ? "#ff9900" : "var(--color-accent)";

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth="3.5" />
        <circle cx="36" cy="36" r={r} fill="none"
          stroke={color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.95s linear, stroke 0.4s" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.5rem", lineHeight: 1,
          color,
          transition: "color 0.4s",
          letterSpacing: "0.02em",
        }}>{seconds}</span>
        <span style={{
          fontFamily: "var(--font-ui)", fontSize: "0.5rem",
          color: "var(--color-text-muted)", letterSpacing: "0.08em",
          textTransform: "uppercase", marginTop: "1px",
        }}>sec</span>
      </div>
    </div>
  );
}

// ── Feedback overlay badge ─────────────────────────────────────
function FeedbackBadge({ feedback }) {
  if (!feedback) return null;
  const correct = feedback === "correct";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.4rem",
      padding: "0.4rem 0.85rem",
      borderRadius: "999px",
      background: correct ? "rgba(0,255,136,0.1)" : "rgba(255,68,68,0.1)",
      border: `1px solid ${correct ? "var(--color-success)" : "var(--color-error)"}`,
      color: correct ? "var(--color-success)" : "var(--color-error)",
      fontFamily: "var(--font-ui)",
      fontSize: "0.72rem",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      fontWeight: 700,
      animation: "fadeUp 0.2s ease forwards",
    }}>
      <span style={{ fontSize: "0.9rem" }}>{correct ? "✓" : "✗"}</span>
      {correct ? "correct!" : "try again"}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();

  const [questions,  setQuestions]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(QUESTION_TIME);
  const [answers,    setAnswers]    = useState({});

  // input state
  const [segValues,  setSegValues]  = useState([]);
  const [checking,   setChecking]   = useState(false);
  const [feedback,   setFeedback]   = useState(null);
  const [wrongShake, setWrongShake] = useState(false);

  // mcq state
  const [mcqFeedback, setMcqFeedback] = useState(null);
  const [mcqLocked,   setMcqLocked]   = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const timerRef  = useRef(null);
  const inputRefs = useRef([]);

  const currentQ  = questions[currentIdx];
  const segments  = currentQ ? parsePattern(currentQ.answerPattern) : [];
  const inputSegs = segments.filter(s => s.type === "input");

  useEffect(() => {
    getQuestions()
      .then(res => {
        setQuestions([...res.data].sort((a, b) => a.questionNo - b.questionNo));
        setLoading(false);
      })
      .catch(err => {
        setFetchError(err.response?.data?.message || "Failed to load questions.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!currentQ) return;
    setTimeLeft(QUESTION_TIME);
    setFeedback(null);
    setWrongShake(false);
    setMcqFeedback(null);
    setMcqLocked(false);
    const count = parsePattern(currentQ.answerPattern).filter(s => s.type === "input").length;
    setSegValues(Array(count).fill(""));
    inputRefs.current = [];
  }, [currentIdx, currentQ]);

  useEffect(() => {
    if (currentQ?.type === "input") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [currentIdx, currentQ]);

  const finishQuiz = useCallback(async (finalAnswers) => {
    setSubmitting(true);
    const payload = questions.map(q => ({ questionId: q._id, answer: finalAnswers[q._id] ?? "" }));
    try { await submitQuiz(payload); } catch (e) { console.error(e); }
    navigate("/finish");
  }, [questions, navigate]);

  const advance = useCallback((finalAnswers) => {
    const next = currentIdx + 1;
    if (next >= questions.length) finishQuiz(finalAnswers);
    else setCurrentIdx(next);
  }, [currentIdx, questions.length, finishQuiz]);

  useEffect(() => {
    if (loading || !currentQ || submitting) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setAnswers(prev2 => {
            const updated = { ...prev2, [currentQ._id]: prev2[currentQ._id] ?? "" };
            advance(updated);
            return updated;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, currentIdx, currentQ, submitting, advance]);

  const handleCheckAnswer = useCallback(async (answerStr) => {
    if (checking || feedback === "correct") return;
    clearInterval(timerRef.current);
    setChecking(true);
    try {
      const res = await checkAnswer(currentQ._id, answerStr);
      const correct = res.data?.correct ?? res.data?.isCorrect ?? false;
      setAnswers(prev => ({ ...prev, [currentQ._id]: answerStr }));
      if (correct) {
        setFeedback("correct");
        setTimeout(() => setAnswers(prev2 => { advance(prev2); return prev2; }), 900);
      } else {
        setFeedback("wrong");
        setWrongShake(true);
        setTimeout(() => setWrongShake(false), 500);
        setChecking(false);
        timerRef.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setAnswers(prev2 => {
                const updated = { ...prev2, [currentQ._id]: prev2[currentQ._id] ?? answerStr };
                advance(updated);
                return updated;
              });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimeout(() => setFeedback(null), 1400);
        return;
      }
    } catch {
      setFeedback("wrong");
      setWrongShake(true);
      setTimeout(() => { setWrongShake(false); setFeedback(null); }, 1400);
      setChecking(false);
    }
    setChecking(false);
  }, [checking, feedback, currentQ, advance]);

  useEffect(() => {
    if (!currentQ || currentQ.type !== "input") return;
    if (feedback === "correct" || checking) return;
    if (isComplete(segments, segValues)) {
      handleCheckAnswer(buildAnswer(segments, segValues));
    }
  }, [segValues]); // eslint-disable-line

  const handleMcqSelect = useCallback(async (option, i) => {
    if (mcqLocked) return;
    clearInterval(timerRef.current);
    setMcqLocked(true);
    setAnswers(prev => ({ ...prev, [currentQ._id]: option }));
    try {
      const res = await checkAnswer(currentQ._id, option);
      const correct = res.data?.correct ?? res.data?.isCorrect ?? false;
      setMcqFeedback({ index: i, result: correct ? "correct" : "wrong" });
      setTimeout(() => setAnswers(prev2 => { advance(prev2); return prev2; }), correct ? 900 : 1400);
    } catch {
      setMcqFeedback({ index: i, result: "wrong" });
      setTimeout(() => setAnswers(prev2 => { advance(prev2); return prev2; }), 1400);
    }
  }, [mcqLocked, currentQ, advance]);

  const handleSegInput = (idx, value) => {
    const maxLen = inputSegs[idx]?.length ?? 1;
    const cleaned = value.replace(/\s/g, "").slice(0, maxLen);
    const updated = [...segValues];
    updated[idx] = cleaned;
    setSegValues(updated);
    if (cleaned.length === maxLen && idx < inputSegs.length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleSegKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !segValues[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  if (loading)    return <StatusScreen><Spinner /><StatusText>loading memes…</StatusText></StatusScreen>;
  if (fetchError) return <StatusScreen><span style={{fontSize:"2rem"}}>💀</span><StatusText error>{fetchError}</StatusText></StatusScreen>;
  if (submitting) return <StatusScreen><Spinner /><StatusText>submitting answers…</StatusText></StatusScreen>;
  if (!currentQ)  return null;

  const progressPct = (currentIdx / questions.length) * 100;
  const isCorrect   = feedback === "correct";
  const isWrong     = feedback === "wrong";
  const containerMaxWidth = currentQ.imageUrl ? "100%" : "860px";

  return (
    <div className="board-bg" style={{
      height: "100dvh", // Lock height exactly to viewport
      boxSizing: "border-box", // Ensure padding doesn't push past 100dvh
      overflow: "hidden", // Completely eliminate window scroll
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "2rem 1.5rem", // Slightly tighter padding to ensure fit
    }}>

      {/* ── Neon progress bar ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "3px", background: "var(--color-border)", zIndex: 100,
      }}>
        <div style={{
          height: "100%", width: `${progressPct}%`,
          background: "var(--color-accent)",
          transition: "width 0.5s ease",
          boxShadow: "0 0 10px var(--color-accent)",
        }} />
      </div>

      {/* ── Top meta row ── */}
      <div style={{
        width: "100%", maxWidth: containerMaxWidth,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "1.25rem",
        transition: "max-width 0.3s ease",
        flexShrink: 0, // Prevent shrinking
      }}>
        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              width: i === currentIdx ? "28px" : "10px",
              height: "10px", borderRadius: "5px",
              background: i <= currentIdx ? "var(--color-accent)" : "var(--color-border)",
              opacity: i < currentIdx ? 0.45 : 1,
              transition: "all 0.3s ease",
              boxShadow: i === currentIdx ? "0 0 8px var(--color-accent)" : "none",
            }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "2rem",
            color: "var(--color-accent)", letterSpacing: "0.04em",
          }}>{currentIdx + 1}</span>
          <span style={{
            fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)",
          }}>/ {questions.length}</span>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="card fade-up" style={{
        width: "100%",
        maxWidth: containerMaxWidth,
        display: "flex",
        flexDirection: "column",
        flex: 1, // Expand to take all remaining space
        minHeight: 0, // CRUCIAL: prevents flex child from overflowing parent
        overflow: "hidden", // Ensures border-radius constraints
        transition: "max-width 0.3s ease",
      }}>

        {/* Card top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-bg-surface)",
          gap: "1.5rem",
          flexShrink: 0, // Keep header size static
        }}>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "2.1rem",
            fontWeight: 400, color: "var(--color-text-primary)",
            margin: 0, letterSpacing: "0.04em", textTransform: "uppercase",
            lineHeight: 1.15, flex: 1,
          }}>
            {currentQ.question}
          </h2>
          <TimerRing seconds={timeLeft} total={QUESTION_TIME} />
        </div>

        {/* Card body */}
        <div style={{ 
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          flex: 1, // Fill space inside the card
          minHeight: 0, 
          overflowY: "auto" // Allow scrolling *inside* the card only if the screen is tiny
        }}>

          <div style={{
            display: currentQ.imageUrl ? "grid" : "block",
            gridTemplateColumns: currentQ.imageUrl ? "minmax(0, 1.8fr) minmax(320px, 1fr)" : undefined,
            gap: "2.5rem",
            alignItems: currentQ.imageUrl ? "stretch" : "start", // Stretches grid items to match height
            flex: 1, // Fill available vertical card space
            minHeight: 0,
          }}>

            {/* Image Container */}
            {currentQ.imageUrl && (
              <div style={{
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-input)",
                height: "100%", // Inherit stretched height from grid
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img src={currentQ.imageUrl} alt="meme"
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain",
                    display: "block" 
                  }}
                />
              </div>
            )}

            {/* Answer area */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto" }}>
              
              {/* ── MCQ ── */}
              {currentQ.type === "mcq" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                  {currentQ.options.map((opt, i) => {
                    const res = mcqFeedback?.index === i ? mcqFeedback.result : null;
                    let bg = "var(--color-bg-input)", border = "var(--color-border)";
                    let color = "var(--color-text-primary)", shadow = "none", labelColor = "var(--color-accent)";

                    if (res === "correct") {
                      bg = "rgba(0,255,136,0.07)"; border = "var(--color-success)";
                      color = "var(--color-success)"; labelColor = "var(--color-success)";
                      shadow = "0 0 16px rgba(0,255,136,0.12)";
                    } else if (res === "wrong") {
                      bg = "rgba(255,68,68,0.07)"; border = "var(--color-error)";
                      color = "var(--color-error)"; labelColor = "var(--color-error)";
                      shadow = "0 0 16px rgba(255,68,68,0.12)";
                    }

                    return (
                      <button key={i} onClick={() => handleMcqSelect(opt, i)} disabled={mcqLocked}
                        style={{
                          background: bg, border: `1px solid ${border}`, borderRadius: "var(--radius-md)",
                          padding: "0.9rem 1.25rem", cursor: mcqLocked ? "default" : "pointer",
                          textAlign: "left", display: "flex", alignItems: "center", gap: "1rem",
                          transition: "all 0.15s ease", boxShadow: shadow, color,
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: labelColor, width: "1.4rem", flexShrink: 0, textAlign: "center" }}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span style={{ width: "1px", height: "1.1rem", background: res === "correct" ? "var(--color-success)" : res === "wrong" ? "var(--color-error)" : "var(--color-border)", flexShrink: 0 }} />
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem", flex: 1 }}>{opt}</span>
                        {res === "correct" && <span style={{ fontSize: "1rem", marginLeft: "auto" }}>✓</span>}
                        {res === "wrong"   && <span style={{ fontSize: "1rem", marginLeft: "auto" }}>✗</span>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Input ── */}
              {currentQ.type === "input" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{
                    display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "0.6rem",
                    padding: "1.25rem 1.5rem", background: "var(--color-bg-input)",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${isCorrect ? "var(--color-success)" : isWrong ? "var(--color-error)" : "var(--color-border)"}`,
                    boxShadow: isCorrect ? "0 0 20px rgba(0,255,136,0.1)" : isWrong ? "0 0 20px rgba(255,68,68,0.1)" : "none",
                    animation: wrongShake ? "shake 0.4s ease" : "none",
                  }}>
                    {(() => {
                      let idx = 0;
                      return segments.map((seg, i) => {
                        if (seg.type === "space") return <div key={i} style={{ width: "0.5rem" }} />;
                        if (seg.type === "literal") return <span key={i} style={{ fontFamily: "var(--font-ui)", fontSize: "1.1rem", color: "var(--color-text-muted)", paddingBottom: "2px" }}>{seg.char}</span>;

                        const boxIdx = idx++;
                        const filled = (segValues[boxIdx] || "").length === seg.length;

                        return (
                          <div key={i} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <input
                              ref={el => inputRefs.current[boxIdx] = el}
                              value={segValues[boxIdx] || ""} onChange={e => handleSegInput(boxIdx, e.target.value)}
                              onKeyDown={e => handleSegKeyDown(boxIdx, e)} maxLength={seg.length}
                              disabled={checking || isCorrect} autoComplete="off" spellCheck={false}
                              style={{
                                width: `${seg.length * 1.7 + 1.2}ch`, minWidth: "2.5ch", background: "transparent",
                                border: "none", borderBottom: `2px solid ${isCorrect ? "var(--color-success)" : isWrong ? "var(--color-error)" : filled ? "var(--color-border-focus)" : "var(--color-border)"}`,
                                borderRadius: 0, color: isCorrect ? "var(--color-success)" : isWrong ? "var(--color-error)" : "var(--color-text-primary)",
                                fontFamily: "var(--font-ui)", fontSize: "1.25rem", letterSpacing: "0.12em", textAlign: "center",
                                padding: "0.2rem 0.1rem 0.4rem", outline: "none", caretColor: "var(--color-accent)",
                              }}
                            />
                            <div style={{ display: "flex", justifyContent: "center", gap: `${Math.max(1.7 * 16 - 6, 4)}px` }}>
                              {Array.from({ length: seg.length }).map((_, ci) => (
                                <div key={ci} style={{ width: "4px", height: "4px", borderRadius: "50%", background: ci < (segValues[boxIdx] || "").length ? isCorrect ? "var(--color-success)" : isWrong ? "var(--color-error)" : "var(--color-accent)" : "var(--color-border)" }} />
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <FeedbackBadge feedback={feedback} />
                    {checking && !feedback && <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>checking…</span>}
                    {!checking && !feedback && <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)" }}>{inputSegs.length > 1 ? `${inputSegs.length} words ` : `${inputSegs[0]?.length ?? 0} characters`}</span>}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusScreen({ children }) {
  return (
    <div className="board-bg" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
      {children}
    </div>
  );
}

function StatusText({ children, error }) {
  return <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", letterSpacing: "0.05em", color: error ? "var(--color-error)" : "var(--color-text-muted)", textTransform: "uppercase", margin: 0 }}>{children}</p>;
}

function Spinner() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ animation: "spin 0.75s linear infinite" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
      `}</style>
      <circle cx="18" cy="18" r="14" stroke="var(--color-border)" strokeWidth="3" />
      <circle cx="18" cy="18" r="14" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="44" strokeDashoffset="12" />
    </svg>
  );
}