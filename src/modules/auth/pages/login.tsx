"use client"; // Required for onClick handlers

import LoginButton from "../../components/modules/auth/LoginButton"; // Adjusted path
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation"; // For redirecting if already logged in

export default function LoginPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center mt-8">Loading session...</p>;
  }

  if (session) {
    // If user is already logged in, redirect to home or a protected page
    redirect("/");
    return null; // Or a loading message while redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-8">
          Login to Your Account
        </h1>
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <p className="mb-6 text-gray-700">
            Please sign in to continue.
          </p>
          <LoginButton />
        </div>
      </main>
    </div>
  );
}
