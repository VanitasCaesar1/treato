// app/payment-success/loading.js

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500 text-lg">Loading payment details...</p>
        {/* You could add a spinner or more complex loading UI here */}
      </div>
    );
  }