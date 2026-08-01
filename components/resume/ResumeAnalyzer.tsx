"use client";

import { useState } from "react";

export default function ResumeAnalyzer() {
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleAnalyze = async () => {
    if (!resume) {
      setResult("Please select a PDF resume.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();
      formData.append("resume", resume);

      const response = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Resume analysis failed.");
      }

      setResult(data.result);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-8 text-gray-900 shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900">
        📄 AI Resume ATS Analyzer
      </h1>

      <p className="mt-2 text-gray-600">
        Upload your resume and get an ATS score, missing skills, and improvement
        suggestions.
      </p>

      <label className="mt-8 block cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-10 text-center transition hover:border-blue-500 hover:bg-blue-50">
        <span className="text-lg font-semibold text-blue-600">
          📂 Choose PDF Resume
        </span>

        <input
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            setResume(file);
            setResult("");
          }}
        />

        <p className="mt-3 text-sm text-gray-600">
          {resume ? resume.name : "Click here to select your resume PDF"}
        </p>
      </label>

      {resume && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-green-700">
          ✅ Selected file: {resume.name}
        </div>
      )}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!resume || loading}
        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Analyzing Resume..." : "📊 Analyze Resume"}
      </button>

      {result && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm">
          <h2 className="mb-5 text-2xl font-bold text-gray-900">
            📊 AI Resume Analysis
          </h2>

          <pre className="whitespace-pre-wrap break-words font-sans text-base leading-7 text-gray-900">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}