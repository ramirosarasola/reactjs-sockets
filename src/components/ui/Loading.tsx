import React from "react";
import type { LoadingProps } from "../../types";

const sizeClasses = {
  sm: "loading-sm",
  md: "loading-md",
  lg: "loading-lg",
};

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  className = "",
}) => {
  const sizeClass = sizeClasses[size];
  const classes = `loading ${sizeClass} ${className}`.trim();

  return <div className={classes} />;
};
