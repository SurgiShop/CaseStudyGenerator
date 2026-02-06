"use client";

import { ModulePage } from "@/components/module-page";
import { pickingUseCases, pickingCategories } from "@/lib/use-cases";

export default function PickingPage() {
  return (
    <ModulePage
      moduleId="picking"
      moduleName="Picking & Scanning"
      description="Pick list processing, scan verification, FEFO enforcement, and break-pack picking"
      useCases={pickingUseCases}
      categories={pickingCategories}
    />
  );
}
