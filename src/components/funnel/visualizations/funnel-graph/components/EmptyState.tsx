
import React from "react";

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default EmptyState;
