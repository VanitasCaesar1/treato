// app/payment-failed/page.js
"use client";

import { useSearchParams } from "next/navigation";
import { X, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "../Navbar";

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") || "unknown";
  
  // Map error codes to user-friendly messages
  const errorMessages = {
    "PAYMENT_DECLINED": "Your payment was declined by the bank.",
    "PAYMENT_CANCELLED": "The payment was cancelled.",
    "PAYMENT_ERROR": "There was an error processing your payment.",
    "transaction-not-found": "We couldn't find your transaction details.",
    "server-error": "Our server encountered an error. Please try again.",
    "unknown": "An unknown error occurred. Please try again."
  };
  
  const errorMessage = errorMessages[reason] || errorMessages.unknown;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50">
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-22 md:pt-44">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <X className="text-red-500 w-10 h-10" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-600 mb-4">
            Payment Failed
          </h1>
          
          <p className="text-sm sm:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {errorMessage}
          </p>
          
          <div className="space-x-4">
            <Button 
              as={Link}
              href="/plans"
              className="bg-red-600 hover:bg-red-700"
            >
              <RefreshCw className="mr-2 w-4 h-4" />
              Try Again
            </Button>
            
            <Button 
              as={Link}
              href="/"
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}