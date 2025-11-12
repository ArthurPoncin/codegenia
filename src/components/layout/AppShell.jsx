import PropTypes from "prop-types";
import AppHeader from "@/components/layout/AppHeader.jsx";
import AppFooter from "@/components/layout/AppFooter.jsx";

// Voir docs/02_design_application.md — AppShell
function AppShell({ children, tokenBalance = 0, onGenerate }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-50 text-brand-black">
      <AppHeader tokenBalance={tokenBalance} onGenerate={onGenerate} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <AppFooter />
    </div>
  );
}

AppShell.propTypes = {
  children: PropTypes.node,
  tokenBalance: PropTypes.number,
  onGenerate: PropTypes.func,
};

export default AppShell;
