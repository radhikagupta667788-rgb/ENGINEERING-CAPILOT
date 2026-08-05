"use client";

import { useState } from "react";
import { markActive } from "@/lib/notifications";

export default function SmartLearning() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState("Quick Revision");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const askAI = async () => {
    if (!pdf) {
      setResult("Please upload PDF first.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();

      formData.append("pdf", pdf);
      formData.append("question", question);
      formData.append("mode", mode);

      const response = await fetch("/api/learning", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setResult(data.result);
      markActive();

    } catch (error) {
      setResult(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="theme-card mx-auto max-w-6xl rounded-3xl p-8 shadow-lg">

      <h1 className="text-3xl font-bold">
        📚 Smart Learning AI
      </h1>

      <p className="theme-muted mt-2">
        Chat with your PDF, generate notes and prepare for exams.
      </p>


      <label className="mt-8 block cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center">

        <span className="font-semibold text-blue-600">
          📂 Upload Study PDF
        </span>

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e)=>{
            setPdf(e.target.files?.[0] || null);
          }}
        />

        <p className="theme-muted mt-3">
          {pdf ? pdf.name : "Click to select PDF"}
        </p>

      </label>


      <div className="mt-6 grid gap-5 md:grid-cols-2">


        <div>
          <label className="font-semibold">
            Learning Mode
          </label>

          <select
            value={mode}
            onChange={(e)=>setMode(e.target.value)}
            className="theme-card mt-2 w-full rounded-xl p-3"
          >

            <option>
              Quick Revision
            </option>

            <option>
              Exam Answer
            </option>

            <option>
              Interview Preparation
            </option>

            <option>
              Generate Quiz
            </option>

          </select>

        </div>


        <div>
          <label className="font-semibold">
            Ask From PDF
          </label>

          <input
            value={question}
            onChange={(e)=>setQuestion(e.target.value)}
            placeholder="Explain chapter 3..."
            className="theme-card mt-2 w-full rounded-xl p-3"
          />

        </div>


      </div>


      <button
        onClick={askAI}
        disabled={!pdf || loading}
        className="theme-primary mt-6 rounded-xl px-6 py-3 font-semibold"
      >

        {
          loading
          ? "AI Thinking..."
          : "🤖 Generate"
        }

      </button>


      {
        result && (

          <div className="mt-8 rounded-2xl border p-6">

            <h2 className="text-2xl font-bold">
              🧠 AI Response
            </h2>


            <pre className="mt-4 whitespace-pre-wrap font-sans leading-8">
              {result}
            </pre>


          </div>

        )
      }


    </div>
  );
}