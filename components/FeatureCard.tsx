"use client";

import { useState } from "react";


export default function ResumeAnalyzer(){

const [file,setFile] = useState<File | null>(null);
const [result,setResult] = useState<any>(null);
const [loading,setLoading] = useState(false);



async function analyzeResume(){

if(!file) return;


setLoading(true);


const formData = new FormData();

formData.append(
"resume",
file
);



const res = await fetch(
"/api/resume",
{
method:"POST",
body:formData
}
);



const data = await res.json();


setResult(data.result);


setLoading(false);

}




return(

<div className="space-y-6">


<h1 className="text-4xl font-bold">
📄 Resume Analyzer
</h1>


<input

type="file"

accept=".pdf"

onChange={(e)=>
setFile(
e.target.files?.[0] || null
)
}

/>



<button

onClick={analyzeResume}

className="bg-blue-600 text-white px-6 py-3 rounded-xl"

>

{
loading
?
"Analyzing..."
:
"Analyze Resume"
}

</button>





{
result &&

<div className="bg-white p-6 rounded-xl">


<h2 className="text-2xl font-bold">

ATS Score: {result.score}%

</h2>


<p>
{result.summary}
</p>


</div>

}


</div>

);

}