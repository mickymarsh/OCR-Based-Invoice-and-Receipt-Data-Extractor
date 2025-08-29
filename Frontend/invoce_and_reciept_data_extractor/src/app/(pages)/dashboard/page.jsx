export default function Dashboard() {
  const userName = "Maduni"; // You can replace with actual user data later

  return (
    <main style={{ padding: "2rem" }}>
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