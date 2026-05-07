import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3200) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  return { toasts, addToast };
}

export default function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return createPortal(
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>,
    document.body
  );
}
