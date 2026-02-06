"use client";

import { useEffect, useRef, useState } from "react";

/**
 * GS1-128 Barcode Image Component
 *
 * Renders a scannable GS1-128 barcode using bwip-js
 * The barcode includes GTIN, Lot, and Expiry data encoded with proper AIs
 */
export function BarcodeImage({
  gs1Data,
  scale = 1,
  height = 15,
  showText = true,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!gs1Data || !canvasRef.current) return;

    // Dynamic import of bwip-js to avoid SSR issues
    const renderBarcode = async () => {
      try {
        const bwipjs = (await import("bwip-js")).default;

        bwipjs.toCanvas(canvasRef.current, {
          bcid: "gs1-128", // GS1-128 barcode type
          text: gs1Data, // Data to encode
          scale: scale, // Scaling factor
          height: height, // Bar height in mm
          includetext: showText, // Show human-readable text
          textxalign: "center", // Center the text
          textsize: 8, // Text size
          textyoffset: -3, // Negative value pushes text down, away from bars
        });

        setError(null);
        setIsLoaded(true);
      } catch (err) {
        console.error("Barcode generation error:", err);
        setError(err.message || "Failed to generate barcode");
        setIsLoaded(false);
      }
    };

    renderBarcode();
  }, [gs1Data, scale, height, showText]);

  if (error) {
    return (
      <div
        className={`p-2 border border-red-300 bg-red-50 rounded text-xs text-red-600 ${className}`}
      >
        <p>Barcode Error: {error}</p>
        <p className="font-mono mt-1 text-xs break-all">{gs1Data}</p>
      </div>
    );
  }

  return (
    <div className={`inline-block ${className}`}>
      <canvas ref={canvasRef} className={`${isLoaded ? "" : "invisible"}`} />
      {!isLoaded && (
        <div className="h-16 w-48 bg-gray-100 animate-pulse rounded" />
      )}
    </div>
  );
}

/**
 * Barcode with product info display
 */
export function ProductBarcode({
  workflowItem,
  showDetails = true,
  className = "",
}) {
  if (!workflowItem) return null;

  return (
    <div className={`border rounded-lg p-3 bg-white ${className}`}>
      {showDetails && (
        <div className="mb-2 text-sm">
          <p className="font-medium">{workflowItem.product.ref}</p>
          <div className="flex gap-3 text-muted-foreground text-xs mt-0.5">
            <span>Lot: {workflowItem.lot}</span>
            <span>Exp: {workflowItem.expiry}</span>
            <span>Qty: {workflowItem.baseQuantity}</span>
          </div>
          {workflowItem.pricing && (
            <div className="flex gap-3 text-muted-foreground text-xs mt-1">
              <span>In: ${workflowItem.pricing.inboundUnitPrice.toFixed(2)}</span>
              <span>Out: ${workflowItem.pricing.outboundUnitPrice.toFixed(2)}</span>
              <span className={workflowItem.pricing.profitMargin >= 0 ? "text-green-600" : "text-red-600"}>
                Margin: {workflowItem.pricing.profitMargin >= 0 ? "+" : ""}{workflowItem.pricing.profitMargin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}

      <BarcodeImage gs1Data={workflowItem.gs1String} scale={1} height={10} />

      <p className="font-mono text-xs mt-1 text-muted-foreground break-all">
        {workflowItem.gs1String}
      </p>
    </div>
  );
}

/**
 * Compact barcode for inline use in test steps
 */
export function InlineBarcode({ gs1Data, label, className = "" }) {
  return (
    <div className={`my-2 ${className}`}>
      {label && <p className="text-xs text-muted-foreground mb-1">{label}</p>}
      <BarcodeImage gs1Data={gs1Data} scale={1} height={12} />
    </div>
  );
}

// Helper to get raw barcode data (remove parentheses from GS1 string)
const getRawBarcodeData = (gs1String) => {
  if (!gs1String) return "";
  return gs1String.replace(/[()]/g, "");
};

/**
 * Print-optimized barcode
 * Medium size for reliable scanning from printed documents
 */
export function PrintBarcode({ workflowItem, index, className = "" }) {
  if (!workflowItem) return null;

  return (
    <div
      className={`border border-black p-3 bg-white page-break-inside-avoid ${className}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm">
            Product {index + 1}: {workflowItem.product.ref}
          </p>
          <div className="flex gap-3 text-xs mt-0.5">
            <span>
              <strong>Lot:</strong> {workflowItem.lot}
            </span>
            <span>
              <strong>Exp:</strong> {workflowItem.expiry}
            </span>
          </div>
        </div>
        <div className="text-right text-xs">
          <p>
            <strong>In:</strong> {workflowItem.quantities.inbound}
          </p>
          <p>
            <strong>Out:</strong> {workflowItem.quantities.sales}
          </p>
          {workflowItem.pricing && (
            <>
              <p className="mt-1">
                <strong>Cost:</strong> ${workflowItem.pricing.inboundUnitPrice.toFixed(2)}
              </p>
              <p>
                <strong>Price:</strong> ${workflowItem.pricing.outboundUnitPrice.toFixed(2)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex justify-center py-2 bg-white">
        <BarcodeImage gs1Data={workflowItem.gs1String} scale={1} height={10} />
      </div>

      <p className="font-mono text-xs mt-1 text-center break-all text-gray-500">
        {getRawBarcodeData(workflowItem.gs1String)}
      </p>

      {/* Status flags */}
      {(workflowItem.flags.isExpired ||
        workflowItem.flags.isNearExpiry ||
        workflowItem.flags.isDamaged) && (
          <div className="mt-2 flex gap-2 justify-center">
            {workflowItem.flags.isExpired && (
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                EXPIRED
              </span>
            )}
            {workflowItem.flags.isNearExpiry && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                NEAR EXPIRY
              </span>
            )}
            {workflowItem.flags.isDamaged && (
              <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded">
                DAMAGED
              </span>
            )}
          </div>
        )}
    </div>
  );
}
