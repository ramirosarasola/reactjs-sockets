import React from "react";
import type { ButtonProps } from "../../types";

const sizeClasses = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

const variantClasses = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
}) => {
  const baseClasses = "btn";
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  const classes =
    `${baseClasses} ${variantClass} ${sizeClass} ${className}`.trim();

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <div className="loading" />}
      {children}
    </button>
  );
};
