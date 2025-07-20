import React from "react";
import type { BadgeProps } from "../../types";

const variantClasses = {
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "primary",
  className = "",
}) => {
  const variantClass = variantClasses[variant];
  const classes = `badge ${variantClass} ${className}`.trim();

  return <span className={classes}>{children}</span>;
};
