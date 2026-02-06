"use client";

import { ModulePage } from "@/components/module-page";
import { inboundUseCases, inboundCategories } from "@/lib/use-cases";

export default function InboundPage() {
  return (
    <ModulePage
      moduleId="inbound"
      moduleName="Warehouse Inbound"
      description="Receiving with GS1 scanning, lot tracking, damaged goods handling, and expiry management"
      useCases={inboundUseCases}
      categories={inboundCategories}
    />
  );
}
