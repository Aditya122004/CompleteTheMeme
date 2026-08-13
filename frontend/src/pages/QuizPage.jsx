import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions, checkAnswer, submitQuiz } from "../services/api";

const QUESTION_TIME = 60;

// ── Parse answerPattern ────────────────────────────────────────
// "__ ___ _______" → [{type:"input",length:2}, {type:"space"}, {type:"input",length:3}, ...]
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

/**
 * Flat char array model
 *
 * We keep a single flat array `chars[]` where each index = one answer character.
 * Each cell: { value: string, locked: bool }
 *   - locked = true  → revealed by hint, user cannot change it
 *   - locked = false → user must fill it
 *
 * segments map to contiguous slices of this array (spaces/literals are skipped).
 *
 * buildCharArray(segments, totalLen) → initial chars (all empty, unlocked)
 * applyHint(chars, hint)            → new chars with locked revealed positions
 * buildAnswer(chars)                → concatenated string for API
 * isAllFilled(chars)                → true when every cell has a value
 */
function buildCharArray(segments) {
  const chars = [];
  for (const seg of segments) {
    if (seg.type === "input") {
      for (let i = 0; i < seg.length; i++) {
        chars.push({ value: "", locked: false });
      }
    }
  }
  return chars;
}

function applyHint(chars, hintStr) {
  if (!hintStr) return chars;
  // hint has no spaces — it's the raw concatenated answer with _ for blanks
  const hint = hintStr.replace(/\s/g, "");
  return chars.map((cell, i) => {
    const h = hint[i] ?? "_";
    if (h !== "_") {
      return { value: h, locked: true };   // revealed — lock it
    }
    return { ...cell, locked: false };      // still blank — keep user's value, unlock
  });
}

function buildAnswer(chars) {
  return chars.map(c => c.value).join("");
}

function isAllFilled(chars) {
  return chars.every(c => c.value !== "");
}

// ── Map flat char index → { segIdx, charInSeg } ───────────────
// so we can map a flat ref index back to which segment + position it belongs to
function buildIndexMap(segments) {
  const map = []; // map[flatIdx] = { segIdx, posInSeg }
  let flatIdx = 0;
  segments.forEach((seg, si) => {
    if (seg.type === "input") {
      for (let p = 0; p < seg.length; p++) {
        map.push({ segIdx: si, posInSeg: p });
        flatIdx++;
      }
    }
  });
  return map;
}

// ── Timer ring ─────────────────────────────────────────────────
function TimerRing({ seconds, total }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * (seconds / total);
  const color = seconds <= 10 ? "var(--color-error)" : seconds <= 30 ? "#ff9900" : "var(--color-accent)";
  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke="var(--color-border)" strokeWidth="3.5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="3.5"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 0.95s linear, stroke 0.4s" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", lineHeight: 1, color, transition: "color 0.4s" }}>{seconds}</span>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.5rem", color: "var(--color-text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "1px" }}>sec</span>
      </div>
    </div>
  );
}

// ── Feedback badge ─────────────────────────────────────────────
function FeedbackBadge({ feedback }) {
  if (!feedback) return null;
  const ok = feedback === "correct";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: "0.4rem",
      padding: "0.4rem 1rem", borderRadius: "999px",
      background: ok ? "rgba(0,255,136,0.1)" : "rgba(255,68,68,0.1)",
      border: `1px solid ${ok ? "var(--color-success)" : "var(--color-error)"}`,
      color: ok ? "var(--color-success)" : "var(--color-error)",
      fontFamily: "var(--font-ui)", fontSize: "0.72rem",
      letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700,
      animation: "fadeUp 0.2s ease forwards",
    }}>
      <span>{ok ? "✓" : "✗"}</span>
      {ok ? "correct!" : "try again"}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function QuizPage() {
  const navigate = useNavigate();

  const [questions,   setQuestions]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [fetchError,  setFetchError]  = useState("");
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [timeLeft,    setTimeLeft]    = useState(QUESTION_TIME);
  const [answers,     setAnswers]     = useState({});

  // flat char array for input questions
  const [chars,       setChars]       = useState([]); // [{value, locked}]

  const [checking,    setChecking]    = useState(false);
  const [feedback,    setFeedback]    = useState(null);
  const [wrongShake,  setWrongShake]  = useState(false);
  const [mcqFeedback, setMcqFeedback] = useState(null);
  const [mcqLocked,   setMcqLocked]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);

  const timerRef   = useRef(null);
  const charRefs   = useRef([]);   // one ref per flat char index
  const skipSubmit = useRef(false); // true while hint is being applied

  const currentQ = questions[currentIdx];
  const segments = currentQ ? parsePattern(currentQ.answerPattern) : [];
  const hasImage = Boolean(currentQ?.imageUrl);

  // ── Fetch ────────────────────────────────────────────────────
  useEffect(() => {
    getQuestions()
      .then(res => { setQuestions([...res.data].sort((a, b) => a.questionNo - b.questionNo)); setLoading(false); })
      .catch(err => { setFetchError(err.response?.data?.message || "Failed to load questions."); setLoading(false); });
  }, []);

  // ── Reset per question ───────────────────────────────────────
  useEffect(() => {
    if (!currentQ) return;
    clearInterval(timerRef.current);
    setTimeLeft(QUESTION_TIME);
    setFeedback(null);
    setWrongShake(false);
    setMcqFeedback(null);
    setMcqLocked(false);
    skipSubmit.current = false;
    charRefs.current = [];
    const segs = parsePattern(currentQ.answerPattern);
    setChars(buildCharArray(segs));
  }, [currentIdx, currentQ]);

  // ── Auto-focus first empty unlocked char ─────────────────────
  const focusFirstEmpty = useCallback((charArr) => {
    const idx = charArr.findIndex(c => !c.locked && c.value === "");
    if (idx !== -1) setTimeout(() => charRefs.current[idx]?.focus(), 60);
  }, []);

  useEffect(() => {
    if (currentQ?.type === "input") focusFirstEmpty(chars);
  }, [currentIdx, currentQ]); // eslint-disable-line

  // ── Finish ───────────────────────────────────────────────────
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

  // ── Timer ────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setAnswers(prev2 => {
            const u = { ...prev2, [currentQ._id]: prev2[currentQ._id] ?? "" };
            advance(u);
            return u;
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentQ, advance]);

  useEffect(() => {
    if (loading || !currentQ || submitting) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [loading, currentIdx, currentQ, submitting]); // eslint-disable-line

  // ── Check answer ─────────────────────────────────────────────
  const handleCheckAnswer = useCallback(async (charArr) => {
    if (checking || feedback === "correct") return;
    clearInterval(timerRef.current);
    setChecking(true);
    const answerStr = buildAnswer(charArr);

    try {
      const res     = await checkAnswer(currentQ._id, answerStr);
      const correct = res.data?.correct ?? false;
      const hint    = res.data?.hint   ?? null;

      setAnswers(prev => ({ ...prev, [currentQ._id]: answerStr }));

      if (correct) {
        setFeedback("correct");
        setTimeout(() => setAnswers(prev2 => { advance(prev2); return prev2; }), 900);
        setChecking(false);
        return;
      }

      // Wrong — apply hint if provided
      if (hint) {
        skipSubmit.current = true;
        setChars(prev => {
          const updated = applyHint(prev, hint);
          // Focus first empty unlocked cell after hint
          const firstEmpty = updated.findIndex(c => !c.locked && c.value === "");
          if (firstEmpty !== -1) setTimeout(() => charRefs.current[firstEmpty]?.focus(), 60);
          return updated;
        });
      }

      setFeedback("wrong");
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 500);
      setTimeout(() => setFeedback(null), 1400);

      // Resume timer
      startTimer();

    } catch {
      setFeedback("wrong");
      setWrongShake(true);
      setTimeout(() => { setWrongShake(false); setFeedback(null); }, 1400);
      startTimer();
    }
    setChecking(false);
  }, [checking, feedback, currentQ, advance, startTimer]);

  // ── Auto-submit when all chars filled ───────────────────────
  useEffect(() => {
    if (!currentQ || currentQ.type !== "input") return;
    if (feedback === "correct" || checking) return;
    if (skipSubmit.current) { skipSubmit.current = false; return; }
    if (chars.length > 0 && isAllFilled(chars)) handleCheckAnswer(chars);
  }, [chars]); // eslint-disable-line

  // ── MCQ ──────────────────────────────────────────────────────
  const handleMcqSelect = useCallback(async (option, i) => {
    if (mcqLocked) return;
    clearInterval(timerRef.current);
    setMcqLocked(true);
    setAnswers(prev => ({ ...prev, [currentQ._id]: option }));
    try {
      const res = await checkAnswer(currentQ._id, option);
      const correct = res.data?.correct ?? false;
      setMcqFeedback({ index: i, result: correct ? "correct" : "wrong" });
      setTimeout(() => setAnswers(prev2 => { advance(prev2); return prev2; }), correct ? 900 : 1400);
    } catch {
      setMcqFeedback({ index: i, result: "wrong" });
      setTimeout(() => setAnswers(prev2 => { advance(prev2); return prev2; }), 1400);
    }
  }, [mcqLocked, currentQ, advance]);

  // ── Per-char input handler ───────────────────────────────────
  const handleCharChange = useCallback((flatIdx, rawValue) => {
    // Take only the last typed character (handles paste/autocorrect edge cases)
    const ch = rawValue.replace(/\s/g, "").slice(-1);
    setChars(prev => {
      const next = prev.map((c, i) =>
        i === flatIdx ? { ...c, value: ch } : c
      );
      // Auto-advance to next empty unlocked cell
      if (ch) {
        const nextEmpty = next.findIndex((c, i) => i > flatIdx && !c.locked && c.value === "");
        if (nextEmpty !== -1) setTimeout(() => charRefs.current[nextEmpty]?.focus(), 0);
      }
      return next;
    });
  }, []);

  const handleCharKeyDown = useCallback((flatIdx, e) => {
    if (e.key === "Backspace") {
      setChars(prev => {
        const cell = prev[flatIdx];
        if (cell.value !== "") {
          // Clear current cell
          return prev.map((c, i) => i === flatIdx ? { ...c, value: "" } : c);
        }
        // Jump to prev unlocked cell and clear it
        for (let i = flatIdx - 1; i >= 0; i--) {
          if (!prev[i].locked) {
            charRefs.current[i]?.focus();
            return prev.map((c, idx) => idx === i ? { ...c, value: "" } : c);
          }
        }
        return prev;
      });
      e.preventDefault();
    }
  }, []);

  // ── Render guards ────────────────────────────────────────────
  if (loading)    return <StatusScreen><Spinner /><StatusText>loading memes…</StatusText></StatusScreen>;
  if (fetchError) return <StatusScreen><span style={{fontSize:"2.5rem"}}>💀</span><StatusText error>{fetchError}</StatusText></StatusScreen>;
  if (submitting) return <StatusScreen><Spinner /><StatusText>submitting answers…</StatusText></StatusScreen>;
  if (!currentQ)  return null;

  const progressPct = (currentIdx / questions.length) * 100;
  const isCorrect   = feedback === "correct";
  const isWrong     = feedback === "wrong";

  // Build flat index mapping once per render
  const indexMap = buildIndexMap(segments); // indexMap[flatIdx] = {segIdx, posInSeg}

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "var(--color-bg-base)", overflow: "hidden" }}>

      {/* ── Progress bar ── */}
      <div style={{ height: "3px", background: "var(--color-border)", flexShrink: 0, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${progressPct}%`, background: "var(--color-accent)", transition: "width 0.5s ease", boxShadow: "0 0 10px var(--color-accent)" }} />
      </div>

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2rem", height: "64px", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-surface)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.25rem" }}></span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", color: "var(--color-accent)", letterSpacing: "0.06em", textTransform: "uppercase" }}>CompleteTheMeme</span>
        </div>
        <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
          {questions.map((_, i) => (
            <div key={i} style={{ height: "8px", width: i === currentIdx ? "24px" : "8px", borderRadius: "4px", background: i <= currentIdx ? "var(--color-accent)" : "var(--color-border)", opacity: i < currentIdx ? 0.4 : 1, transition: "all 0.35s ease", boxShadow: i === currentIdx ? "0 0 8px var(--color-accent)" : "none" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", color: "var(--color-accent)" }}>{currentIdx + 1}</span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", marginLeft: "0.2rem" }}>/ {questions.length}</span>
          </div>
          <TimerRing seconds={timeLeft} total={QUESTION_TIME} />
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: hasImage ? "1fr 460px" : "1fr", overflow: "hidden" }}>

        {/* Image panel */}
        {hasImage && (
          <div style={{ position: "relative", overflow: "hidden", background: "#000" }}>
            <img src={currentQ.imageUrl} alt="meme" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: "60px", background: "linear-gradient(to right, transparent, var(--color-bg-elevated))", pointerEvents: "none" }} />
          </div>
        )}

        {/* Answer panel */}
        <div style={{
          display: "flex", flexDirection: "column",
          padding: "2rem 1.75rem",
          background: "var(--color-bg-elevated)",
          borderLeft: hasImage ? "1px solid var(--color-border)" : "none",
          overflowY: "auto", gap: "1.75rem",
          ...(!hasImage && { alignItems: "center" }),
        }}>

          {/* Question */}
          <div style={{ width: "100%", maxWidth: hasImage ? "none" : "640px" }}>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "var(--color-text-muted)", letterSpacing: "0.12em", textTransform: "uppercase", margin: "0 0 0.5rem" }}>
              Question {currentIdx + 1}
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: hasImage ? "1.85rem" : "2.8rem", fontWeight: 400, color: "var(--color-text-primary)", margin: 0, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1.15 }}>
              {currentQ.question}
            </h2>
          </div>

          {/* ── MCQ ── */}
          {currentQ.type === "mcq" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", flex: 1, width: "100%", maxWidth: hasImage ? "none" : "640px" }}>
              {currentQ.options.map((opt, i) => {
                const res  = mcqFeedback?.index === i ? mcqFeedback.result : null;
                const isOk = res === "correct", isBad = res === "wrong";
                return (
                  <button key={i} onClick={() => handleMcqSelect(opt, i)} disabled={mcqLocked}
                    onMouseEnter={e => { if (!mcqLocked) e.currentTarget.style.borderColor = "var(--color-accent)"; }}
                    onMouseLeave={e => { if (!mcqLocked && !res) e.currentTarget.style.borderColor = "var(--color-border)"; }}
                    style={{
                      display: "flex", alignItems: "center", gap: "1rem", padding: "0.9rem 1.25rem",
                      background: isOk ? "rgba(0,255,136,0.07)" : isBad ? "rgba(255,68,68,0.07)" : "var(--color-bg-input)",
                      border: `1px solid ${isOk ? "var(--color-success)" : isBad ? "var(--color-error)" : "var(--color-border)"}`,
                      borderRadius: "var(--radius-md)", cursor: mcqLocked ? "default" : "pointer",
                      transition: "all 0.15s ease",
                      boxShadow: isOk ? "0 0 16px rgba(0,255,136,0.12)" : isBad ? "0 0 16px rgba(255,68,68,0.12)" : "none",
                      color: isOk ? "var(--color-success)" : isBad ? "var(--color-error)" : "var(--color-text-primary)",
                    }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: isOk ? "var(--color-success)" : isBad ? "var(--color-error)" : "var(--color-accent)", width: "1.4rem", textAlign: "center", flexShrink: 0 }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ width: "1px", height: "1.1rem", flexShrink: 0, background: isOk ? "var(--color-success)" : isBad ? "var(--color-error)" : "var(--color-border)" }} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.875rem", flex: 1 }}>{opt}</span>
                    {isOk  && <span style={{ marginLeft: "auto" }}>✓</span>}
                    {isBad && <span style={{ marginLeft: "auto" }}>✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Input ── */}
          {currentQ.type === "input" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1, width: "100%", maxWidth: hasImage ? "none" : "640px" }}>

              {/* Char-grid container */}
              <div style={{
                padding: "1.5rem",
                background: "var(--color-bg-input)",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isCorrect ? "var(--color-success)" : isWrong ? "var(--color-error)" : "var(--color-border)"}`,
                boxShadow: isCorrect ? "0 0 24px rgba(0,255,136,0.1)" : isWrong ? "0 0 24px rgba(255,68,68,0.1)" : "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
                animation: wrongShake ? "shake 0.4s ease" : "none",
                display: "flex", flexWrap: "wrap",
                alignItems: "flex-end", gap: "0.5rem 0.25rem",
              }}>
                {(() => {
                  let flatIdx = 0;
                  return segments.map((seg, si) => {
                    // Space between words
                    if (seg.type === "space") return (
                      <div key={`space-${si}`} style={{ width: "1rem" }} />
                    );
                    // Literal char
                    if (seg.type === "literal") return (
                      <span key={`lit-${si}`} style={{ fontFamily: "var(--font-ui)", fontSize: "1.4rem", color: "var(--color-text-muted)", paddingBottom: "4px", letterSpacing: "0.05em" }}>
                        {seg.char}
                      </span>
                    );

                    // Input segment — render one cell per character
                    return Array.from({ length: seg.length }).map((_, pos) => {
                      const fi   = flatIdx++;
                      const cell = chars[fi] ?? { value: "", locked: false };

                      const borderColor = isCorrect
                        ? "var(--color-success)"
                        : isWrong
                        ? "var(--color-error)"
                        : cell.locked
                        ? "#ffaa00"                     // amber — hint-revealed
                        : cell.value
                        ? "var(--color-border-focus)"   // filled by user
                        : "var(--color-border)";        // empty

                      const textColor = isCorrect
                        ? "var(--color-success)"
                        : isWrong
                        ? "var(--color-error)"
                        : cell.locked
                        ? "#ffaa00"
                        : "var(--color-text-primary)";

                      return (
                        <input
                          key={`char-${fi}`}
                          ref={el => charRefs.current[fi] = el}
                          value={cell.value}
                          onChange={e => handleCharChange(fi, e.target.value)}
                          onKeyDown={e => handleCharKeyDown(fi, e)}
                          maxLength={2} // allow 1 new char on top of existing
                          disabled={cell.locked || checking || isCorrect}
                          autoComplete="off"
                          spellCheck={false}
                          style={{
                            width:  "2.1ch",
                            height: "2.8rem",
                            background: cell.locked ? "rgba(255,170,0,0.07)" : "transparent",
                            border: "none",
                            borderBottom: `2px solid ${borderColor}`,
                            borderRadius: 0,
                            color: textColor,
                            fontFamily: "var(--font-ui)",
                            fontSize: "1.3rem",
                            letterSpacing: 0,
                            textAlign: "center",
                            padding: "0 0 0.35rem",
                            outline: "none",
                            transition: "border-color 0.15s, color 0.15s, background 0.15s",
                            caretColor: "var(--color-accent)",
                            cursor: cell.locked ? "default" : "text",
                          }}
                        />
                      );
                    });
                  });
                })()}
              </div>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minHeight: "28px" }}>
                <FeedbackBadge feedback={feedback} />
                {checking && !feedback && (
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>checking…</span>
                )}
                {!checking && !feedback && (
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", letterSpacing: "0.04em" }}>
                    {chars.filter(c => c.locked).length > 0
                      ? `${chars.filter(c => !c.locked && c.value === "").length} blanks remaining`
                      : `${currentQ.answerLength} characters · spaces added automatically`}
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────
function StatusScreen({ children }) {
  return (
    <div className="board-bg" style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
      {children}
    </div>
  );
}
function StatusText({ children, error }) {
  return (
    <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", letterSpacing: "0.05em", color: error ? "var(--color-error)" : "var(--color-text-muted)", textTransform: "uppercase", margin: 0 }}>
      {children}
    </p>
  );
}
function Spinner() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ animation: "spin 0.75s linear infinite" }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      `}</style>
      <circle cx="18" cy="18" r="14" stroke="var(--color-border)" strokeWidth="3" />
      <circle cx="18" cy="18" r="14" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray="44" strokeDashoffset="12" />
    </svg>
  );
}