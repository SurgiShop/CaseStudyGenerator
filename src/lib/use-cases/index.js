/**
 * Central export for all use cases
 */

import { inboundUseCases, inboundCategories } from "./inbound";
import { salesUseCases, salesCategories } from "./sales";
import { accountingUseCases, accountingCategories } from "./accounting";
import { pickingUseCases, pickingCategories } from "./picking";
import { rmaUseCases, rmaCategories } from "./rma";
import {
  expiredDamagedUseCases,
  expiredDamagedCategories,
} from "./expired-damaged";

// Re-export all use cases and categories
export {
  inboundUseCases,
  inboundCategories,
  salesUseCases,
  salesCategories,
  accountingUseCases,
  accountingCategories,
  pickingUseCases,
  pickingCategories,
  rmaUseCases,
  rmaCategories,
  expiredDamagedUseCases,
  expiredDamagedCategories,
};

/**
 * Module definitions for navigation
 */
export const modules = [
  {
    id: "inbound",
    name: "Warehouse Inbound",
    description:
      "Receiving with GS1 scanning, lot tracking, and expiry management",
    href: "/inbound",
    icon: "PackageOpen",
  },
  {
    id: "sales",
    name: "Sales & Fulfillment",
    description: "Sales orders, fulfillment, and break-pack workflows",
    href: "/sales",
    icon: "ShoppingCart",
  },
  {
    id: "accounting",
    name: "Accounting & Payments",
    description: "Payment processing, prepayments, and net terms",
    href: "/accounting",
    icon: "CreditCard",
  },
  {
    id: "picking",
    name: "Picking & Scanning",
    description: "Pick list processing and scan verification",
    href: "/picking",
    icon: "ScanLine",
  },
  {
    id: "rma",
    name: "Post-Sales / RMA",
    description: "Returns, RMA processing, and customer support",
    href: "/rma",
    icon: "RotateCcw",
  },
  {
    id: "expired-damaged",
    name: "Expired & Damaged",
    description: "Handle expired and damaged inventory",
    href: "/expired-damaged",
    icon: "AlertTriangle",
  },
];

/**
 * Get all use cases for a specific module
 */
export function getUseCasesByModule(moduleId) {
  switch (moduleId) {
    case "inbound":
      return { useCases: inboundUseCases, categories: inboundCategories };
    case "sales":
      return { useCases: salesUseCases, categories: salesCategories };
    case "accounting":
      return { useCases: accountingUseCases, categories: accountingCategories };
    case "picking":
      return { useCases: pickingUseCases, categories: pickingCategories };
    case "rma":
      return { useCases: rmaUseCases, categories: rmaCategories };
    case "expired-damaged":
      return {
        useCases: expiredDamagedUseCases,
        categories: expiredDamagedCategories,
      };
    default:
      return { useCases: [], categories: [] };
  }
}

/**
 * Get a single use case by ID
 */
export function getUseCaseById(useCaseId) {
  const allUseCases = [
    ...inboundUseCases,
    ...salesUseCases,
    ...accountingUseCases,
    ...pickingUseCases,
    ...rmaUseCases,
    ...expiredDamagedUseCases,
  ];
  return allUseCases.find((uc) => uc.id === useCaseId);
}

/**
 * Complexity levels with colors
 */
export const complexityLevels = {
  basic: {
    label: "Basic",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  medium: {
    label: "Medium",
    color:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  },
  complex: {
    label: "Complex",
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
};
