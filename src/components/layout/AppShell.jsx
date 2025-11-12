import PropTypes from "prop-types";
import AppHeader from "@/components/layout/AppHeader.jsx";
import AppFooter from "@/components/layout/AppFooter.jsx";

function AppShell({ children, tokenBalance = 0, onGenerate = () => {} }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface-50 text-brand-black">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-aurora opacity-80" />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute -left-16 -top-32 h-[45vh] w-[45vw] rounded-full bg-brand-yellow/30 blur-3xl" />
        <div className="absolute -right-24 bottom-[-25%] h-[55vh] w-[55vw] rounded-full bg-brand-blue/25 blur-[110px]" />
      </div>

      <div className="relative z-10 flex min-h-dvh flex-col">
        <AppHeader tokenBalance={tokenBalance} onGenerate={onGenerate} />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-12">{children}</main>
        <AppFooter />
      </div>
    </div>
  );
}

AppShell.propTypes = {
  children: PropTypes.node,
  tokenBalance: PropTypes.number,
  onGenerate: PropTypes.func,
};

export default AppShell;
