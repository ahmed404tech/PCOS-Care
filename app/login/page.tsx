"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const VALID_USERNAME = "bano";
const VALID_PASSWORD = "bano2003";
const STORAGE_KEY = "pcos_app_session";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const session = localStorage.getItem(STORAGE_KEY);
      if (session === "authenticated") {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "authenticated");
      router.replace("/onboarding");
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#fafafa] p-3 sm:p-4">
      <div className="w-full max-w-sm widget p-5 sm:p-6">
        <h1 className="text-2xl font-semibold text-pink-700 text-center mb-2">PCOS Care</h1>
        <p className="text-center text-sm text-pink-500 mb-6">Private access</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-pink-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 px-3 py-2 outline-none bg-white"
              placeholder="Enter username"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-pink-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 px-3 py-2 outline-none bg-white pr-10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 text-pink-500 text-sm"
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-2xl py-2 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}


