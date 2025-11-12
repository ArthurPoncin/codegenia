import { Outlet } from "react-router-dom";
import AppShell from "@/components/layout/AppShell.jsx";

function App() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export default App;
