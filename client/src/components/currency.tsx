import React from "react";
import { cn } from "@/lib/utils";

interface CurrencyProps extends React.HTMLAttributes<HTMLSpanElement> {
  valueInCents: number;
  showSign?: boolean;
  className?: string;
}

export function Currency({ valueInCents, showSign = false, className, ...props }: CurrencyProps) {
  const isNegative = valueInCents < 0;
  const value = Math.abs(valueInCents) / 100;
  
  const formatted = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return (
    <span 
      className={cn(
        "font-medium tabular-nums tracking-tight",
        showSign && isNegative ? "text-destructive" : "",
        showSign && !isNegative && valueInCents > 0 ? "text-success" : "",
        className
      )}
      {...props}
    >
      {isNegative ? "-" : (showSign && valueInCents > 0 ? "+" : "")}
      {formatted}
    </span>
  );
}
