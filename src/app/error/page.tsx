import Link from 'next/link';

export default function ErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-6 py-12">
      <section className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Something went wrong</h1>
        <p className="mt-3 text-sm text-slate-600">
          The requested authentication or confirmation flow could not be completed.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/auth/login" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Go to login
          </Link>
          <Link href="/" className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
