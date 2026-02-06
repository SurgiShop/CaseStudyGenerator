"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ComplexityBadge } from "@/components/complexity-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function UseCaseCard({ useCase, isSelected, onToggle }) {
  // Handle card tap (for touchscreen) - toggles selection
  const handleCardTap = (e) => {
    // Don't toggle if clicking on accordion trigger or its children
    if (
      e.target.closest("[data-accordion-trigger]") ||
      e.target.closest("[data-radix-collection-item]")
    ) {
      return;
    }
    onToggle();
  };

  return (
    <Card
      className={`transition-all cursor-pointer touch-manipulation active:scale-[0.99] ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
      }`}
      onClick={handleCardTap}
    >
      <CardHeader className="pb-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Checkbox
              id={useCase.id}
              checked={isSelected}
              onCheckedChange={onToggle}
              className="mt-1 h-6 w-6 rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="space-y-2">
              <CardTitle className="text-lg font-medium leading-tight">
                <label htmlFor={useCase.id} className="cursor-pointer">
                  {useCase.title}
                </label>
              </CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {useCase.description}
              </CardDescription>
            </div>
          </div>
          <ComplexityBadge
            complexity={useCase.complexity}
            className="text-sm px-3 py-1"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-5 pb-5">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="steps" className="border-none">
            <AccordionTrigger
              className="py-3 text-base text-muted-foreground hover:no-underline min-h-[48px]"
              data-accordion-trigger
            >
              View Test Steps ({useCase.testSteps.length} steps)
            </AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal list-inside space-y-3 text-base text-muted-foreground">
                {useCase.testSteps.map((step, index) => (
                  <li key={index} className="leading-relaxed py-1">
                    {step}
                  </li>
                ))}
              </ol>
              <div className="mt-4 pt-4 border-t">
                <p className="text-base">
                  <span className="font-medium text-foreground">
                    Expected Outcome:{" "}
                  </span>
                  <span className="text-muted-foreground">
                    {useCase.expectedOutcome}
                  </span>
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
