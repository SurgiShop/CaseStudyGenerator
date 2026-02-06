"use client";

import { ModulePage } from "@/components/module-page";
import { rmaUseCases, rmaCategories } from "@/lib/use-cases";

export default function RmaPage() {
  return (
    <ModulePage
      moduleId="rma"
      moduleName="Post-Sales / RMA"
      description="RMA requests, customer-reported damage, return processing, and credits/refunds"
      useCases={rmaUseCases}
      categories={rmaCategories}
    />
  );
}
