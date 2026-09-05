"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await axios.post(
                "https://cloud-storage-backend-jc75.onrender.com/api/auth/register",
                {
                    name,
                    email,
                    password,
                }
            );

            setMessage(
                response.data.message || "Registration successful"
            );
        } catch (error: any) {
            setMessage(
                error.response?.data?.message || "Registration failed"
            );
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4">

            <div className="w-full max-w-md">

                {/* Logo */}
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
                        Create your secure cloud account
                    </p>
                </div>

                {/* Signup Card */}
                <div className="rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">

                    <h2 className="text-2xl font-semibold text-white">
                        Create account
                    </h2>

                    <p className="mt-1 mb-6 text-sm text-slate-400">
                        Start storing and managing your files
                    </p>

                    <form onSubmit={handleSignup} className="space-y-5">

                        {/* Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-200">
                                Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                required
                            />
                        </div>

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
                                placeholder="Minimum 6 characters"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                minLength={6}
                                className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                required
                            />
                        </div>

                        {/* Button */}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-blue-600 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 active:scale-[0.98]"
                        >
                            Create Account
                        </button>

                    </form>

                    {/* Message */}
                    {message && (
                        <div className="mt-5 rounded-xl bg-slate-900/70 p-3 text-center text-sm text-slate-200">
                            {message}
                        </div>
                    )}

                    {/* Login */}
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-semibold text-blue-400 hover:text-blue-300"
                        >
                            Sign in
                        </Link>
                    </p>

                </div>

                <p className="mt-6 text-center text-xs text-slate-500">
                    Your files. Your cloud. Your control.
                </p>

            </div>
        </main>
    );
}