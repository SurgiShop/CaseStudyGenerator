/**
 * Inbound Module Use Cases
 * Warehouse receiving with GS1 scanning, lot tracking, and expiry management
 */

export const inboundUseCases = [
  // Standard Receipt Use Cases
  {
    id: "inbound-single-lot",
    module: "inbound",
    category: "standard",
    title: "Single Product, Single Lot Receipt",
    complexity: "basic",
    description:
      "Receive a single product with one lot number via GS1 barcode scan",
    testSteps: [
      "Create Purchase Order in ERPNext for the product",
      "Create Purchase Receipt from the Purchase Order",
      "Scan GS1-128 barcode on product",
      "Verify GTIN matches expected item",
      "Confirm lot number captured correctly",
      "Verify expiration date recorded",
      "Submit Purchase Receipt to post to inventory",
    ],
    expectedOutcome:
      "Stock entry created with correct lot number and expiry date",
    productsNeeded: 1,
  },
  {
    id: "inbound-multi-product",
    module: "inbound",
    category: "standard",
    title: "Multiple Products, Mixed Lots",
    complexity: "medium",
    description:
      "Receive shipment with multiple products, each having different lot numbers",
    testSteps: [
      "Create Purchase Order with multiple line items",
      "Create Purchase Receipt from the Purchase Order",
      "Scan first product GS1 barcode",
      "Verify lot and expiry captured",
      "Scan second product (different SKU)",
      "Scan third product (same SKU, different lot)",
      "Review all captured data",
      "Submit Purchase Receipt",
    ],
    expectedOutcome:
      "Multiple stock entries created with distinct lot numbers per product",
    productsNeeded: 3,
  },
  {
    id: "inbound-short-expiry",
    module: "inbound",
    category: "standard",
    title: "Short Expiry Products (FEFO Validation)",
    complexity: "medium",
    description: "Receive products with expiration dates less than 90 days out",
    testSteps: [
      "Create Purchase Order for the product",
      "Create Purchase Receipt from the Purchase Order",
      "Scan GS1 barcode with near-term expiry",
      "System should flag short shelf life",
      "Review short-dated product alert",
      "Accept with acknowledgment or reject",
      "If accepted, submit Purchase Receipt",
      "Verify FEFO queue position in stock",
    ],
    expectedOutcome:
      "Product flagged as short-dated, positioned for priority dispatch",
    productsNeeded: 1,
    flags: ["short-expiry"],
  },
  {
    id: "inbound-quantity-discrepancy",
    module: "inbound",
    category: "standard",
    title: "Quantity Discrepancy (Over/Under Receipt)",
    complexity: "complex",
    description:
      "Handle cases where received quantity differs from PO quantity",
    testSteps: [
      "Create Purchase Order for 100 units",
      "Create Purchase Receipt from the Purchase Order",
      "Receive shipment with 95 units (under)",
      "Scan all products via GS1 barcode",
      "System detects quantity mismatch",
      "Document discrepancy with reason code",
      "Submit partial Purchase Receipt",
      "Verify backorder created for remaining 5 units",
    ],
    expectedOutcome:
      "Partial receipt processed, discrepancy documented, backorder generated",
    productsNeeded: 1,
  },
  {
    id: "inbound-quarantine",
    module: "inbound",
    category: "standard",
    title: "Quarantine Workflow (QC Hold)",
    complexity: "complex",
    description:
      "Receive products requiring quality control inspection before release",
    testSteps: [
      "Create Purchase Order for product flagged for QC",
      "Create Purchase Receipt from the Purchase Order",
      "Scan GS1 barcode on product",
      "System routes to quarantine location",
      "Submit Purchase Receipt to quarantine warehouse",
      "Generate QC inspection task",
      "Complete inspection (pass/fail)",
      "If pass, stock transfer to sellable inventory",
      "If fail, initiate disposition workflow",
    ],
    expectedOutcome:
      "Product held in quarantine until QC approval, then released or dispositioned",
    productsNeeded: 1,
    flags: ["quarantine"],
  },

  // Damaged Goods Use Cases
  {
    id: "inbound-partial-damage",
    module: "inbound",
    category: "damaged",
    title: "Partial Damage - Accept Good, Reject Damaged",
    complexity: "medium",
    description:
      "Receive shipment where some units are damaged but others are acceptable",
    testSteps: [
      "Create Purchase Order for 50 units",
      "Create Purchase Receipt from the Purchase Order",
      "Inspect shipment and identify 5 damaged units",
      "Scan good units (45) via GS1 barcode",
      "Document damaged units with photos/notes",
      "Adjust Purchase Receipt quantity to 45",
      "Submit Purchase Receipt for good units only",
      "Create Debit Note for 5 damaged units",
    ],
    expectedOutcome:
      "45 units received to inventory, 5 units documented for vendor claim",
    productsNeeded: 1,
    flags: ["damaged"],
  },
  {
    id: "inbound-full-carton-damage",
    module: "inbound",
    category: "damaged",
    title: "Full Carton Damage - Reject Shipment Line",
    complexity: "medium",
    description: "Entire carton/shipment line is damaged and must be rejected",
    testSteps: [
      "Create Purchase Order for the product",
      "Create Purchase Receipt from the Purchase Order",
      "Inspect shipment - identify fully damaged carton",
      "Document damage with photos",
      "Remove damaged line from Purchase Receipt",
      "Submit Purchase Receipt without damaged line",
      "Create Debit Note for rejected items",
    ],
    expectedOutcome:
      "Shipment line rejected, claim initiated, receipt completed without damaged items",
    productsNeeded: 1,
    flags: ["damaged"],
  },
  {
    id: "inbound-concealed-damage",
    module: "inbound",
    category: "damaged",
    title: "Concealed Damage - Discovered After Receipt",
    complexity: "complex",
    description: "Damage discovered after initial receipt has been completed",
    testSteps: [
      "Complete normal Purchase Receipt process",
      "Later discover concealed damage in stock",
      "Create Stock Entry (Material Issue) to adjust",
      "Document damage with photos/evidence",
      "Create Debit Note linked to original Purchase Receipt",
      "Update inventory status",
    ],
    expectedOutcome:
      "Inventory adjusted, concealed damage documented, late claim filed",
    productsNeeded: 1,
    flags: ["damaged", "post-receipt"],
  },
  {
    id: "inbound-vendor-claim",
    module: "inbound",
    category: "damaged",
    title: "Vendor Claim Workflow",
    complexity: "complex",
    description: "Complete vendor claim process for damaged goods",
    testSteps: [
      "Document damage with photos and description",
      "Create Debit Note in ERPNext",
      "Link to original Purchase Order and Purchase Receipt",
      "Submit Debit Note to vendor",
      "Track claim status in ERPNext",
      "Record Payment Entry when credit received",
      "Create Stock Entry to dispose of damaged goods",
    ],
    expectedOutcome:
      "Vendor claim processed, credit received, damaged goods dispositioned",
    productsNeeded: 1,
    flags: ["damaged", "claim"],
  },

  // Expired on Arrival Use Cases
  {
    id: "inbound-expired-reject",
    module: "inbound",
    category: "expired",
    title: "Reject Expired Product at Receiving",
    complexity: "basic",
    description: "Product arrives already expired and must be rejected",
    testSteps: [
      "Create Purchase Order for the product",
      "Create Purchase Receipt from the Purchase Order",
      "Scan GS1 barcode on product",
      "System detects expired date from barcode",
      "Reject product - remove from Purchase Receipt",
      "Document reason for rejection",
      "Submit Purchase Receipt without expired item",
      "Create Debit Note to vendor",
    ],
    expectedOutcome:
      "Expired product rejected, vendor notified, claim initiated",
    productsNeeded: 1,
    flags: ["expired"],
  },
  {
    id: "inbound-near-expiry-accept",
    module: "inbound",
    category: "expired",
    title: "Near-Expiry Product - Accept with Flag",
    complexity: "medium",
    description:
      "Product arrives with expiry date within minimum shelf life requirement",
    testSteps: [
      "Create Purchase Order for the product",
      "Create Purchase Receipt from the Purchase Order",
      "Scan GS1 barcode - system detects 30-day expiry",
      "System flags as below minimum shelf life",
      "Review and decide to accept",
      "Mark as short-dated in Purchase Receipt",
      "Submit Purchase Receipt to clearance warehouse",
      "Verify FEFO queue priority in stock",
    ],
    expectedOutcome:
      "Product accepted with short-shelf-life flag, prioritized for sale",
    productsNeeded: 1,
    flags: ["near-expiry"],
  },
  {
    id: "inbound-mixed-expiry",
    module: "inbound",
    category: "expired",
    title: "Mixed Lot - Partial Expired Acceptance",
    complexity: "complex",
    description: "Shipment contains multiple lots, some expired and some valid",
    testSteps: [
      "Create Purchase Order for the product",
      "Create Purchase Receipt from the Purchase Order",
      "Scan Lot A GS1 barcode - valid expiry, accept",
      "Scan Lot B GS1 barcode - expired, reject",
      "Scan Lot C GS1 barcode - near expiry, accept with flag",
      "Remove rejected Lot B from Purchase Receipt",
      "Submit Purchase Receipt with accepted lots",
      "Create Debit Note for rejected Lot B",
    ],
    expectedOutcome:
      "Valid lots received, expired lot rejected with claim, near-expiry flagged",
    productsNeeded: 1,
    flags: ["expired", "mixed-lot"],
  },
];

export const inboundCategories = [
  {
    id: "standard",
    name: "Standard Receipt",
    description: "Normal receiving workflows",
  },
  {
    id: "damaged",
    name: "Damaged Goods",
    description: "Handling damaged items at receiving",
  },
  {
    id: "expired",
    name: "Expired on Arrival",
    description: "Dealing with expired products",
  },
];
