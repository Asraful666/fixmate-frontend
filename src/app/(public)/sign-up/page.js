
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { dashboardForRole } from "@/lib/format";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");

  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cleanup image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Logged-in users never see the sign-up form.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace(dashboardForRole(session.user.role));
    }
  }, [isPending, session, router]);

  // Password validation
  const passwordChecks = {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  };

  const passwordValid =
    passwordChecks.length &&
    passwordChecks.uppercase &&
    passwordChecks.lowercase;

  // Email validation
  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Profile picture selection
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5MB or smaller.");
      event.target.value = "";
      return;
    }

    setProfilePicture(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Email registration
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (name.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!emailValid) {
      toast.error("Please enter a valid email.");
      return;
    }

    if (!passwordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }

    if (!["customer", "technician"].includes(role)) {
      toast.error("Invalid account type.");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = undefined;

      // STEP 1: Upload profile picture to ImgBB
      if (profilePicture) {
        toast.loading("Uploading profile picture...", {
          id: "registration",
        });

        const formData = new FormData();
        formData.append("image", profilePicture);

        const uploadResponse = await fetch(
          "/api/upload-image",
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(
            uploadResult.message ||
            "Profile picture upload failed."
          );
        }

        imageUrl = uploadResult.imageUrl;

        if (!imageUrl) {
          throw new Error("Image URL was not received.");
        }
      }

      // STEP 2: BetterAuth registration
      toast.loading("Creating your account...", {
        id: "registration",
      });

      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        image: imageUrl,
        role,

        callbackURL:
          role === "technician"
            ? "/dashboard/technician"
            : "/dashboard/customer",
      });

      if (error) {
        throw new Error(
          error.message || "Registration failed."
        );
      }

      if (!data) {
        throw new Error("Registration was unsuccessful.");
      }

      toast.success("Account created successfully!", {
        id: "registration",
      });

      // STEP 3: Role-based redirect
      const dashboard =
        role === "technician"
          ? "/dashboard/technician"
          : "/dashboard/customer";

      router.replace(dashboard);
      router.refresh();

    } catch (error) {
      console.error("Registration error:", error);

      toast.error(
        error.message || "Something went wrong.",
        { id: "registration" }
      );

    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard/customer",
      });

      if (error) {
        throw new Error(error.message || "Google login failed.");
      }

    } catch (error) {
      console.error("Google Login Error:", error);

      toast.error(
        error.message || "Google login failed."
      );

      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-2">

        {/* LEFT BRANDING SECTION */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-blue-700 p-12 text-white lg:flex">

          <div className="relative z-10">

            <Link href="/" className="text-3xl font-bold">
              🔧 FixMate
            </Link>

            <h1 className="mt-24 text-5xl font-bold leading-tight">
              Repair smarter.
              <br />
              Live better.
            </h1>

            <p className="mt-6 max-w-md leading-8 text-blue-100">
              Find trusted technicians and get your
              home appliances and devices repaired
              without the hassle.
            </p>

            <div className="mt-12 space-y-5">
              {[
                "Connect with skilled technicians",
                "Track your repair requests",
                "Pay securely after completion",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    ✓
                  </span>
                  {item}
                </div>
              ))}
            </div>

          </div>

          <p className="relative z-10 text-sm text-blue-100">
            Your trusted repair service platform.
          </p>

          <div className="absolute -bottom-32 -right-24 h-96 w-96 rounded-full border-[50px] border-white/10" />

        </section>

        {/* REGISTRATION SECTION */}
        <section className="px-6 py-10 sm:px-12 lg:px-14">

          <div className="mx-auto max-w-md">

            <Link
              href="/"
              className="mb-8 inline-block text-2xl font-bold text-blue-700 lg:hidden"
            >
              🔧 FixMate
            </Link>

            <div className="mb-8">

              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Join FixMate
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Get started with your FixMate journey.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* PROFILE PICTURE */}
              <div>

                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Profile Picture

                  <span className="ml-2 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <div className="flex items-center gap-4">

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100">

                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}

                  </div>

                  <div>

                    <label
                      htmlFor="profilePicture"
                      className="inline-flex cursor-pointer items-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      Choose Photo
                    </label>

                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG or WEBP. Maximum 5MB.
                    </p>

                  </div>

                </div>

              </div>

              {/* FULL NAME */}
              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  minLength={2}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* EMAIL */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-slate-800 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

                <div className="mt-3 space-y-2 text-xs">

                  <p className={passwordChecks.length ? "text-green-600" : "text-slate-500"}>
                    {passwordChecks.length ? "✓" : "○"} At least 6 characters
                  </p>

                  <p className={passwordChecks.uppercase ? "text-green-600" : "text-slate-500"}>
                    {passwordChecks.uppercase ? "✓" : "○"} One uppercase letter
                  </p>

                  <p className={passwordChecks.lowercase ? "text-green-600" : "text-slate-500"}>
                    {passwordChecks.lowercase ? "✓" : "○"} One lowercase letter
                  </p>

                </div>

              </div>

              {/* ACCOUNT TYPE */}
              <div>

                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Choose Account Type
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setRole("customer")}
                    aria-pressed={role === "customer"}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "customer"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-300"
                    }`}
                  >

                    <span className="text-2xl">👤</span>

                    <span className="mt-2 block font-semibold text-slate-800">
                      Customer
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Find repair services
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("technician")}
                    aria-pressed={role === "technician"}
                    className={`rounded-xl border p-4 text-left transition ${
                      role === "technician"
                        ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-300 hover:border-blue-300"
                    }`}
                  >

                    <span className="text-2xl">🔧</span>

                    <span className="mt-2 block font-semibold text-slate-800">
                      Technician
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Provide repair services
                    </span>

                  </button>

                </div>

              </div>

              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                disabled={
                  loading ||
                  name.trim().length < 2 ||
                  !emailValid ||
                  !passwordValid
                }
                className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>

            </form>

            {/* GOOGLE LOGIN */}
            <div className="my-7 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs uppercase text-slate-400">
                Or continue with
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <span className="text-lg font-bold text-blue-600">
                G
              </span>

              {loading
                ? "Connecting to Google..."
                : "Continue with Google"}

            </button>

            {/* SIGN IN */}
            <p className="mt-7 text-center text-sm text-slate-600">

              Already have an account?{" "}

              <Link
                href="/sign-in"
                className="font-bold text-blue-700 hover:underline"
              >
                Sign In
              </Link>

            </p>

          </div>

        </section>

      </div>

    </main>
  );
}
