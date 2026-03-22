import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="font-display text-5xl font-semibold text-stone-800 mb-4">
        Book Direct & Save
      </h1>
      <p className="text-stone-600 text-lg mb-8 max-w-prose">
        Skip the platform fees. Book directly with us and pay by Interac e-Transfer.
      </p>
      <Link
        href="/booking"
        className="bg-brand-700 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-800 transition-colors"
      >
        Check Availability &amp; Book
      </Link>
    </main>
  );
}
