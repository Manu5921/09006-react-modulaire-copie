"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import LoginButton from "../../components/modules/auth/LoginButton"; // Adjusted path
import LogoutButton from "../../components/modules/auth/LogoutButton"; // Adjusted path

export default function AuthStatusPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p className="text-center mt-8">Loading session...</p>;
  }

  return (
    <div className="container mx-auto p-4 mt-8 text-center">
      <h1 className="text-3xl font-bold mb-6">Authentication Status</h1>
      {session ? (
        <div className="mb-4">
          <p className="text-lg mb-2">
            You are currently logged in as{" "}
            <span className="font-semibold">
              {session.user?.name || session.user?.email || "User"}
            </span>
            .
          </p>
          <LogoutButton />
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-lg mb-2">You are not logged in.</p>
          <LoginButton />
        </div>
      )}
      <div className="mt-8 space-y-4">
        <div>
          <Link href="/protected-example" legacyBehavior>
            <a className="text-blue-600 hover:text-blue-800 underline">
              View Protected Page Example
            </a>
          </Link>
        </div>
        {!session && (
          <div>
            <Link href="/login" legacyBehavior>
              <a className="text-blue-600 hover:text-blue-800 underline">
                Go to Login Page
              </a>
            </Link>
          </div>
        )}
         <div>
          <Link href="/" legacyBehavior>
            <a className="text-blue-600 hover:text-blue-800 underline">
              Back to Home
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
