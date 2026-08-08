"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


export default function LoginPage(){

const [email,setEmail]=useState("");
const [password,setPassword]=useState("");

const router=useRouter();



const login=async()=>{


const {error}=await supabase.auth.signInWithPassword({

email,
password

});


if(error){

alert(error.message);
return;

}


router.push("/");


};



return(

<div className="flex min-h-screen items-center justify-center">


<div className="w-full max-w-md rounded-3xl border p-8">


<h1 className="text-3xl font-bold">
Login
</h1>



<input

className="mt-6 w-full rounded-xl border p-3"

placeholder="Email"

type="email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

/>



<input

className="mt-4 w-full rounded-xl border p-3"

placeholder="Password"

type="password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

/>



<button

onClick={login}

className="mt-5 w-full rounded-xl bg-blue-600 p-3 text-white"

>

Login

</button>



</div>

</div>

)

}