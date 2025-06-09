"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import LogoutButton from "../../components/modules/auth/LogoutButton"; // Adjusted path

export default function ProtectedExamplePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center mt-8">Loading session...</p>;
  }

  if (status === "unauthenticated" || !session) {
    redirect("/login"); // Redirect to login if not authenticated
    return null; // Or a loading message while redirecting
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Protected Page</h1>
        <p className="mb-2 text-lg">
          Welcome,{" "}
          <span className="font-semibold">
            {session.user?.name || session.user?.email || "User"}
          </span>
          !
        </p>
        <p className="mb-6 text-gray-700">
          This page is protected and you can only see it if you are logged in.
        </p>
        <div className="mb-8 p-4 bg-gray-100 rounded-md shadow">
          <h2 className="text-2xl font-semibold mb-2">Session Information:</h2>
          <pre className="text-left text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
        <LogoutButton />
      </main>
    </div>
  );
}
