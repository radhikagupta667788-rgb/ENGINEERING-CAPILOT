import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";


export default function RootLayout({
 children,
}:{
 children: React.ReactNode;
}){

return(

<html lang="en">

<body>

<Navbar />

<div className="flex">

<Sidebar />

<main className="flex-1 p-6">

{children}

</main>

</div>

</body>

</html>

);

}