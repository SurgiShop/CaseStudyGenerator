/**
 * Workflow Generator
 *
 * Creates a coherent set of workflow items that flow through the entire
 * case study from inbound -> sales -> picking -> returns -> expired/damaged
 */

import { products } from "./data/products";
import {
  generateLotNumber,
  generateExpiryDate,
  generateExpiredDate,
  generateNearExpiryDate,
  formatGS1Barcode,
} from "./gs1-formatter";
import { getUseCaseById } from "./use-cases";

/**
 * Analyze selected use cases to determine product requirements
 */
function analyzeUseCaseRequirements(selectedUseCaseIds) {
  const requirements = {
    totalProducts: 0,
    needsMultipleLots: false,
    needsExpiredProduct: false,
    needsNearExpiry: false,
    needsDamagedProduct: false,
    maxComplexity: "basic", // Track highest complexity level
    moduleQuantities: {
      inbound: 0,
      sales: 0,
      picking: 0,
      rma: 0,
      "expired-damaged": 0,
    },
  };

  selectedUseCaseIds.forEach((ucId) => {
    const uc = getUseCaseById(ucId);
    if (!uc) return;

    // Track products needed per use case
    const productsNeeded = uc.productsNeeded || 1;
    requirements.totalProducts = Math.max(
      requirements.totalProducts,
      productsNeeded
    );

    // Track complexity level (basic < medium < complex)
    if (uc.complexity === "complex") {
      requirements.maxComplexity = "complex";
    } else if (
      uc.complexity === "medium" &&
      requirements.maxComplexity !== "complex"
    ) {
      requirements.maxComplexity = "medium";
    }

    // Check for special requirements based on use case flags or IDs
    if (uc.flags?.includes("expired") || uc.id.includes("expired")) {
      requirements.needsExpiredProduct = true;
    }
    if (
      uc.flags?.includes("near-expiry") ||
      uc.flags?.includes("short-expiry")
    ) {
      requirements.needsNearExpiry = true;
    }
    if (uc.flags?.includes("damaged")) {
      requirements.needsDamagedProduct = true;
    }
    if (
      uc.flags?.includes("mixed-lot") ||
      uc.id.includes("multi-lot") ||
      uc.id.includes("multi-product")
    ) {
      requirements.needsMultipleLots = true;
    }

    // Track quantities per module
    if (uc.module) {
      requirements.moduleQuantities[uc.module] =
        (requirements.moduleQuantities[uc.module] || 0) + 1;
    }
  });

  // Ensure minimum products
  if (requirements.totalProducts < 1) {
    requirements.totalProducts = 1;
  }

  // If we have inbound and sales/picking, ensure we have enough products
  const hasInbound = requirements.moduleQuantities.inbound > 0;
  const hasSalesOrPicking =
    requirements.moduleQuantities.sales > 0 ||
    requirements.moduleQuantities.picking > 0;

  if (hasInbound && hasSalesOrPicking && requirements.totalProducts < 2) {
    requirements.totalProducts = 2;
  }

  return requirements;
}

/**
 * Get quantity range based on complexity level
 */
function getQuantityRange(complexity) {
  switch (complexity) {
    case "basic":
      // Simple tests: 5-9 units
      return { min: 5, max: 9 };
    case "medium":
      // Medium tests: 10-20 units
      return { min: 10, max: 20 };
    case "complex":
      // Complex tests: 20-40 units
      return { min: 20, max: 40 };
    default:
      return { min: 5, max: 9 };
  }
}

/**
 * Generate a random inbound price between $100-200 per unit
 */
function generateInboundPrice() {
  // Random price between 100.00 and 200.00, rounded to 2 decimal places
  return Math.round((100 + Math.random() * 100) * 100) / 100;
}

/**
 * Calculate outbound price based on inbound price with profit margin
 * Margin ranges from -10% to +25%
 */
function calculateOutboundPrice(inboundPrice) {
  // Random margin between -0.10 (-10%) and 0.25 (+25%)
  const marginPercent = -0.10 + Math.random() * 0.35;
  const outboundPrice = inboundPrice * (1 + marginPercent);
  return Math.round(outboundPrice * 100) / 100;
}

/**
 * Generate workflow items based on requirements
 */
function generateWorkflowItems(requirements, productCount) {
  const workflowItems = [];

  // Get quantity range based on complexity
  const qtyRange = getQuantityRange(requirements.maxComplexity);

  // Select random products from the pool
  const shuffledProducts = [...products].sort(() => 0.5 - Math.random());
  const selectedProducts = shuffledProducts.slice(0, productCount);

  selectedProducts.forEach((product, index) => {
    // Determine expiry type based on requirements
    let expiry;
    if (index === 0 && requirements.needsExpiredProduct) {
      expiry = generateExpiredDate(2);
    } else if (index === 1 && requirements.needsNearExpiry) {
      expiry = generateNearExpiryDate();
    } else {
      // Standard expiry 6-18 months out
      expiry = generateExpiryDate(6 + Math.floor(Math.random() * 12));
    }

    const lot = generateLotNumber();

    // Base quantity based on complexity
    const baseQuantity =
      qtyRange.min +
      Math.floor(Math.random() * (qtyRange.max - qtyRange.min + 1));

    // Calculate module quantities - ensure at least 1 for each active module
    const salesQty = Math.max(1, Math.floor(baseQuantity * 0.6));
    const returnsQty = Math.max(1, Math.floor(baseQuantity * 0.15));

    // Generate pricing - inbound $100-200/unit, outbound with -10% to +25% margin
    const inboundPrice = generateInboundPrice();
    const outboundPrice = calculateOutboundPrice(inboundPrice);

    const workflowItem = {
      id: `wf-${Date.now()}-${index}`,
      product: {
        ref: product.ref,
        gtin: product.gtin,
        originalExpiry: product.expiry,
      },
      lot,
      expiry,
      baseQuantity,
      // Module-specific quantities
      quantities: {
        inbound: baseQuantity,
        sales: salesQty,
        picking: salesQty,
        returns: returnsQty,
        damaged:
          requirements.needsDamagedProduct && index === 0
            ? Math.min(2, baseQuantity)
            : 0,
        expired:
          requirements.needsExpiredProduct && index === 0 ? baseQuantity : 0,
      },
      // Pricing per unit
      pricing: {
        inboundUnitPrice: inboundPrice,
        outboundUnitPrice: outboundPrice,
        profitMargin: Math.round(((outboundPrice - inboundPrice) / inboundPrice) * 100 * 100) / 100,
      },
      // Pre-generate the GS1 barcode string
      gs1String: formatGS1Barcode({
        gtin: product.gtin,
        lot,
        expiry,
      }),
      // Flags for special handling
      flags: {
        isExpired: index === 0 && requirements.needsExpiredProduct,
        isNearExpiry: index === 1 && requirements.needsNearExpiry,
        isDamaged: index === 0 && requirements.needsDamagedProduct,
      },
    };

    workflowItems.push(workflowItem);
  });

  // If we need multiple lots of the same product, add a variant
  if (requirements.needsMultipleLots && workflowItems.length > 0) {
    const baseItem = workflowItems[0];
    const variantLot = generateLotNumber();
    const variantExpiry = generateExpiryDate(
      Math.floor(Math.random() * 12) + 3
    );

    // Variant lot uses same complexity-based quantity range
    const variantQty =
      qtyRange.min +
      Math.floor(Math.random() * (qtyRange.max - qtyRange.min + 1));
    const variantSales = Math.max(1, Math.floor(variantQty * 0.6));

    // Generate pricing for variant lot
    const variantInboundPrice = generateInboundPrice();
    const variantOutboundPrice = calculateOutboundPrice(variantInboundPrice);

    workflowItems.push({
      id: `wf-${Date.now()}-variant`,
      product: { ...baseItem.product },
      lot: variantLot,
      expiry: variantExpiry,
      baseQuantity: variantQty,
      quantities: {
        inbound: variantQty,
        sales: variantSales,
        picking: variantSales,
        returns: 0,
        damaged: 0,
        expired: 0,
      },
      pricing: {
        inboundUnitPrice: variantInboundPrice,
        outboundUnitPrice: variantOutboundPrice,
        profitMargin: Math.round(((variantOutboundPrice - variantInboundPrice) / variantInboundPrice) * 100 * 100) / 100,
      },
      gs1String: formatGS1Barcode({
        gtin: baseItem.product.gtin,
        lot: variantLot,
        expiry: variantExpiry,
      }),
      flags: {
        isVariantLot: true,
        isExpired: false,
        isNearExpiry: false,
        isDamaged: false,
      },
    });
  }

  return workflowItems;
}

/**
 * Main function to generate complete workflow data for a case study
 *
 * @param {string[]} selectedUseCaseIds - Array of selected use case IDs
 * @returns {Object} Complete workflow data
 */
export function generateWorkflow(selectedUseCaseIds) {
  const requirements = analyzeUseCaseRequirements(selectedUseCaseIds);

  // Determine how many products we need
  let productCount = requirements.totalProducts;

  // Ensure we have at least the minimum based on module coverage
  if (requirements.moduleQuantities.inbound > 0) {
    productCount = Math.max(productCount, 2);
  }

  const workflowItems = generateWorkflowItems(requirements, productCount);

  return {
    generatedAt: new Date().toISOString(),
    requirements,
    items: workflowItems,
    summary: {
      totalProducts: workflowItems.length,
      totalInboundQty: workflowItems.reduce(
        (sum, item) => sum + item.quantities.inbound,
        0
      ),
      totalSalesQty: workflowItems.reduce(
        (sum, item) => sum + item.quantities.sales,
        0
      ),
      // Value calculations
      totalInboundValue: Math.round(workflowItems.reduce(
        (sum, item) => sum + (item.quantities.inbound * item.pricing.inboundUnitPrice),
        0
      ) * 100) / 100,
      totalSalesValue: Math.round(workflowItems.reduce(
        (sum, item) => sum + (item.quantities.sales * item.pricing.outboundUnitPrice),
        0
      ) * 100) / 100,
      expectedProfit: Math.round(workflowItems.reduce(
        (sum, item) => sum + (item.quantities.sales * (item.pricing.outboundUnitPrice - item.pricing.inboundUnitPrice)),
        0
      ) * 100) / 100,
      hasExpiredItems: workflowItems.some((item) => item.flags.isExpired),
      hasNearExpiryItems: workflowItems.some((item) => item.flags.isNearExpiry),
      hasDamagedItems: workflowItems.some((item) => item.flags.isDamaged),
    },
  };
}

/**
 * Get workflow items for a specific module
 */
export function getItemsForModule(workflow, moduleId) {
  if (!workflow?.items) return [];

  return workflow.items.filter((item) => {
    switch (moduleId) {
      case "inbound":
        return item.quantities.inbound > 0;
      case "sales":
        return item.quantities.sales > 0 && !item.flags.isExpired;
      case "picking":
        return item.quantities.picking > 0 && !item.flags.isExpired;
      case "rma":
        return item.quantities.returns > 0 || item.quantities.sales > 0;
      case "expired-damaged":
        return (
          item.flags.isExpired ||
          item.flags.isDamaged ||
          item.quantities.damaged > 0
        );
      case "accounting":
        return item.quantities.sales > 0;
      default:
        return true;
    }
  });
}

/**
 * Calculate totals for display
 */
export function calculateWorkflowTotals(workflow) {
  if (!workflow?.items) return null;

  return {
    products: workflow.items.length,
    inbound: workflow.items.reduce(
      (sum, item) => sum + item.quantities.inbound,
      0
    ),
    sales: workflow.items.reduce((sum, item) => sum + item.quantities.sales, 0),
    picking: workflow.items.reduce(
      (sum, item) => sum + item.quantities.picking,
      0
    ),
    returns: workflow.items.reduce(
      (sum, item) => sum + item.quantities.returns,
      0
    ),
    damaged: workflow.items.reduce(
      (sum, item) => sum + item.quantities.damaged,
      0
    ),
    // Value totals
    inboundValue: Math.round(workflow.items.reduce(
      (sum, item) => sum + (item.quantities.inbound * (item.pricing?.inboundUnitPrice || 0)),
      0
    ) * 100) / 100,
    salesValue: Math.round(workflow.items.reduce(
      (sum, item) => sum + (item.quantities.sales * (item.pricing?.outboundUnitPrice || 0)),
      0
    ) * 100) / 100,
    profit: Math.round(workflow.items.reduce(
      (sum, item) => sum + (item.quantities.sales * ((item.pricing?.outboundUnitPrice || 0) - (item.pricing?.inboundUnitPrice || 0))),
      0
    ) * 100) / 100,
  };
}
