import React from 'react';

interface PaymentStatusProps {
  status: string;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status }) => {
  if (!status) return null;

  const statusMessages = {
    validated: <p className="text-emerald-400 mt-4">Payment validated! Processing transaction...</p>,
    completed: <p className="text-emerald-400 mt-4">Payment completed successfully!</p>,
    failed: <p className="text-red-400 mt-4">Payment failed. Please try again.</p>
  };

  return statusMessages[status as keyof typeof statusMessages] || null;
};