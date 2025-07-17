import React from "react";

export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-red-500 bg-red-100 p-4">
      {children}
    </div>
  );
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-red-700">{children}</p>;
}