import Navbar from "@/components/navbar";
import { auth } from "@/lib/firebase";


const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 text-center text-xs text-white bg-gray-900 py-2">
      <p>© {new Date().getFullYear()} Smart Invoice and Receipt Scanner. All rights reserved.</p>
      <p className="mt-1">Secure authentication powered by Firebase</p>
    </footer>
  );
};

export default function Home() {
  const userName = "Maduni"; // You can replace with actual user data later

  return (
    <main>
      <Navbar></Navbar>
      <Footer />
    </main>
  );
}