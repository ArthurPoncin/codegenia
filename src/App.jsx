import { useCallback } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell.jsx";
import { useTokens } from "@/features/tokens/useTokens.jsx";

const GENERATOR_SECTION_ID = "pokemon-generator";

function App() {
  const { balance } = useTokens();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGenerate = useCallback(() => {
    if (location.pathname !== "/") {
      navigate("/");
    }
    requestAnimationFrame(() => {
      const target = document.getElementById(GENERATOR_SECTION_ID);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, [location.pathname, navigate]);

  return (
    <AppShell tokenBalance={balance ?? 0} onGenerate={handleGenerate}>
      <Outlet />
    </AppShell>
  );
}

export default App;
