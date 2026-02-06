"use client";

import { ModulePage } from "@/components/module-page";
import {
  expiredDamagedUseCases,
  expiredDamagedCategories,
} from "@/lib/use-cases";

export default function ExpiredDamagedPage() {
  return (
    <ModulePage
      moduleId="expired-damaged"
      moduleName="Expired & Damaged Inventory"
      description="Handle expired items, damaged inventory, and disposition workflows"
      useCases={expiredDamagedUseCases}
      categories={expiredDamagedCategories}
    />
  );
}
