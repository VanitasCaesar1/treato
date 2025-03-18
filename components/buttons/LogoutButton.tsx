// LogoutButton.tsx
"use client";

import React, { useTransition, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { handleLogout } from "@/lib/logoutAction"; // Import the server action

const LogoutButton = () => {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState("");

  const onLogout = () => {
    setError("");
    startTransition(async () => {
      try {
        await handleLogout();
        // Redirect will be handled server-side
      } catch (err) {
        console.error("Logout error:", err);
        setError("Failed to log out. Please try again.");
      }
    });
  };

  return (
    <>
      <div className="relative group">
        <button
          className="w-full flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => setShowConfirmDialog(true)}
          disabled={isPending}
          aria-label="Logout"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 text-white/90 animate-spin mb-1.5" />
          ) : (
            <svg
              className="w-5 h-5 text-white/90 group-hover:text-white mb-1.5 transition-colors duration-200"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          )}
          <span className="text-xs font-medium text-white/90 group-hover:text-white transition-colors duration-200">
            {isPending ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          // Prevent closing the dialog while logging out
          if (!isPending) {
            setShowConfirmDialog(open);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? This will end your current
              session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm font-medium text-red-500 mt-2">
              {error}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isPending}
              className="hover:bg-gray-100 focus:ring-gray-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onLogout}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Logging out...
                </>
              ) : (
                "Logout"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LogoutButton;