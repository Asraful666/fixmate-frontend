
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
              Contact email will be configured.
            </li>

            <li>
              <span className="mb-1 block font-semibold text-white">
                Phone
              </span>
              Contact number will be configured.
            </li>

            <li>
              <span className="mb-1 block font-semibold text-white">
                Address
              </span>
              Business address will be configured.
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


          <div className="flex items-center gap-5">

            <Link href="/" className="hover:text-white">
              Home
            </Link>

            <Link href="/services" className="hover:text-white">
              Services
            </Link>

            <Link href="/about" className="hover:text-white">
              About
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}
