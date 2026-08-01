"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";


export default function SignupPage(){

const router = useRouter();

const [email,setEmail]=useState("");
const [password,setPassword]=useState("");


const signup=()=>{

localStorage.setItem(
"user",
JSON.stringify({
email,
password
})
);


alert("Account created");

router.push("/login");

};


return(

<main className="min-h-screen flex items-center justify-center bg-[var(--background)]">


<div className="theme-card w-96 rounded-2xl p-8 shadow-lg">


<h1 className="text-3xl font-bold">
Create Account
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
onClick={signup}
className="theme-primary mt-5 w-full rounded-xl p-3"
>
Sign Up
</button>


</div>


</main>

);

}