"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GS1BarcodeDisplay({ product, showDetails = true }) {
  // Parse month from expiry string like "Sep-2025"
  const parseExpiry = (expiry) => {
    if (!expiry) return null;
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
    return `${year?.slice(-2) || "26"}${monthMap[month] || "01"}15`;
  };

  const gs1String = `(01)${
    product.gtin?.padStart(14, "0") || "00000000000000"
  }(10)${product.lot || "LOTXXXX"}(17)${parseExpiry(
    product.generatedExpiry || product.expiry
  )}`;

  return (
    <Card className="font-mono text-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          GS1-128 Barcode Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-muted rounded-md break-all">{gs1String}</div>

        {showDetails && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">GTIN (01): </span>
              <span className="font-medium">{product.gtin}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Lot (10): </span>
              <span className="font-medium">{product.lot || "N/A"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Expiry (17): </span>
              <span className="font-medium">
                {product.generatedExpiry || product.expiry}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Ref: </span>
              <span className="font-medium">{product.ref}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function GS1BarcodeList({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Sample Products for This Scenario</h4>
      {products.map((product, index) => (
        <GS1BarcodeDisplay key={index} product={product} />
      ))}
    </div>
  );
}
