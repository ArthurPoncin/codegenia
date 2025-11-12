import AppHeader from "@/components/layout/AppHeader.jsx";
import AppFooter from "@/components/layout/AppFooter.jsx";

function AppShell({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-50 text-brand-black">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <AppFooter />
    </div>
  );
}

export default AppShell;
