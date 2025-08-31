import { auth } from "@/lib/firebase";
import Navbar from "@/components/navbar";

export default function Dashboard() {
  const userName = "Maduni"; // You can replace with actual user data later
  console.log(auth.currentUser);

  return (
    <main>
      <Navbar></Navbar>
      <h1>Hi, {userName}!</h1>
      <p>Welcome to your dashboard.</p>
      <ul>
        <li>Profile</li>
        <li>Settings</li>
        <li>Notifications</li>
      </ul>
    </main>
  );
}