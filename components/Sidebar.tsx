"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menu = [
    {
      name: "Command Center",
      short: "Dashboard",
      code: "01",
      path: "/",
    },
    {
      name: "Neural Guide",
      short: "AI Mentor",
      code: "02",
      path: "/mentor",
    },
    {
      name: "Code Lab",
      short: "Coding Assistant",
      code: "03",
      path: "/coding",
    },
    {
      name: "Career Scanner",
      short: "Resume Analyzer",
      code: "04",
      path: "/resume",
    },
    {
      name: "Simulation Room",
      short: "AI Interview",
      code: "05",
      path: "/interview",
    },
    {
      name: "Knowledge Deck",
      short: "Smart Learning",
      code: "06",
      path: "/learning",
    },
    {
      name: "Placement Command",
      short: "Progress Tracker",
      code: "07",
      path: "/placement",
    },
  ];

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-blue-500/15 bg-[#050b16] p-5">

      {/* BRAND */}
      <div className="mb-7">
        <div className="flex items-center gap-3">

          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-600/25 to-sky-400/10 shadow-[0_0_30px_rgba(37,99,235,0.12)]">

            <span className="text-xl text-sky-300">
              ⌘
            </span>

            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.95)]" />

          </div>

          <div>
            <h1 className="text-sm font-bold tracking-[0.18em] text-[#e1ecff]">
              AIEC
            </h1>

            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-sky-400/70">
              Engineering OS
            </p>
          </div>

        </div>
      </div>

      {/* SYSTEM STATUS */}
      <div className="mb-6 rounded-2xl border border-blue-500/15 bg-gradient-to-r from-[#09182c] to-[#071323] p-4">

        <div className="flex items-center justify-between">

          <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#9eb5d4]">
            System Status
          </span>

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,1)]" />

            <span className="text-[10px] font-bold text-sky-300">
              ONLINE
            </span>

          </div>

        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#030914]">

          <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-blue-600 via-blue-400 to-sky-300 shadow-[0_0_12px_rgba(59,130,246,0.45)]" />

        </div>

        <p className="mt-2 text-[10px] text-[#6f89aa]">
          AI modules operational
        </p>

      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">

        {menu.map((item) => {
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                group relative flex items-center gap-4
                overflow-hidden rounded-2xl border px-4 py-3.5
                transition-all duration-200

                ${
                  active
                    ? "border-blue-400/40 bg-gradient-to-r from-blue-600/20 to-sky-400/[0.06] text-sky-200 shadow-[0_8px_25px_rgba(37,99,235,0.12)]"
                    : "border-blue-950 bg-[#071323] text-[#a9bdd8] hover:border-blue-500/30 hover:bg-[#0a1b31] hover:text-[#e2edff]"
                }
              `}
            >

              {/* ACTIVE GLOW */}
              {active && (
                <>
                  <div className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-sky-400 shadow-[0_0_16px_rgba(56,189,248,1)]" />

                  <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-blue-500/10 to-transparent" />
                </>
              )}

              {/* NUMBER */}
              <div
                className={`
                  relative z-10 flex h-9 w-9 shrink-0
                  items-center justify-center rounded-xl border
                  font-mono text-[10px] font-bold

                  ${
                    active
                      ? "border-sky-400/35 bg-blue-500/15 text-sky-300"
                      : "border-blue-800/40 bg-[#040d1b] text-[#6685ad] group-hover:text-blue-300"
                  }
                `}
              >
                {item.code}
              </div>

              {/* TEXT */}
              <div className="relative z-10 min-w-0">

                <p
                  className={`truncate text-sm font-semibold ${
                    active
                      ? "text-[#d9ecff]"
                      : "text-[#a9bdd8] group-hover:text-[#e2edff]"
                  }`}
                >
                  {item.name}
                </p>

                <p
                  className={`mt-0.5 truncate text-[10px] uppercase tracking-[0.13em] ${
                    active
                      ? "text-sky-400/70"
                      : "text-[#5f789a] group-hover:text-[#819bbc]"
                  }`}
                >
                  {item.short}
                </p>

              </div>

              {/* ACTIVE DOT */}
              {active && (
                <span className="relative z-10 ml-auto h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,1)]" />
              )}

            </Link>
          );
        })}

      </nav>

      {/* DAILY PROTOCOL */}
      <div className="mt-5 rounded-2xl border border-blue-500/15 bg-gradient-to-br from-[#09182c] to-[#06111f] p-4">

        <div className="flex items-center justify-between">

          <span className="text-[10px] uppercase tracking-[0.16em] text-[#8fa8c8]">
            Daily Protocol
          </span>

          <span className="font-mono text-xs font-bold text-sky-300">
            72%
          </span>

        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#030914]">

          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-blue-600 to-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.35)]" />

        </div>

        <Link
          href="/placement"
          className="mt-4 block rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-4 py-2.5 text-center text-xs font-bold text-white shadow-[0_8px_22px_rgba(37,99,235,0.25)] transition hover:from-blue-500 hover:to-sky-400"
        >
          Open Placement Command →
        </Link>

      </div>

    </aside>
  );
}