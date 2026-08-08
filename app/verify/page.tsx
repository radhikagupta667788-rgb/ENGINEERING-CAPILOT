"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";


export default function VerifyPage(){

  const [email,setEmail] = useState("");
  const [otp,setOtp] = useState("");
  const [loading,setLoading] = useState(false);

  const router = useRouter();



  const verifyOTP = async()=>{


    if(!email || !otp){

      alert("Email aur OTP dono enter karo");
      return;

    }


    setLoading(true);



    const { error } = await supabase.auth.verifyOtp({

      email,

      token: otp,

      type: "email"

    });



    if(error){

      alert(error.message);

    }
    else{

      router.push("/");

    }



    setLoading(false);


  };



return(

<div className="flex min-h-screen items-center justify-center">


<div className="w-full max-w-md rounded-3xl border p-8">


<h1 className="text-3xl font-bold">
Verify OTP
</h1>


<p className="mt-2 text-gray-500">
Email aur OTP enter karo
</p>



<input

type="email"

placeholder="Enter email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

className="mt-6 w-full rounded-xl border p-3"

/>



<input

placeholder="Enter OTP"

value={otp}

onChange={(e)=>setOtp(e.target.value)}

className="mt-4 w-full rounded-xl border p-3"

/>



<button

onClick={verifyOTP}

disabled={loading}

className="mt-5 w-full rounded-xl bg-green-600 p-3 text-white"

>

{
loading
?
"Verifying..."
:
"Verify OTP"
}

</button>


</div>


</div>

)


}