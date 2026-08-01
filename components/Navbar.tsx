"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b px-8 py-4 bg-[var(--background)] text-[var(--foreground)]">

      <Link
        href="/"
        className="text-2xl font-bold"
      >
        🤖 AI Engineering Copilot
      </Link>


      <div className="flex items-center gap-4">

        <Link
          href="/login"
          className="rounded-xl border px-4 py-2"
        >
          Login
        </Link>


        <Link
          href="/signup"
          className="rounded-xl bg-blue-600 px-4 py-2 text-white"
        >
          Sign Up
        </Link>


        <button
          onClick={() => {
            localStorage.removeItem("mentorChats");
            alert("Logged out");
          }}
          className="rounded-xl bg-red-500 px-4 py-2 text-white"
        >
          Logout
        </button>

      </div>

    </nav>
  );
}