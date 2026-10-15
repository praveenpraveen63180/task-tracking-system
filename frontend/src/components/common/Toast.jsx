import { Check, X } from 'lucide-react';

export default function Toast({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="toast" role="status">
      <span className="toast-check">
        <Check size={15} />
      </span>
      {message}
      <button aria-label="Dismiss notification" onClick={onDismiss}>
        <X size={15} />
      </button>
    </div>
  );
}
