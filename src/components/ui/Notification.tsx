import React, { useEffect, useState } from "react";

interface NotificationProps {
  message: string;
  type?: "info" | "success" | "warning" | "error";
  duration?: number;
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type = "info", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Tiempo para la animación de salida
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: "var(--success-50)",
          borderColor: "var(--success-200)",
          color: "var(--success-700)",
        };
      case "warning":
        return {
          backgroundColor: "var(--warning-50)",
          borderColor: "var(--warning-200)",
          color: "var(--warning-700)",
        };
      case "error":
        return {
          backgroundColor: "var(--error-50)",
          borderColor: "var(--error-200)",
          color: "var(--error-700)",
        };
      default:
        return {
          backgroundColor: "var(--primary-50)",
          borderColor: "var(--primary-200)",
          color: "var(--primary-700)",
        };
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "var(--space-4)",
        right: "var(--space-4)",
        zIndex: 1000,
        padding: "var(--space-3) var(--space-4)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid",
        boxShadow: "var(--shadow-lg)",
        maxWidth: "20rem",
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s ease-in-out",
        ...getTypeStyles(),
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)" }}>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "var(--space-1)",
            marginLeft: "auto",
            opacity: 0.7,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};
