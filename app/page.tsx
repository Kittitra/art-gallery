import { db } from "@/lib/db";
import Image from "next/image";
import Homepage from "./auth/home/page";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div >
      <Navbar />
      <Homepage />
    </div>
  );
}
