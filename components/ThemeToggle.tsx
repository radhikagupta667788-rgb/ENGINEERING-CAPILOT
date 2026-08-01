"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [dark, setDark] = useState(false);


  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if(theme === "dark"){
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);


  const toggleTheme = () => {

    const html = document.documentElement;

    if(html.classList.contains("dark")){

      html.classList.remove("dark");
      localStorage.setItem("theme","light");
      setDark(false);

    } else {

      html.classList.add("dark");
      localStorage.setItem("theme","dark");
      setDark(true);

    }

  };


  return (
    <button
      onClick={toggleTheme}
      className="rounded-xl border px-4 py-2"
    >
      {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}