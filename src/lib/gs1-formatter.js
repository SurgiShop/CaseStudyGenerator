/**
 * GS1-128 Barcode Formatting Utilities
 *
 * Formats data for GS1-128 barcodes with proper Application Identifiers (AIs)
 * Used by bwip-js to generate scannable barcodes
 */

/**
 * Application Identifier definitions
 */
export const AI = {
  GTIN: "01", // Global Trade Item Number (14 digits)
  LOT: "10", // Batch/Lot Number (up to 20 chars)
  EXPIRY: "17", // Expiration Date (YYMMDD)
  SERIAL: "21", // Serial Number (up to 20 chars)
  QUANTITY: "30", // Quantity (up to 8 digits)
  PRODUCTION_DATE: "11", // Production Date (YYMMDD)
};

/**
 * Month name to number mapping
 */
const MONTH_MAP = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

/**
 * Convert expiry string (e.g., "Jun-2026") to YYMMDD format
 * Uses day 28 to be safe for all months
 */
export function formatExpiryDate(expiryString) {
  if (!expiryString) return null;

  // Handle already formatted YYMMDD
  if (/^\d{6}$/.test(expiryString)) {
    return expiryString;
  }

  // Parse "Mon-YYYY" format
  const parts = expiryString.split("-");
  if (parts.length !== 2) return null;

  const [month, year] = parts;
  const monthNum = MONTH_MAP[month];
  if (!monthNum || !year) return null;

  // Use YY format and day 28 (safe for all months)
  const yy = year.slice(-2);
  return `${yy}${monthNum}28`;
}

/**
 * Calculate GS1 check digit using the standard algorithm
 * 
 * @param {string} digits - The first 13 digits of a GTIN-14 (without check digit)
 * @returns {string} The calculated check digit (0-9)
 */
function calculateGS1CheckDigit(digits) {
  // Ensure we have exactly 13 digits
  const padded = digits.padStart(13, "0").slice(-13);
  
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(padded[i], 10);
    // Positions are 1-indexed from left; odd positions get multiplied by 3
    // In a 14-digit GTIN, positions 1,3,5,7,9,11,13 get ×3 (these are indices 0,2,4,6,8,10,12 in 0-indexed 13-digit string)
    if (i % 2 === 0) {
      sum += digit * 3;
    } else {
      sum += digit;
    }
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit.toString();
}

/**
 * Format GTIN to 14 digits with valid check digit
 * 
 * Takes a product code/GTIN and ensures it's a valid 14-digit GTIN
 * by padding and calculating the correct check digit.
 */
export function formatGTIN(gtin) {
  if (!gtin) return "00000000000000";
  
  // Remove any non-digit characters
  const clean = gtin.replace(/\D/g, "");
  
  // Pad to 13 digits (leaving room for check digit)
  const base13 = clean.padStart(13, "0").slice(-13);
  
  // Calculate the correct check digit
  const checkDigit = calculateGS1CheckDigit(base13);
  
  // Return complete 14-digit GTIN with valid check digit
  return base13 + checkDigit;
}

/**
 * Format a complete GS1-128 barcode string
 *
 * @param {Object} data - Barcode data
 * @param {string} data.gtin - Product GTIN
 * @param {string} data.lot - Lot/batch number
 * @param {string} data.expiry - Expiration date (Mon-YYYY or YYMMDD)
 * @param {string} [data.serial] - Serial number (optional)
 * @param {number} [data.quantity] - Quantity (optional)
 * @returns {string} Formatted GS1-128 string with parenthesized AIs
 */
export function formatGS1Barcode(data) {
  const parts = [];

  // GTIN (required) - AI 01
  if (data.gtin) {
    parts.push(`(${AI.GTIN})${formatGTIN(data.gtin)}`);
  }

  // Expiration Date - AI 17 (comes before Lot per GS1 standard)
  if (data.expiry) {
    const formattedExpiry = formatExpiryDate(data.expiry);
    if (formattedExpiry) {
      parts.push(`(${AI.EXPIRY})${formattedExpiry}`);
    }
  }

  // Lot/Batch Number - AI 10
  if (data.lot) {
    // Truncate to 20 chars max
    const lot = data.lot.slice(0, 20);
    parts.push(`(${AI.LOT})${lot}`);
  }

  // Serial Number (optional) - AI 21
  if (data.serial) {
    const serial = data.serial.slice(0, 20);
    parts.push(`(${AI.SERIAL})${serial}`);
  }

  // Quantity (optional) - AI 30
  if (data.quantity) {
    const qty = String(data.quantity).slice(0, 8);
    parts.push(`(${AI.QUANTITY})${qty}`);
  }

  return parts.join("");
}

/**
 * Parse a GS1 barcode string back to data object
 *
 * @param {string} gs1String - GS1 barcode string
 * @returns {Object} Parsed data object
 */
export function parseGS1Barcode(gs1String) {
  const result = {};

  // Match patterns like (01)12345678901234
  const regex = /\((\d{2,4})\)([^(]+)/g;
  let match;

  while ((match = regex.exec(gs1String)) !== null) {
    const [, ai, value] = match;
    switch (ai) {
      case AI.GTIN:
        result.gtin = value;
        break;
      case AI.LOT:
        result.lot = value;
        break;
      case AI.EXPIRY:
        result.expiry = value;
        break;
      case AI.SERIAL:
        result.serial = value;
        break;
      case AI.QUANTITY:
        result.quantity = parseInt(value, 10);
        break;
    }
  }

  return result;
}

/**
 * Generate a random lot number
 */
export function generateLotNumber() {
  const year = new Date().getFullYear();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  const randomNum = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  return `LOT${year}${randomLetter}${randomNum}`;
}

/**
 * Generate an expiry date string (Mon-YYYY format)
 *
 * @param {number} monthsFromNow - Number of months from today
 * @returns {string} Expiry date in Mon-YYYY format
 */
export function generateExpiryDate(monthsFromNow = 12) {
  const date = new Date();
  date.setMonth(date.getMonth() + monthsFromNow);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[date.getMonth()]}-${date.getFullYear()}`;
}

/**
 * Generate an already-expired date string
 *
 * @param {number} monthsAgo - Number of months in the past
 * @returns {string} Expiry date in Mon-YYYY format
 */
export function generateExpiredDate(monthsAgo = 3) {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[date.getMonth()]}-${date.getFullYear()}`;
}

/**
 * Generate a near-expiry date (within 30 days)
 */
export function generateNearExpiryDate() {
  return generateExpiryDate(1);
}
