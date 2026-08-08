"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e?: React.FormEvent) {
    e?.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Please enter your email.");
      return;
    }

    if (!password) {
      setMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (!data.session) {
        setMessage("Login failed. Session was not created.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050b16] px-4">

      <div className="w-full max-w-md rounded-[30px] border border-blue-400/15 bg-[#08172a] p-8 shadow-2xl">

        {/* HEADER */}
        <div className="mb-8">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-3 py-2">

            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]" />

            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-sky-300">
              Secure Access
            </span>

          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#718cac]">
            Sign in to continue to your AI Engineering Copilot.
          </p>

        </div>

        {/* LOGIN FORM */}
        <form onSubmit={handleLogin}>

          {/* EMAIL */}
          <div>

            <label
              htmlFor="email"
              className="text-xs font-semibold text-[#8ea7c6]"
            >
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setMessage("");
              }}
              placeholder="Enter your email"
              className="mt-2 w-full rounded-xl border border-blue-400/15 bg-[#06111f] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#526d8d] focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/5"
            />

          </div>

          {/* PASSWORD */}
          <div className="mt-5">

            <label
              htmlFor="password"
              className="text-xs font-semibold text-[#8ea7c6]"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setMessage("");
              }}
              placeholder="Enter your password"
              className="mt-2 w-full rounded-xl border border-blue-400/15 bg-[#06111f] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#526d8d] focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/5"
            />

          </div>

          {/* ERROR MESSAGE */}
          {message && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3">

              <p className="text-xs leading-5 text-red-300">
                {message}
              </p>

            </div>
          )}

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,99,235,0.25)] transition hover:from-blue-500 hover:to-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "SIGNING IN..." : "LOGIN →"}
          </button>

        </form>

        {/* DIVIDER */}
        <div className="my-7 flex items-center gap-3">

          <div className="h-px flex-1 bg-blue-400/10" />

          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#526d8d]">
            New Operator
          </span>

          <div className="h-px flex-1 bg-blue-400/10" />

        </div>

        {/* SIGNUP */}
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="w-full rounded-xl border border-blue-400/15 bg-blue-500/[0.03] px-5 py-3.5 text-xs font-bold text-sky-300 transition hover:border-sky-400/30 hover:bg-blue-500/[0.08]"
        >
          CREATE NEW ACCOUNT
        </button>

        {/* STATUS */}
        <div className="mt-7 flex items-center justify-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />

          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#526d8d]">
            Authentication System Online
          </span>

        </div>

      </div>

    </div>
  );
}