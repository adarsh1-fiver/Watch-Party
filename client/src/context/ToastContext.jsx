import { createContext, useCallback, useContext, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const pushToast = useCallback((message, variant = "info") => {
    const id = ++counter.current;

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        variant,
      },
    ]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}

      <div className="pointer-events-none fixed bottom-5 right-5 z-[999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismiss(toast.id)}
            className={`pointer-events-auto cursor-pointer overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:scale-[1.02]
            ${
              toast.variant === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                : toast.variant === "error"
                ? "border-red-500/20 bg-red-500/10 text-red-200"
                : "border-fuchsia-500/20 bg-[#11111A]/95 text-white"
            }`}
          >
            <div
              className={`h-1 w-full
              ${
                toast.variant === "success"
                  ? "bg-emerald-400"
                  : toast.variant === "error"
                  ? "bg-red-400"
                  : "bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500"
              }`}
            />

            <div className="flex items-start gap-3 px-4 py-4">
              <div className="mt-0.5 text-lg">
                {toast.variant === "success"
                  ? "✅"
                  : toast.variant === "error"
                  ? "❌"
                  : "🔔"}
              </div>

              <div className="flex-1">
                <p className="text-sm leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return ctx;
}