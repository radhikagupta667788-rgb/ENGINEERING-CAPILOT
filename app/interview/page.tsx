"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type SessionRecord = {
  question: string;
  answer: string;
  score: number;
  feedback: string;
};

type InterviewHistory = {
  id: number;
  interview_type: string;
  average_score: number;
  questions_answered: number;
  summary: string | null;
  created_at: string;
};

export default function InterviewPage() {
  const [type, setType] =
    useState("Technical");

  const [started, setStarted] =
    useState(false);

  const [answer, setAnswer] =
    useState("");

  const [feedback, setFeedback] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [ending, setEnding] =
    useState(false);

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [score, setScore] =
    useState<number | null>(null);

  const [aiNextQuestion, setAiNextQuestion] =
    useState("");

  const [dynamicQuestion, setDynamicQuestion] =
    useState("");

  const [sessionRecords, setSessionRecords] =
    useState<SessionRecord[]>([]);

  const [finalSummary, setFinalSummary] =
    useState("");

  const [finalScore, setFinalScore] =
    useState<number | null>(null);

  const [sessionEnded, setSessionEnded] =
    useState(false);

  const [history, setHistory] =
    useState<InterviewHistory[]>([]);

  const [historyLoading, setHistoryLoading] =
    useState(true);

  const [selectedHistory, setSelectedHistory] =
    useState<InterviewHistory | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const technicalQuestions = [
    "Explain OOP concepts in Java.",
    "What is the difference between process and thread?",
    "Explain normalization in DBMS.",
    "What is the difference between TCP and UDP?",
  ];

  const hrQuestions = [
    "Tell me about yourself.",
    "What are your strengths and weaknesses?",
    "Why should we hire you?",
    "Where do you see yourself in 5 years?",
  ];

  const baseQuestions =
    type === "Technical"
      ? technicalQuestions
      : hrQuestions;

  const currentQuestion =
    dynamicQuestion ||
    baseQuestions[
      questionIndex %
        baseQuestions.length
    ];

  async function loadHistory() {
    try {
      setHistoryLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHistory([]);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("interview_sessions")
        .select(
          "id,interview_type,average_score,questions_answered,summary,created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.log(
          "INTERVIEW HISTORY ERROR:",
          error
        );

        return;
      }

      setHistory(
        (data || []) as InterviewHistory[]
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  function resetSession() {
    setStarted(false);
    setAnswer("");
    setFeedback("");
    setScore(null);
    setAiNextQuestion("");
    setDynamicQuestion("");
    setQuestionIndex(0);
    setSessionRecords([]);
    setFinalSummary("");
    setFinalScore(null);
    setSessionEnded(false);
  }

  function startInterview() {
    setStarted(true);
    setAnswer("");
    setFeedback("");
    setScore(null);
    setAiNextQuestion("");
    setDynamicQuestion("");
    setQuestionIndex(0);
    setSessionRecords([]);
    setFinalSummary("");
    setFinalScore(null);
    setSessionEnded(false);
  }

  async function submitAnswer() {
    if (!answer.trim()) {
      return;
    }

    try {
      setLoading(true);
      setFeedback("");
      setScore(null);
      setAiNextQuestion("");

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setFeedback(
          "Please login first."
        );

        return;
      }

      const res =
        await fetch(
          "/api/interview",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body: JSON.stringify({
              type,
              question:
                currentQuestion,
              answer,
            }),
          }
        );

      const responseText =
        await res.text();

      let data: any;

      try {
        data =
          JSON.parse(
            responseText
          );
      } catch {
        throw new Error(
          responseText ||
            "Invalid server response"
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Interview evaluation failed"
        );
      }

      const receivedScore =
        typeof data.score ===
        "number"
          ? data.score
          : 0;

      const receivedFeedback =
        data.feedback ||
        "No feedback received.";

      setFeedback(
        receivedFeedback
      );

      setScore(
        receivedScore
      );

      setAiNextQuestion(
        data.nextQuestion ||
          ""
      );

      setSessionRecords(
        (prev) => [
          ...prev,
          {
            question:
              currentQuestion,

            answer:
              answer.trim(),

            score:
              receivedScore,

            feedback:
              receivedFeedback,
          },
        ]
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "Interview evaluation failed"
      );
    } finally {
      setLoading(false);
    }
  }

  function nextQuestion() {
    if (aiNextQuestion) {
      setDynamicQuestion(
        aiNextQuestion
      );
    } else {
      setDynamicQuestion("");
    }

    setQuestionIndex(
      (prev) =>
        prev + 1
    );

    setAnswer("");
    setFeedback("");
    setScore(null);
    setAiNextQuestion("");
  }

  async function endSession() {
    if (
      sessionRecords.length ===
      0
    ) {
      resetSession();
      return;
    }

    try {
      setEnding(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setFeedback(
          "Please login first."
        );

        return;
      }

      const totalScore =
        sessionRecords.reduce(
          (total, item) =>
            total +
            item.score,
          0
        );

      const average =
        totalScore /
        sessionRecords.length;

      const roundedAverage =
        Math.round(
          average * 10
        ) / 10;

      const sorted =
        [...sessionRecords].sort(
          (a, b) =>
            b.score -
            a.score
        );

      const strongest =
        sorted[0];

      const weakest =
        sorted[
          sorted.length - 1
        ];

      const summary = `You completed ${
        sessionRecords.length
      } ${type} interview question${
        sessionRecords.length > 1
          ? "s"
          : ""
      } with an average score of ${roundedAverage}/10.

Strongest response:
${
  strongest?.question ||
  "N/A"
} — ${
        strongest?.score ?? 0
      }/10

Needs most improvement:
${
  weakest?.question ||
  "N/A"
} — ${
        weakest?.score ?? 0
      }/10

Recommendation:
Review your lower-scoring answers, practice structured responses and repeat the simulation to improve consistency.`;

      const {
        error: saveError,
      } = await supabase
        .from(
          "interview_sessions"
        )
        .insert({
          user_id:
            session.user.id,

          interview_type:
            type,

          average_score:
            roundedAverage,

          questions_answered:
            sessionRecords.length,

          summary,
        });

      if (saveError) {
        throw saveError;
      }

      const {
        error: activityError,
      } = await supabase
        .from("activities")
        .insert({
          user_id:
            session.user.id,

          action:
            `Completed ${type} Interview Session - ${roundedAverage}/10`,
        });

      if (activityError) {
        console.log(
          "INTERVIEW SESSION ACTIVITY ERROR:",
          activityError
        );
      }

      setFinalScore(
        roundedAverage
      );

      setFinalSummary(
        summary
      );

      setSessionEnded(true);
      setStarted(false);

      await loadHistory();
    } catch (error) {
      console.log(
        "END SESSION ERROR:",
        error
      );

      setFeedback(
        error instanceof Error
          ? error.message
          : "Unable to end interview session."
      );
    } finally {
      setEnding(false);
    }
  }

  async function deleteHistory(
    id: number
  ) {
    const oldHistory =
      history;

    setHistory(
      (prev) =>
        prev.filter(
          (item) =>
            item.id !== id
        )
    );

    if (
      selectedHistory?.id ===
      id
    ) {
      setSelectedHistory(
        null
      );
    }

    const {
      error,
    } = await supabase
      .from(
        "interview_sessions"
      )
      .delete()
      .eq("id", id);

    if (error) {
      console.log(
        "INTERVIEW HISTORY DELETE ERROR:",
        error
      );

      setHistory(
        oldHistory
      );
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="signal-panel relative overflow-hidden rounded-[30px] p-7 md:p-9">

        <div className="relative z-10 max-w-3xl">

          <div className="system-label">

            <span className="signal-dot" />

            Simulation Engine Ready

          </div>

          <h1 className="mt-5 text-3xl font-bold text-white md:text-4xl">
            Simulation Room
          </h1>

          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#5cf2d6]/60">
            AI Mock Interview
          </p>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/50">
            Practice technical and HR interviews with
            AI-powered evaluation, scoring, adaptive
            questions and final session analysis.
          </p>

        </div>

      </section>

      {/* CONFIGURATION */}
      <section className="command-panel rounded-3xl p-6">

        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
          Simulation Configuration
        </p>

        <h2 className="mt-2 text-xl font-semibold text-white">
          Select interview protocol
        </h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">

          <button
            onClick={() => {
              resetSession();
              setType(
                "Technical"
              );
            }}
            className={`rounded-2xl border p-5 text-left transition ${
              type ===
              "Technical"
                ? "border-[#5cf2d6]/30 bg-[#5cf2d6]/10"
                : "border-emerald-300/10 bg-emerald-300/[0.02]"
            }`}
          >

            <div className="flex items-center justify-between">

              <span className="font-mono text-[9px] text-emerald-100/30">
                INT-01
              </span>

              {type ===
                "Technical" && (
                <span className="signal-dot" />
              )}

            </div>

            <h3 className="mt-4 text-base font-semibold text-white">
              Technical Protocol
            </h3>

            <p className="mt-2 text-xs leading-6 text-emerald-50/35">
              Java, DSA, DBMS, OS and networking questions.
            </p>

          </button>

          <button
            onClick={() => {
              resetSession();
              setType("HR");
            }}
            className={`rounded-2xl border p-5 text-left transition ${
              type === "HR"
                ? "border-[#c8ff5c]/30 bg-[#c8ff5c]/10"
                : "border-emerald-300/10 bg-emerald-300/[0.02]"
            }`}
          >

            <div className="flex items-center justify-between">

              <span className="font-mono text-[9px] text-emerald-100/30">
                INT-02
              </span>

              {type ===
                "HR" && (
                <span className="signal-dot" />
              )}

            </div>

            <h3 className="mt-4 text-base font-semibold text-white">
              HR Protocol
            </h3>

            <p className="mt-2 text-xs leading-6 text-emerald-50/35">
              Communication, behavioral and placement HR questions.
            </p>

          </button>

        </div>

        {!started &&
          !sessionEnded && (
            <button
              onClick={
                startInterview
              }
              className="signal-button mt-6 rounded-xl px-7 py-3 text-xs font-bold"
            >
              START{" "}
              {type.toUpperCase()}{" "}
              SIMULATION →
            </button>
          )}

      </section>

      {/* ACTIVE SESSION */}
      {started && (
        <section className="grid gap-5 xl:grid-cols-3">

          <div className="command-panel rounded-3xl p-6 xl:col-span-2">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
                  Active Question
                </p>

                <h2 className="mt-2 text-lg font-semibold text-white">
                  Interviewer Prompt
                </h2>

              </div>

              <div className="flex items-center gap-2">

                <span className="signal-dot" />

                <span className="font-mono text-[9px] text-lime-200">
                  LIVE
                </span>

              </div>

            </div>

            <div className="mt-6 rounded-2xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 p-5">

              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5cf2d6]/50">
                Question{" "}
                {questionIndex + 1}
              </p>

              <p className="mt-3 text-base leading-7 text-white/80">
                {currentQuestion}
              </p>

            </div>

            <textarea
              value={answer}
              onChange={(e) =>
                setAnswer(
                  e.target.value
                )
              }
              placeholder="Type your interview answer here..."
              className="command-input mt-5 min-h-48 w-full resize-none rounded-2xl p-5 text-sm leading-7 text-white"
            />

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                onClick={
                  submitAnswer
                }
                disabled={
                  !answer.trim() ||
                  loading ||
                  Boolean(feedback)
                }
                className="signal-button rounded-xl px-6 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading
                  ? "EVALUATING..."
                  : feedback
                  ? "ANSWER REVIEWED"
                  : "SUBMIT FOR AI REVIEW →"}
              </button>

              <button
                onClick={
                  endSession
                }
                disabled={
                  ending
                }
                className="ghost-button rounded-xl px-6 py-3 text-xs font-semibold disabled:opacity-50"
              >
                {ending
                  ? "ENDING SESSION..."
                  : "END SESSION"}
              </button>

            </div>

            {feedback && (
              <div className="mt-6 rounded-2xl border border-lime-300/10 bg-lime-300/[0.03] p-5">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-lime-200/50">
                      AI Evaluation
                    </p>

                    <h3 className="mt-1 text-base font-semibold text-white">
                      Interview Feedback
                    </h3>

                  </div>

                  {score !==
                    null && (
                    <div className="rounded-xl border border-lime-300/15 bg-lime-300/[0.05] px-4 py-2">

                      <span className="font-mono text-lg font-bold text-lime-200">
                        {score}/10
                      </span>

                    </div>
                  )}

                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-emerald-50/65">
                  {feedback}
                </p>

                {aiNextQuestion && (
                  <div className="mt-5 rounded-xl border border-[#5cf2d6]/10 bg-[#5cf2d6]/[0.025] p-4">

                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5cf2d6]/45">
                      AI Next Prompt
                    </p>

                    <p className="mt-2 text-sm leading-6 text-white/70">
                      {aiNextQuestion}
                    </p>

                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    onClick={
                      nextQuestion
                    }
                    className="signal-button rounded-xl px-6 py-2.5 text-xs font-bold"
                  >
                    NEXT QUESTION →
                  </button>

                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        feedback
                      )
                    }
                    className="ghost-button rounded-xl px-5 py-2.5 text-xs font-semibold"
                  >
                    COPY FEEDBACK
                  </button>

                </div>

              </div>
            )}

          </div>

          {/* STATUS */}
          <div className="command-panel rounded-3xl p-6">

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/35">
              Session Telemetry
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Interview Status
            </h2>

            <div className="mt-6 space-y-3">

              <StatusRow
                label="Protocol"
                value={type}
              />

              <StatusRow
                label="Question"
                value={`#${
                  questionIndex +
                  1
                }`}
              />

              <StatusRow
                label="Completed"
                value={String(
                  sessionRecords.length
                )}
              />

              <StatusRow
                label="Current Score"
                value={
                  score !== null
                    ? `${score}/10`
                    : "--"
                }
              />

            </div>

          </div>

        </section>
      )}

      {/* FINAL REPORT */}
      {sessionEnded &&
        finalScore !== null && (
          <section className="signal-panel rounded-[30px] p-7 md:p-9">

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#5cf2d6]/50">
              Simulation Complete
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-5">

              <div>

                <h2 className="text-2xl font-bold text-white">
                  Interview Session Report
                </h2>

                <p className="mt-2 text-sm text-emerald-50/45">
                  {type} interview performance summary
                </p>

              </div>

              <div className="rounded-2xl border border-lime-300/15 bg-lime-300/[0.05] px-6 py-4 text-center">

                <p className="font-mono text-3xl font-bold text-lime-200">
                  {finalScore}/10
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-emerald-100/35">
                  Average Score
                </p>

              </div>

            </div>

            <div className="mt-6 rounded-2xl border border-emerald-300/10 bg-black/10 p-5">

              <p className="whitespace-pre-wrap text-sm leading-7 text-emerald-50/65">
                {finalSummary}
              </p>

            </div>

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                onClick={
                  startInterview
                }
                className="signal-button rounded-xl px-6 py-3 text-xs font-bold"
              >
                START NEW SESSION →
              </button>

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    finalSummary
                  )
                }
                className="ghost-button rounded-xl px-6 py-3 text-xs font-semibold"
              >
                COPY REPORT
              </button>

            </div>

          </section>
        )}

      {/* INTERVIEW HISTORY */}
      <section className="command-panel rounded-3xl p-6">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-100/30">
              Simulation Archive
            </p>

            <h2 className="mt-2 text-lg font-semibold text-white">
              Interview History
            </h2>

            <p className="mt-2 text-xs text-emerald-50/35">
              Review your previous interview performance.
            </p>

          </div>

          <span className="rounded-full border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 px-3 py-2 font-mono text-[9px] text-[#5cf2d6]">
            {history.length} SAVED
          </span>

        </div>

        <div className="mt-6 space-y-3">

          {historyLoading ? (
            <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.025] p-5">

              <p className="font-mono text-[10px] text-emerald-100/35">
                LOADING INTERVIEW HISTORY...
              </p>

            </div>
          ) : history.length ===
            0 ? (
            <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.025] p-6 text-center">

              <p className="text-sm text-emerald-50/40">
                No completed interview sessions yet.
              </p>

            </div>
          ) : (
            history.map(
              (
                item,
                index
              ) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  index={index}
                  onOpen={
                    setSelectedHistory
                  }
                  onDelete={
                    deleteHistory
                  }
                />
              )
            )
          )}

        </div>

      </section>

      {/* OPEN HISTORY */}
      {selectedHistory && (
        <section className="signal-panel rounded-[30px] p-6">

          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-300/10 pb-4">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#5cf2d6]/45">
                Archived Simulation
              </p>

              <h2 className="mt-2 text-lg font-semibold text-white">
                {selectedHistory.interview_type} Interview
              </h2>

              <p className="mt-1 text-xs text-emerald-50/35">
                {
                  selectedHistory.questions_answered
                }{" "}
                questions •{" "}
                {
                  selectedHistory.average_score
                }
                /10
              </p>

            </div>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    selectedHistory.summary ||
                      ""
                  )
                }
                className="ghost-button rounded-xl px-4 py-2 text-xs"
              >
                COPY
              </button>

              <button
                onClick={() =>
                  setSelectedHistory(
                    null
                  )
                }
                className="ghost-button rounded-xl px-4 py-2 text-xs"
              >
                CLOSE
              </button>

            </div>

          </div>

          <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-emerald-50/60">
            {selectedHistory.summary ||
              "No summary saved."}
          </p>

        </section>
      )}

    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-emerald-300/10 bg-emerald-300/[0.025] px-4 py-3">

      <span className="text-xs text-emerald-50/40">
        {label}
      </span>

      <span className="font-mono text-[10px] font-semibold text-[#c8ff5c]">
        {value}
      </span>

    </div>
  );
}

function HistoryRow({
  item,
  index,
  onOpen,
  onDelete,
}: {
  item: InterviewHistory;
  index: number;
  onOpen: (
    item: InterviewHistory
  ) => void;
  onDelete: (
    id: number
  ) => void;
}) {
  const date =
    new Date(
      item.created_at
    ).toLocaleDateString();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.025] p-4 md:flex-row md:items-center">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 font-mono text-[10px] text-[#5cf2d6]">

        {String(
          index + 1
        ).padStart(
          2,
          "0"
        )}

      </div>

      <div className="min-w-0 flex-1">

        <p className="text-sm font-semibold text-white/80">
          {item.interview_type} Interview
        </p>

        <p className="mt-1 text-[10px] text-emerald-50/35">
          {date} •{" "}
          {item.questions_answered} questions •{" "}
          {item.average_score}/10
        </p>

      </div>

      <div className="flex gap-2">

        <button
          onClick={() =>
            onOpen(item)
          }
          className="rounded-lg border border-[#5cf2d6]/15 bg-[#5cf2d6]/5 px-4 py-2 text-xs text-[#5cf2d6]"
        >
          OPEN
        </button>

        <button
          onClick={() =>
            onDelete(
              item.id
            )
          }
          className="rounded-lg px-4 py-2 text-xs text-red-300 transition hover:bg-red-400/10"
        >
          DELETE
        </button>

      </div>

    </div>
  );
}