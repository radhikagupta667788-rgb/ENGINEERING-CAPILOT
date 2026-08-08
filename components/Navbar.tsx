"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Activity = {
  id: string | number;
  action: string;
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadActivities();
    }
  }, [user]);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }

  async function loadActivities() {
    if (!user) return;

    const {
      data,
      error,
    } = await supabase
      .from("activities")
      .select("id, action")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (error) {
      console.log(
        "Navbar activity error:",
        error
      );

      return;
    }

    setActivities(data || []);
  }

  const pageInfo: Record<
    string,
    {
      title: string;
      subtitle: string;
      code: string;
    }
  > = {
    "/": {
      title: "Command Center",
      subtitle: "Engineering Intelligence Dashboard",
      code: "SYS-01",
    },

    "/mentor": {
      title: "Neural Guide",
      subtitle: "AI Engineering Mentor",
      code: "SYS-02",
    },

    "/coding": {
      title: "Code Lab",
      subtitle: "AI Coding Assistant",
      code: "SYS-03",
    },

    "/resume": {
      title: "Career Scanner",
      subtitle: "AI Resume Intelligence",
      code: "SYS-04",
    },

    "/interview": {
      title: "Simulation Room",
      subtitle: "AI Mock Interview",
      code: "SYS-05",
    },

    "/learning": {
      title: "Knowledge Deck",
      subtitle: "Smart AI Learning System",
      code: "SYS-06",
    },

    "/profile": {
      title: "Operator Profile",
      subtitle: "Account & Workspace Identity",
      code: "USR-01",
    },
  };

  const current =
    pageInfo[pathname] ||
    {
      title: "AI Engineering Copilot",
      subtitle: "Engineering Operating System",
      code: "AIEC",
    };

  const handleSearch = () => {
    const value =
      search.trim().toLowerCase();

    if (!value) return;

    if (
      value.includes("mentor") ||
      value.includes("neural")
    ) {
      router.push("/mentor");
    } else if (
      value.includes("coding") ||
      value.includes("code")
    ) {
      router.push("/coding");
    } else if (
      value.includes("resume") ||
      value.includes("career") ||
      value.includes("ats")
    ) {
      router.push("/resume");
    } else if (
      value.includes("interview") ||
      value.includes("simulation")
    ) {
      router.push("/interview");
    } else if (
      value.includes("learning") ||
      value.includes("study") ||
      value.includes("knowledge")
    ) {
      router.push("/learning");
    } else if (
      value.includes("profile") ||
      value.includes("operator")
    ) {
      router.push("/profile");
    } else if (
      value.includes("dashboard") ||
      value.includes("command") ||
      value.includes("home")
    ) {
      router.push("/");
    } else {
      alert("No matching module found.");
    }

    setSearch("");
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setProfileOpen(false);
    setNotificationOpen(false);

    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-blue-500/15 bg-[#050d19]/95 backdrop-blur-xl">

      <div className="flex min-h-20 items-center justify-between gap-5 px-6">

        {/* CURRENT PAGE */}
        <div className="hidden min-w-[240px] xl:block">

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,1)]" />

            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[#6485ad]">
              {current.code}
            </span>

          </div>

          <h2 className="mt-1 text-lg font-semibold text-[#d6e6fb]">
            {current.title}
          </h2>

          <p className="mt-0.5 text-[10px] text-[#607a9a]">
            {current.subtitle}
          </p>

        </div>

        {/* SEARCH */}
        <div className="mx-auto w-full max-w-xl">

          <div className="group flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-[#071525] px-4 py-3 transition-all duration-200 focus-within:border-sky-400/50 focus-within:bg-[#091a30] focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.07)]">

            <span className="text-sky-400/70">
              ⌘
            </span>

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  handleSearch();
                }
              }}
              placeholder="Search module or command..."
              className="w-full bg-transparent text-sm text-[#d0e2f8] outline-none placeholder:text-[#536d8f]"
            />

            <span className="rounded-lg border border-blue-500/15 bg-blue-500/[0.05] px-2 py-1 font-mono text-[9px] text-[#6b86a8]">
              ENTER
            </span>

          </div>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* AI STATUS */}
          <div className="hidden items-center gap-2 rounded-xl border border-blue-500/15 bg-[#071525] px-3 py-2 lg:flex">

            <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,1)]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-300">
              AI Online
            </span>

          </div>

          {/* NOTIFICATIONS */}
          <div className="relative">

            <button
              type="button"
              onClick={() => {
                setNotificationOpen(
                  !notificationOpen
                );

                setProfileOpen(false);

                if (
                  !notificationOpen
                ) {
                  loadActivities();
                }
              }}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/15 bg-[#071525] text-[#87a9d1] transition hover:border-blue-400/30 hover:bg-[#0b1d35] hover:text-sky-300"
            >
              <span className="text-base">
                ◉
              </span>

              {activities.length > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.95)]" />
              )}

            </button>

            {notificationOpen && (
              <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-blue-500/15 bg-[#071525] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">

                <div className="flex items-center justify-between border-b border-blue-500/10 pb-3">

                  <div>
                    <p className="text-sm font-semibold text-[#d6e7fb]">
                      System Activity
                    </p>

                    <p className="mt-1 text-[10px] text-[#627d9f]">
                      Recent workspace events
                    </p>
                  </div>

                  <span className="h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,1)]" />

                </div>

                <div className="mt-3 space-y-2">

                  {activities.length > 0 ? (
                    activities.map(
                      (activity) => (
                        <div
                          key={
                            activity.id
                          }
                          className="flex items-center gap-3 rounded-xl border border-blue-500/10 bg-[#08172a] p-3"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-500/[0.06]">

                            <span className="h-2 w-2 rounded-full bg-sky-400" />

                          </div>

                          <p className="text-xs leading-5 text-[#9db6d4]">
                            {
                              activity.action
                            }
                          </p>
                        </div>
                      )
                    )
                  ) : (
                    <div className="rounded-xl border border-blue-500/10 bg-[#08172a] p-4 text-center">

                      <p className="text-xs text-[#627d9f]">
                        No recent activity
                      </p>

                    </div>
                  )}

                </div>

              </div>
            )}

          </div>

          {/* USER */}
          {user ? (
            <div className="relative">

              <button
                onClick={() => {
                  setProfileOpen(
                    !profileOpen
                  );

                  setNotificationOpen(
                    false
                  );
                }}
                className="flex items-center gap-3 rounded-xl border border-blue-500/15 bg-[#071525] p-1.5 pr-3 transition hover:border-blue-400/25 hover:bg-[#0a1b31]"
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-sky-400 font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.24)]">

                  {(
                    user
                      .user_metadata
                      ?.full_name?.[0] ||
                    user.email?.[0] ||
                    "A"
                  ).toUpperCase()}

                </div>

                <div className="hidden max-w-32 text-left md:block">

                  <p className="truncate text-xs font-semibold text-[#d4e4f8]">
                    {user
                      .user_metadata
                      ?.full_name ||
                      "AI Engineer"}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-[#6685ad]">
                    Operator
                  </p>

                </div>

                <span className="text-[10px] text-[#60799a]">
                  ▾
                </span>

              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-blue-500/15 bg-[#071525] p-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">

                  <div className="border-b border-blue-500/10 p-2 pb-4">

                    <p className="text-sm font-semibold text-[#d6e7fb]">
                      {user
                        .user_metadata
                        ?.full_name ||
                        "AI Engineer"}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#6d87a7]">
                      {user.email}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.05] px-3 py-1.5">

                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />

                      <span className="font-mono text-[9px] text-sky-300">
                        SESSION ACTIVE
                      </span>

                    </div>

                  </div>

                  <button
                    onClick={() => {
                      setProfileOpen(
                        false
                      );

                      router.push(
                        "/profile"
                      );
                    }}
                    className="mt-3 w-full rounded-xl px-3 py-2.5 text-left text-sm text-[#9db7d8] transition hover:bg-blue-500/[0.07] hover:text-sky-200"
                  >
                    Operator Profile
                  </button>

                  <button
                    onClick={logout}
                    className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-400/10"
                  >
                    End Session
                  </button>

                </div>
              )}

            </div>
          ) : (
            <button
              onClick={() =>
                router.push(
                  "/login"
                )
              }
              className="rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-5 py-2.5 text-xs font-bold text-white shadow-[0_8px_22px_rgba(37,99,235,0.25)] transition hover:from-blue-500 hover:to-sky-400"
            >
              Start Session
            </button>
          )}

        </div>

      </div>

    </header>
  );
}