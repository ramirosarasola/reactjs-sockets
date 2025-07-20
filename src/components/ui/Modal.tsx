import React, { useEffect } from "react";
import type { ModalProps } from "../../types";

const sizeClasses = {
  sm: "modal-sm",
  md: "modal-md",
  lg: "modal-lg",
  xl: "modal-xl",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${sizeClasses[size]} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "var(--space-6)",
              borderBottom: "1px solid var(--gray-200)",
            }}
          >
            <h3
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
                color: "var(--gray-900)",
              }}
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                color: "var(--gray-400)",
                transition: "color var(--transition-normal)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "var(--space-2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gray-600)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--gray-400)";
              }}
            >
              <svg
                style={{ width: "1.5rem", height: "1.5rem" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: "var(--space-6)" }}>{children}</div>
      </div>
    </div>
  );
};
