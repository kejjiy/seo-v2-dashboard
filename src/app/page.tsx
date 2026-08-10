import { HeroSection } from "@/components/landing/hero-section";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      {/* Public Header */}
      <header className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500" />
          <span className="text-xl font-bold tracking-tight">SEO-v2</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Log in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button className="bg-emerald-600 text-white hover:bg-emerald-500">
              Sign up
            </Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <HeroSection />
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        <div className="container">
          <p>© 2026 SEO-v2. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
