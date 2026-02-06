"use client";

import { Badge } from "@/components/ui/badge";
import { complexityLevels } from "@/lib/use-cases";

export function ComplexityBadge({ complexity, className = "" }) {
  const level = complexityLevels[complexity] || complexityLevels.basic;

  return (
    <Badge variant="outline" className={`${level.color} ${className}`}>
      {level.label}
    </Badge>
  );
}
