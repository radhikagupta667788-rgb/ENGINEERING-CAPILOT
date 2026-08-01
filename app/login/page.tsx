"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const login = () => {

    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if(
      user &&
      user.email === email &&
      user.password === password
    ){
      localStorage.setItem(
        "loggedIn",
        "true"
      );

      router.push("/");
    }
    else{
      alert("Invalid email or password");
    }

  };


  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)]">

      <div className="theme-card w-96 rounded-2xl p-8 shadow-lg">

        <h1 className="text-3xl font-bold">
          🔐 Login
        </h1>


        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="theme-card mt-5 w-full rounded-xl border p-3"
        />


        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="theme-card mt-4 w-full rounded-xl border p-3"
        />


        <button
          onClick={login}
          className="theme-primary mt-5 w-full rounded-xl p-3"
        >
          Login
        </button>


      </div>

    </main>
  );
}