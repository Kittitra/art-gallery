import Homepage from "./auth/home/page";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Homepage />
    </div>
  );
}
