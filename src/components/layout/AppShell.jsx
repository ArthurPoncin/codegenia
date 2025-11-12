import AppHeader from "@/components/layout/AppHeader.jsx";
import AppFooter from "@/components/layout/AppFooter.jsx";

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
