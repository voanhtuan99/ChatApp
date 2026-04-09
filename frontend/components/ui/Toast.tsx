"use client";

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

export function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="fixed right-4 top-4 z-50 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-3">
        <p>{message}</p>
        <button className="text-rose-200 transition hover:text-white" onClick={onDismiss} type="button">
          Close
        </button>
      </div>
    </div>
  );
}
