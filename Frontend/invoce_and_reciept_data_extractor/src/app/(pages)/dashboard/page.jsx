import { auth } from "@/lib/firebase";

export default function Dashboard() {
  const userName = "Maduni"; // You can replace with actual user data later
  console.log(auth.currentUser);

  return (
    <main>
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