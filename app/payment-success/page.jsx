// app/payment-success/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
// Assuming Button and Link are client components or compatible
// import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button
import Link from "next/link"; // next/link is client-side by default when used in client components

// Assuming Navbar is a client component or compatible
// import Navbar from "@/components/Navbar"; // Assuming Navbar component

export default function PaymentSuccessPage() {
  // useSearchParams can only be used after the component is hydrated on the client
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("txnId");

  const [transactionDetails, setTransactionDetails] = useState(null);

  useEffect(() => {
    // Fetch transaction details here if needed
    // This is optional, as you already have basic info from the URL params
    if (transactionId) {
      fetch(`/api/transactions/${transactionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTransactionDetails(data.transaction);
          } else {
            console.error("API returned success: false", data);
            // Handle error or display a message
          }
        })
        .catch(err => console.error("Error fetching transaction:", err));
    }
  }, [transactionId]); // Dependency array includes transactionId

  return (
    // Ensure Navbar is compatible or wrapped if needed
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* <Navbar /> */} {/* Assuming Navbar component */}

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-22 md:pt-44">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <Check className="text-green-500 w-10 h-10" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-green-600 mb-4">
            Payment Successful!
          </h1>

          <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Thank you for your purchase. Your subscription has been activated successfully.
          </p>

          {/* Conditionally render transaction details if fetched */}
          {transactionDetails && (
            <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mb-8">
              <h2 className="text-xl font-semibold mb-4">Transaction Details</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Plan:</span>
                <span className="font-medium">{transactionDetails.plan_name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₹{transactionDetails.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                {/* Display transactionId from URL or fetched details */}
                <span className="font-medium text-sm">{transactionDetails.transaction_id || transactionId}</span>
              </div>
            </div>
          )}

          <div className="space-x-4">
            {/* Using Link component for navigation */}
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>

            {/* Using Link component for navigation */}
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-green-600 text-green-600 font-semibold rounded-md hover:bg-green-50 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
