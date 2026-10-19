import type { ReactNode } from "react";

export type TrendDirection = "up" | "down" | "neutral";

export interface DataCardTrend {
  direction: TrendDirection;
  value: string | number;
}

export interface DataCardProps {
  title: string;
  value: ReactNode;
  description?: ReactNode;
  trend?: DataCardTrend;
  icon?: ReactNode;
  className?: string;
}

const trendSymbols: Record<TrendDirection, string> = {
  up: "↑",
  down: "↓",
  neutral: "•",
};

export function DataCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: DataCardProps) {
  const classes = ["data-card", className].filter(Boolean).join(" ");

  return (
    <article className={classes} aria-label={title}>
      <div className="data-card__header">
        <h2 className="data-card__title">{title}</h2>
        {icon != null && (
          <span className="data-card__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <div className="data-card__value">{value}</div>

      {(description != null || trend != null) && (
        <div className="data-card__footer">
          {description != null && (
            <div className="data-card__description">{description}</div>
          )}
          {trend != null && (
            <span
              className={`data-card__trend data-card__trend--${trend.direction}`}
              aria-label={`${trend.direction} ${trend.value}`}
            >
              <span aria-hidden="true">{trendSymbols[trend.direction]}</span>
              {trend.value}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
