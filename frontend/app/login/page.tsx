"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        setMessage("");
        setLoading(true);

       try {
    const response = await axios.post(
        "https://cloud-storage-backend-jc75.onrender.com/api/auth/login",
        {
            email,
            password,
        }
    );

    console.log("LOGIN RESPONSE:", response.data);

    localStorage.setItem("token", response.data.token);

    console.log(
        "SAVED TOKEN:",
        localStorage.getItem("token")
    );

    setMessage("Login successful!");

    setTimeout(() => {
        router.push("/dashboard");
    }, 500);

} catch (error: any) {
            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Logo / Title */}

                <div className="text-center mb-8">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30">

                        <svg
                            className="h-8 w-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                            />
                        </svg>

                    </div>

                    <h1 className="text-3xl font-bold text-white">
                        Cloud Media Storage
                    </h1>

                    <p className="mt-2 text-sm text-slate-400">
                        Securely store and manage your files
                    </p>

                </div>

                {/* Login Card */}

                <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

                    <h2 className="text-2xl font-semibold text-white">
                        Welcome back
                    </h2>

                    <p className="mt-1 mb-6 text-sm text-slate-400">
                        Sign in to continue to your account
                    </p>

                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

                        {/* Email */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                required
                            />

                        </div>

                        {/* Password */}

                        <div>

                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                required
                            />

                        </div>

                        {/* Login Button */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading
                                ? "Signing In..."
                                : "Sign In"}
                        </button>

                    </form>

                    {/* Message */}

                    {message && (
                        <div className="mt-5 rounded-xl bg-slate-900/70 p-3 text-center text-sm text-slate-200">
                            {message}
                        </div>
                    )}

                    {/* Signup */}

                    <p className="mt-6 text-center text-sm text-slate-400">

                        Don't have an account?{" "}

                        <Link
                            href="/signup"
                            className="font-semibold text-blue-400 hover:text-blue-300"
                        >
                            Create account
                        </Link>

                    </p>

                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Secure cloud storage for your media files
                </p>

            </div>

        </main>
    );
}