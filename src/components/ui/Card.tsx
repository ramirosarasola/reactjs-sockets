import React from "react";
import type { CardProps } from "../../types";

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = "",
  header,
  footer,
}) => {
  return (
    <div className={`card ${className}`}>
      {(header || title) && (
        <div className="card-header">
          {header || (
            <>
              {title && (
                <h3
                  style={{
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--gray-900)",
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    marginTop: "var(--space-1)",
                    fontSize: "var(--font-size-sm)",
                    color: "var(--gray-600)",
                  }}
                >
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}
      <div className="card-body">{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};
