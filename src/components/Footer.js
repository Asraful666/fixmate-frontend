
import Link from "next/link";

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">

        {/* BRAND */}
        <div>

          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
              🔧
            </span>

            <span className="text-2xl font-extrabold text-white">
              Fix<span className="text-blue-400">Mate</span>
            </span>
          </Link>

          <p className="mt-5 max-w-xs text-sm leading-7 text-slate-400">
            Your trusted repair service platform.
            Connect with skilled technicians and
            get your home appliances repaired
            without the hassle.
          </p>

        </div>

        {/* QUICK LINKS */}
        <div>

          <h3 className="mb-5 text-lg font-bold text-white">
            Quick Links
          </h3>

          <ul className="space-y-3 text-sm">

            <li>
              <Link href="/" className="hover:text-blue-400">
                Home
              </Link>
            </li>

            <li>
              <Link href="/services" className="hover:text-blue-400">
                Services
              </Link>
            </li>

            <li>
              <Link href="/about" className="hover:text-blue-400">
                About Us
              </Link>
            </li>

            <li>
              <Link href="/sign-up" className="hover:text-blue-400">
                Join FixMate
              </Link>
            </li>

          </ul>

        </div>

        {/* CATEGORIES */}
        <div>

          <h3 className="mb-5 text-lg font-bold text-white">
            Popular Categories
          </h3>

          <ul className="grid grid-cols-2 gap-3 text-sm">

            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/services?category=${encodeURIComponent(category)}`}
                  className="hover:text-blue-400"
                >
                  {category}
                </Link>
              </li>
            ))}

          </ul>

        </div>

        {/* CONTACT */}
        <div>

          <h3 className="mb-5 text-lg font-bold text-white">
            Contact Information
          </h3>

          <ul className="space-y-4 text-sm text-slate-400">

            <li>
              <span className="mb-1 block font-semibold text-white">
                Email
              </span>
              <a href="mailto:support@fixmate.app" className="hover:text-blue-400">
                support@fixmate.app
              </a>
            </li>

            <li>
              <span className="mb-1 block font-semibold text-white">
                Phone
              </span>
              <a href="tel:+8801700000000" className="hover:text-blue-400">
                +880 1700-000000
              </a>
            </li>

            <li>
              <span className="mb-1 block font-semibold text-white">
                Address
              </span>
              House 12, Road 4, Dhanmondi, Dhaka 1205, Bangladesh
            </li>

          </ul>

        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-slate-800">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-center text-xs text-slate-500 sm:flex-row lg:px-8">

         
<p>
  © 2026 FixMate. All rights reserved.
</p>


          <div className="flex flex-wrap items-center justify-center gap-5">

            <Link href="/" className="hover:text-white">
              Home
            </Link>

            <Link href="/services" className="hover:text-white">
              Services
            </Link>

            <Link href="/about" className="hover:text-white">
              About
            </Link>

            <span className="hidden h-4 w-px bg-slate-700 sm:block" />

            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              aria-label="FixMate on X"
              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="FixMate on Facebook"
              className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-slate-500 hover:text-white"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
              </svg>
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}
