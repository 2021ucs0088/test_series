// ...existing code...
"use client";

import React, { useEffect, useState } from "react";
import styles from "./style.module.css";

export default function Page() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState("SEBI");

  // modal/exam state
  const [examOpen, setExamOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { qid: optionIndex }
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/questions");
      const json = await res.json();
      const all = Array.isArray(json.questions) ? json.questions : [];

      const map = {};
      all.forEach((q) => {
        if (!q || !q.testName) return;
        if (
          (q.examType || "").toString().toLowerCase() !== examType.toLowerCase()
        )
          return;
        map[q.testName] = (map[q.testName] || 0) + 1;
      });

      const list = Object.keys(map).map((testName) => ({
        testName,
        count: map[testName],
      }));

      list.sort((a, b) => {
        const na = parseInt(a.testName.replace(/\D/g, ""), 10) || 0;
        const nb = parseInt(b.testName.replace(/\D/g, ""), 10) || 0;
        return na - nb || a.testName.localeCompare(b.testName);
      });

      setTests(list);
    } catch (err) {
      console.error(err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch tests whenever exam type changes
    fetchTests();
    // close any open exam when switching
    closeExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examType]);

  const openExam = async (testName) => {
    setSelectedTest(testName);
    setExamOpen(true);
    setFetchingQuestions(true);
    setQuestions([]);
    setQIndex(0);
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);

    try {
      const res = await fetch(
        `/api/questions?testName=${encodeURIComponent(testName)}`,
      );
      const json = await res.json();
      const arr = Array.isArray(json.questions) ? json.questions : [];
      arr.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      );
      setQuestions(arr);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    } finally {
      setFetchingQuestions(false);
    }
  };

  const closeExam = () => {
    setExamOpen(false);
    setSelectedTest(null);
    setQuestions([]);
    setQIndex(0);
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const selectOption = (qid, idx) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qid]: idx }));
  };

  const gotoNext = () =>
    setQIndex((i) => Math.min(i + 1, questions.length - 1));
  const gotoPrev = () => setQIndex((i) => Math.max(i - 1, 0));
  const jumpTo = (i) => setQIndex(i);

  const submit = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const qid = String(q._id ?? q.id ?? idx);
      const userIdx = userAnswers[qid];
      const correctIdx = Array.isArray(q.options)
        ? q.options.findIndex(
            (o) => !!o && (o.isCorrect === true || o.isCorrect === "true"),
          )
        : -1;
      if (userIdx !== undefined && userIdx === correctIdx) correct += 1;
    });
    setScore(correct);
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentQ = questions[qIndex];
  const total = questions.length;
  const progressPct =
    total === 0 ? 0 : Math.round(((qIndex + 1) / total) * 100);

  const optionClass = (isUser, isCorrect, submittedFlag) => {
    const base = styles["option-row"];
    if (!submittedFlag) return isUser ? `${base} ${styles.selected}` : base;
    if (isCorrect) return `${base} ${styles.correct}`;
    if (isUser && !isCorrect) return `${base} ${styles.wrong}`;
    return base;
  };

  const bubbleClass = (isUser, isCorrect, submittedFlag) => {
    const base = styles["bubble"];
    if (!submittedFlag) return isUser ? `${base} ${styles.selected}` : base;
    if (isCorrect) return `${base} ${styles.correct}`;
    if (isUser && !isCorrect) return `${base} ${styles.wrong}`;
    return base;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles["header-left"]}>
          <label className={styles["exam-label"]} htmlFor="exam-select">
            Exam
          </label>
          <select
            id="exam-select"
            value={examType}
            onChange={(e) => {
              setExamType(e.target.value);
            }}
            className={styles["exam-select"]}
          >
            <option value="SEBI">SEBI</option>
            <option value="GATE">GATE</option>
            <option value="RBI GRADE A">RBI GRADE A</option>
          </select>
          <h1 className={styles.title}>{examType} — Tests</h1>
        </div>

        <div className={styles["header-actions"]}>
          <button
            onClick={fetchTests}
            disabled={loading}
            className={styles.btn}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => window.location.reload()}
            className={`${styles.btn} ${styles.outline}`}
          >
            Reload App
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <aside>
          <div className={styles.card}>
            <h3>Available Tests</h3>
            {tests.length === 0 ? (
              <div className={styles.muted}>No tests for {examType}</div>
            ) : (
              tests.map((t) => (
                <div key={t.testName} className={styles["test-card"]}>
                  <div>
                    <div className={styles["test-name"]}>{t.testName}</div>
                    <div className={styles["test-count"]}>
                      {t.count} question{t.count > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className={styles["test-actions"]}>
                    <button
                      className={styles["start-btn"]}
                      onClick={() => openExam(t.testName)}
                      title="Start Exam"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main>
          <div className={styles.card}>
            {!examOpen ? (
              <>
                <h2>Instructions</h2>
                <ol>
                  <li>Choose a test from the left and click "Start".</li>
                  <li>Fill bubbles for your answers.</li>
                  <li>Submit when done to see score and correct answers.</li>
                </ol>
                <div className={styles["why-box"]}>
                  <strong>Why this view?</strong> Clean exam-paper layout with
                  candidate details and two-column question layout.
                </div>
              </>
            ) : (
              <div>
                <h2>
                  {selectedTest} — {examType}
                </h2>
                <div className={styles["progress-wrap"]}>
                  <div className={styles["progress-bar"]}>
                    <div
                      className={styles["progress-fill"]}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <div className={styles["progress-meta"]}>
                    <div>
                      Question {qIndex + 1} of {total}
                    </div>
                    <div>{progressPct}% completed</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {examOpen && (
        <div className={styles["modal-wrap"]} onClick={closeExam}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles["paper-header"]}>
              <div>
                <div className={styles["exam-title"]}>{selectedTest}</div>
                <div className={styles["exam-sub"]}>
                  {examType} — {total} question{total !== 1 ? "s" : ""}
                </div>

                <div className={styles["candidate-info"]}>
                  <div>
                    <div className={styles["candidate-label"]}>Name</div>
                    <div className={styles["candidate-field"]}>&nbsp;</div>
                  </div>
                  <div>
                    <div className={styles["candidate-label"]}>Roll No.</div>
                    <div className={styles["candidate-field"]}>&nbsp;</div>
                  </div>
                  <div>
                    <div className={styles["candidate-label"]}>Signature</div>
                    <div
                      className={`${styles["candidate-field"]} ${styles.signature}`}
                    >
                      &nbsp;
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles["right-meta"]}>
                <div className={styles["duration-label"]}>Duration</div>
                <div className={styles["duration-val"]}>—</div>

                {submitted && (
                  <div className={styles["score-box"]}>
                    <div className={styles["score-label"]}>Score</div>
                    <div className={styles["score-val"]}>
                      {score}/{total}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <button onClick={closeExam} className={styles.btn}>
                    Close
                  </button>
                </div>
              </div>
            </div>

            <div className={styles["instructions-box"]}>
              <strong>Instructions:</strong>
              <ul>
                <li>Use the bubble next to each option to mark your answer.</li>
                <li>Only one option is correct for each question.</li>
                <li>Do not make any stray marks on the paper.</li>
              </ul>
            </div>

            <div className={styles["paper-body"]}>
              {fetchingQuestions ? (
                <div>Loading questions...</div>
              ) : total === 0 ? (
                <div>No questions in this test.</div>
              ) : (
                <>
                  <div className={styles["questions-column"]}>
                    {questions.map((qq, idx) => {
                      const qid = String(qq._id ?? qq.id ?? idx);
                      const userIdx = userAnswers[qid];
                      const correctIdx = Array.isArray(qq.options)
                        ? qq.options.findIndex(
                            (o) =>
                              !!o &&
                              (o.isCorrect === true || o.isCorrect === "true"),
                          )
                        : -1;

                      return (
                        <div key={qid} className={styles["q-item"]}>
                          <div className={styles["q-text"]}>
                            <strong>Q{idx + 1}.</strong> {qq.question}
                          </div>

                          <ul className={styles["options-list"]}>
                            {(Array.isArray(qq.options) ? qq.options : []).map(
                              (opt, oi) => {
                                const isUser = userIdx === oi;
                                const isCorrect = oi === correctIdx;
                                const submittedFlag = submitted;
                                return (
                                  <li
                                    key={oi}
                                    onClick={() => selectOption(qid, oi)}
                                    className={optionClass(
                                      isUser,
                                      isCorrect,
                                      submittedFlag,
                                    )}
                                  >
                                    <span
                                      className={bubbleClass(
                                        isUser,
                                        isCorrect,
                                        submittedFlag,
                                      )}
                                    >
                                      {String.fromCharCode(65 + oi)}
                                    </span>
                                    <span className={styles["opt-text"]}>
                                      {opt.text}
                                    </span>
                                  </li>
                                );
                              },
                            )}
                          </ul>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles["footer-bar"]}>
                    <div className={styles["review-note"]}>
                      {submitted
                        ? "Review below. Correct answers are highlighted."
                        : "Mark answers and submit when ready."}
                    </div>

                    <div className={styles["footer-actions"]}>
                      <div className={styles["quick-jump"]}>
                        <div className={styles["quick-jump-label"]}>
                          Quick Jump
                        </div>
                        <div className={styles["nav-grid"]}>
                          {questions.map((qq, i) => {
                            const qid = String(qq._id ?? qq.id ?? i);
                            const status =
                              userAnswers[qid] !== undefined
                                ? "answered"
                                : i === qIndex
                                  ? "current"
                                  : "none";
                            return (
                              <div
                                key={qid}
                                onClick={() => {
                                  jumpTo(i);
                                  const el = document.querySelector(
                                    `.${styles.modal}`,
                                  );
                                  if (el) el.scrollTop = 0;
                                }}
                                className={
                                  status === "answered"
                                    ? `${styles["q-nav-btn"]} ${styles.answered}`
                                    : status === "current"
                                      ? `${styles["q-nav-btn"]} ${styles.current}`
                                      : styles["q-nav-btn"]
                                }
                              >
                                {i + 1}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {!submitted ? (
                        <button
                          onClick={submit}
                          className={`${styles.btn} ${styles.primary}`}
                        >
                          Submit
                        </button>
                      ) : (
                        <div className={styles["post-submitted"]}>
                          <div>
                            Score:{" "}
                            <strong>
                              {score}/{total}
                            </strong>
                          </div>
                          <button
                            onClick={() => {
                              setSubmitted(false);
                              setUserAnswers({});
                              setScore(0);
                            }}
                            className={styles.btn}
                          >
                            Retake
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {submitted && (
                    <div className={styles["answer-key"]}>
                      <h3>Answer Key & Review</h3>
                      {questions.map((qq, idx) => {
                        const qid = String(qq._id ?? qq.id ?? idx);
                        const userIdx = userAnswers[qid];
                        const correctIdx = Array.isArray(qq.options)
                          ? qq.options.findIndex(
                              (o) =>
                                !!o &&
                                (o.isCorrect === true ||
                                  o.isCorrect === "true"),
                            )
                          : -1;
                        return (
                          <div key={qid} className={styles["review-item"]}>
                            <div>
                              <strong>Q{idx + 1}.</strong> {qq.question}
                            </div>
                            <ol type="A" className={styles["review-list"]}>
                              {(qq.options || []).map((opt, oi) => {
                                const isCorrect = oi === correctIdx;
                                const isUser = oi === userIdx;
                                return (
                                  <li
                                    key={oi}
                                    className={
                                      isCorrect
                                        ? styles["review-correct"]
                                        : isUser && !isCorrect
                                          ? styles["review-wrong"]
                                          : ""
                                    }
                                  >
                                    {opt.text}
                                    {isCorrect && <strong> (Correct)</strong>}
                                    {isUser && !isCorrect && (
                                      <span> (Your answer)</span>
                                    )}
                                  </li>
                                );
                              })}
                            </ol>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ...existing code...
