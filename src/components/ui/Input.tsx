import React from "react";
import type { InputProps } from "../../types";

export const Input: React.FC<InputProps> = ({
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
}) => {
  const inputId = `input-${name}`;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
          style={{
            display: "block",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--gray-700)",
            marginBottom: "var(--space-1)",
          }}
        >
          {label}
          {required && (
            <span
              style={{
                color: "var(--error-600)",
                marginLeft: "var(--space-1)",
              }}
            >
              *
            </span>
          )}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        disabled={disabled}
        className={`input ${error ? "error" : ""}`}
      />
      {error && (
        <p
          style={{
            marginTop: "var(--space-1)",
            fontSize: "var(--font-size-sm)",
            color: "var(--error-600)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};
