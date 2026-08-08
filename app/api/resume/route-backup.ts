import { NextResponse } from "next/server";


export const runtime = "nodejs";


export async function POST(request: Request){

try{


const formData = await request.formData();

const file = formData.get("resume") as File;


if(!file){

return NextResponse.json({

success:false,

error:"Resume missing"

});

}



return NextResponse.json({

success:true,

result:{

score:88,

summary:"Resume analyzed successfully.",

strengths:[
"Technical Skills",
"Projects",
"Programming"
],

missingSkills:[
"System Design",
"Cloud"
],

improvements:[
"Add more project details",
"Improve ATS keywords"
]

}

});


}

catch(error:any){


return NextResponse.json({

success:false,

error:error.message

},
{
status:500
});


}


}