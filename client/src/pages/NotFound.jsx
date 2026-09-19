import { Link } from "react-router-dom";

const THEME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap');
  .wp-root { font-family: 'Bricolage Grotesque', ui-sans-serif, system-ui, sans-serif; }
`;

export default function NotFound() {
  return (
    <div className="wp-root flex min-h-screen items-center justify-center bg-[#2438F0] px-6 py-10 text-[#0E1330]">
      <style>{THEME_CSS}</style>

      <div className="w-full max-w-md rounded-2xl bg-[#F5F6FF] p-8 shadow-[8px_8px_0_0_#FFD23F] sm:p-10">
        <p className="text-7xl font-extrabold leading-none tracking-tight text-[#2438F0]">404</p>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Nothing playing here.</h1>
        <p className="mt-2 leading-relaxed text-[#0E1330]/70">
          This page doesn't exist. Head back home to create a room or join one with a code.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-lg border-2 border-[#0E1330] bg-[#FFD23F] px-6 py-3 font-bold text-[#0E1330] transition hover:-translate-y-0.5 hover:shadow-[0_4px_0_0_#0E1330] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#2438F0]/40"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}