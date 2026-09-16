import LoginForm from '@/components/LoginForm';
import { ArrowUpRight, Boxes, Layers3, PackageCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="login-page">
      <div className="login-grid" aria-hidden="true" />
      <div className="login-shell">
        <section className="login-story">
          <div className="flex items-center gap-3">
            <span className="brand-icon"><Boxes className="size-6" aria-hidden="true" /></span>
            <div>
              <p className="text-xl font-semibold tracking-tight">Pace Informatics</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-stone-400">Inventory workspace</p>
            </div>
          </div>
          <div className="relative z-10 my-12 lg:my-20">
            <p className="mb-5 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-orange-300">
              <span className="size-1.5 rounded-full bg-orange-400" /> A clearer view of your business
            </p>
            <h1 className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              Everything in place.<br /><span className="text-orange-300">Keep moving forward.</span>
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-stone-300">
              Your products, stock, and sales. One organized workspace to keep your day running smoothly.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap gap-x-6 gap-y-3 text-xs text-stone-300">
            <span className="flex items-center gap-2"><Layers3 className="size-4 text-orange-300" aria-hidden="true" /> Organized inventory</span>
            <span className="flex items-center gap-2"><PackageCheck className="size-4 text-orange-300" aria-hidden="true" /> Clear stock insights</span>
          </div>
          <div className="login-orbits" aria-hidden="true"><span /><span /><span /></div>
        </section>
        <section className="login-form-panel" aria-label="Sign in">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your workspace awaits</span>
              <ArrowUpRight className="size-5 text-primary" aria-hidden="true" />
            </div>
            <LoginForm title="Welcome back." description="Sign in to your Pace Informatics workspace." />
            <p className="mt-8 text-center text-xs text-muted-foreground">Pace Informatics · Product inventory management</p>
          </div>
        </section>
      </div>
    </main>
  );
}
