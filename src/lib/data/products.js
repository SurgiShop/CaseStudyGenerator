/**
 * Sample products from ERPNext Import - Barcodes.csv
 * Used for generating realistic case study scenarios
 */

export const products = [
  { ref: "2296-003-225E", gtin: "04546540046550", expiry: "Oct-2025" },
  { ref: "306028-0000-000E", gtin: "04049539102386", expiry: "Sep-2025" },
  { ref: "00711811E", gtin: "00724995180881", expiry: "Sep-2025" },
  { ref: "9079-VC-005E", gtin: "10816000013967", expiry: "Sep-2025" },
  { ref: "405120E", gtin: "05415067040978", expiry: "Sep-2025" },
  { ref: "202.816E", gtin: "10886982144744", expiry: "Sep-2025" },
  { ref: "204.828E", gtin: "10886982146328", expiry: "Sep-2025" },
  { ref: "G3606010E", gtin: "00643169530096", expiry: "Sep-2025" },
  { ref: "0275-647-000B", gtin: "37613327061735", expiry: "Sep-2025" },
  { ref: "UMB678E", gtin: "00888937001402", expiry: "Sep-2025" },
  { ref: "204.838E", gtin: "04712782854325", expiry: "Sep-2025" },
  { ref: "212.824E", gtin: "10886982152893", expiry: "Sep-2025" },
  { ref: "204.812E", gtin: "10886982146243", expiry: "Sep-2025" },
  { ref: "C4130E", gtin: "00607915110147", expiry: "Sep-2025" },
  { ref: "4425B", gtin: "10843997013113", expiry: "Sep-2025" },
  { ref: "5820-110-040CE", gtin: "07613327294743", expiry: "Sep-2025" },
  { ref: "M00513370E", gtin: "08714729745624", expiry: "Sep-2025" },
  { ref: "AR-3200-1040E", gtin: "00888867100640", expiry: "Sep-2025" },
  { ref: "011050-10B", gtin: "040481412633", expiry: "Sep-2025" },
  { ref: "SU130-1238E", gtin: "00684995510043", expiry: "Sep-2025" },
  { ref: "7210126B", gtin: "23596010493457", expiry: "Sep-2025" },
  { ref: "0275-647-000E", gtin: "07613327061734", expiry: "Sep-2025" },
  { ref: "H9102E", gtin: "10845854018071", expiry: "Sep-2025" },
  { ref: "MV2SE", gtin: "036654152277", expiry: "Sep-2025" },
  { ref: "9599AE", gtin: "10845854018712", expiry: "Sep-2025" },
  { ref: "C9415E", gtin: "10845854018705", expiry: "Sep-2025" },
  { ref: "212.814E", gtin: "108869152848", expiry: "Sep-2025" },
  { ref: "CG511E", gtin: "04987350772534", expiry: "Sep-2025" },
  { ref: "TV11-10E", gtin: "00817640020752", expiry: "Sep-2025" },
  { ref: "9299AE", gtin: "10845854016725", expiry: "Sep-2025" },
  { ref: "0120-20-2.7E", gtin: "00350770949055", expiry: "Sep-2025" },
  { ref: "CS-15192-XE", gtin: "20801902195306", expiry: "Sep-2025" },
  { ref: "UMW676E", gtin: "00888937001440", expiry: "Sep-2025" },
  { ref: "07-150-12E", gtin: "00817122020331", expiry: "Sep-2025" },
  { ref: "73301088E", gtin: "05037881168678", expiry: "Sep-2025" },
  { ref: "SB2000SAB", gtin: "00821925027893", expiry: "Sep-2025" },
  { ref: "G6303E", gtin: "00607915118105", expiry: "Sep-2025" },
  { ref: "5820-012-050DE", gtin: "07613327294644", expiry: "Sep-2025" },
  { ref: "AR-4209-14E", gtin: "00888867033498", expiry: "Sep-2025" },
  { ref: "0375-545-000B", gtin: "37613327061797", expiry: "Sep-2025" },
];

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
 * Generate a random expiry date (1-24 months from now)
 */
export function generateExpiryDate(monthsFromNow = null) {
  const date = new Date();
  const months = monthsFromNow || Math.floor(Math.random() * 24) + 1;
  date.setMonth(date.getMonth() + months);
  const monthNames = [
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
  return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
}

/**
 * Generate a past expiry date (already expired)
 */
export function generateExpiredDate() {
  const date = new Date();
  const monthsAgo = Math.floor(Math.random() * 6) + 1;
  date.setMonth(date.getMonth() - monthsAgo);
  const monthNames = [
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
  return `${monthNames[date.getMonth()]}-${date.getFullYear()}`;
}

/**
 * Get random products from the list
 */
export function getRandomProducts(count = 1) {
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((p) => ({
    ...p,
    lot: generateLotNumber(),
    generatedExpiry: generateExpiryDate(),
  }));
}

/**
 * Format GS1-128 barcode string
 */
export function formatGS1Barcode(product, options = {}) {
  const { includeSerial = false, quantity = null } = options;
  let barcode = `(01)${product.gtin.padStart(14, "0")}`;
  barcode += `(10)${product.lot || generateLotNumber()}`;

  // Convert expiry to YYMMDD format
  const expiry = product.generatedExpiry || product.expiry;
  const [month, year] = expiry.split("-");
  const monthMap = {
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
  const yymmdd = `${year.slice(-2)}${monthMap[month]}15`;
  barcode += `(17)${yymmdd}`;

  if (includeSerial) {
    const serial = Math.random().toString(36).substring(2, 12).toUpperCase();
    barcode += `(21)${serial}`;
  }

  if (quantity) {
    barcode += `(30)${quantity}`;
  }

  return barcode;
}
