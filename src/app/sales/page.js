"use client";

import { ModulePage } from "@/components/module-page";
import { salesUseCases, salesCategories } from "@/lib/use-cases";

export default function SalesPage() {
  return (
    <ModulePage
      moduleId="sales"
      moduleName="Sales & Fulfillment"
      description="Sales orders, fulfillment workflows, and break-pack / each pick scenarios"
      useCases={salesUseCases}
      categories={salesCategories}
    />
  );
}
