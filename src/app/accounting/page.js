"use client";

import { ModulePage } from "@/components/module-page";
import { accountingUseCases, accountingCategories } from "@/lib/use-cases";

export default function AccountingPage() {
  return (
    <ModulePage
      moduleId="accounting"
      moduleName="Accounting & Payments"
      description="Payment processing, prepayments, net terms, invoicing, and accounts receivable"
      useCases={accountingUseCases}
      categories={accountingCategories}
    />
  );
}
