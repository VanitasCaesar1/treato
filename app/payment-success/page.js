// app/payment-success/page.js
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "../Navbar";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("txnId");
  const [transactionDetails, setTransactionDetails] = useState(null);
  
  useEffect(() => {
    // You could fetch transaction details here if needed
    // This is optional, as you already have basic info from the URL params
    if (transactionId) {
      fetch(`/api/transactions/${transactionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setTransactionDetails(data.transaction);
          }
        })
        .catch(err => console.error("Error fetching transaction:", err));
    }
  }, [transactionId]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      <Navbar />
      
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
                <span className="font-medium text-sm">{transactionId}</span>
              </div>
            </div>
          )}
          
          <div className="space-x-4">
            <Button 
              as={Link}
              href="/dashboard"
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <Button 
              as={Link}
              href="/"
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}