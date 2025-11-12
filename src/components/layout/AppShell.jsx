import AppHeader from "@/components/layout/AppHeader.jsx";
import AppFooter from "@/components/layout/AppFooter.jsx";

// Voir docs/02_design_application.md — AppShell
function AppShell({ children, tokenBalance = 0, onGenerate }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-50 text-brand-black">
      <AppHeader tokenBalance={tokenBalance} onGenerate={onGenerate} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <AppHeader />
      <main className="flex-1 container mx-auto w-full max-w-5xl px-4 py-6">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}

export default AppShell;
