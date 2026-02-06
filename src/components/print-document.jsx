"use client";

import { getUseCaseById, modules } from "@/lib/use-cases";
import { PrintBarcode, BarcodeImage } from "@/components/barcode-image";

// Helper to get raw barcode data (remove parentheses from GS1 string)
const getRawBarcodeData = (gs1String) => {
  if (!gs1String) return "";
  return gs1String.replace(/[()]/g, "");
};

export function PrintDocument({ caseStudy }) {
  const { name, selectedUseCases, workflow, customNotes, createdAt } =
    caseStudy;

  // Group use cases by module
  const groupedUseCases = {};
  selectedUseCases.forEach((ucId) => {
    const uc = getUseCaseById(ucId);
    if (uc) {
      if (!groupedUseCases[uc.module]) {
        groupedUseCases[uc.module] = [];
      }
      groupedUseCases[uc.module].push(uc);
    }
  });

  // Get workflow items or empty array
  const workflowItems = workflow?.items || [];

  return (
    <div className="print-document bg-white text-black p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">ERPNext Implementation Test</h1>
            <h2 className="text-xl mt-1">{name || "Case Study"}</h2>
          </div>
          <div className="text-right text-sm">
            <p>
              <strong>Date:</strong> {new Date(createdAt).toLocaleDateString()}
            </p>
            <p>
              <strong>ID:</strong> {caseStudy.id}
            </p>
          </div>
        </div>
      </header>

      {/* Test Summary */}
      <section className="mb-6">
        <h3 className="text-lg font-bold border-b pb-1 mb-3">Test Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Modules Covered:</strong>
            </p>
            <p className="text-gray-600">
              {Object.keys(groupedUseCases)
                .map((m) => modules.find((mod) => mod.id === m)?.name || m)
                .join(", ")}
            </p>
          </div>
          <div>
            <p>
              <strong>Total Scenarios:</strong> {selectedUseCases.length}
            </p>
            <p>
              <strong>Products:</strong> {workflowItems.length}
            </p>
          </div>
        </div>
        {customNotes && (
          <div className="mt-3 p-3 bg-gray-100 rounded">
            <p className="text-sm">
              <strong>Notes:</strong> {customNotes}
            </p>
          </div>
        )}
      </section>

      {/* Test Data Section - Products & Barcodes */}
      {workflowItems.length > 0 && (
        <section className="mb-8 page-break-after">
          <h3 className="text-lg font-bold border-b-2 border-black pb-1 mb-4">
            TEST DATA - Products & Barcodes
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These products flow through the entire test. Cut out barcodes or
            scan directly from this sheet.
          </p>

          <div className="space-y-6">
            {workflowItems.map((item, index) => (
              <PrintBarcode key={item.id} workflowItem={item} index={index} />
            ))}
          </div>

          {/* Quantity Flow Summary */}
          <div className="mt-6 p-4 bg-gray-50 border rounded">
            <h4 className="font-bold mb-2">Quantity & Pricing Summary</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Product</th>
                  <th className="text-right py-1">In</th>
                  <th className="text-right py-1">Out</th>
                  <th className="text-right py-1">Cost/Unit</th>
                  <th className="text-right py-1">Price/Unit</th>
                  <th className="text-right py-1">Margin</th>
                </tr>
              </thead>
              <tbody>
                {workflowItems.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-1">{item.product.ref}</td>
                    <td className="text-right py-1">
                      {item.quantities.inbound}
                    </td>
                    <td className="text-right py-1">{item.quantities.sales}</td>
                    <td className="text-right py-1">
                      {item.pricing ? `$${item.pricing.inboundUnitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="text-right py-1">
                      {item.pricing ? `$${item.pricing.outboundUnitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className={`text-right py-1 ${item.pricing?.profitMargin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {item.pricing ? `${item.pricing.profitMargin >= 0 ? '+' : ''}${item.pricing.profitMargin.toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="font-bold border-t-2">
                  <td className="py-1">TOTAL</td>
                  <td className="text-right py-1">
                    {workflowItems.reduce(
                      (sum, i) => sum + i.quantities.inbound,
                      0
                    )}
                  </td>
                  <td className="text-right py-1">
                    {workflowItems.reduce(
                      (sum, i) => sum + i.quantities.sales,
                      0
                    )}
                  </td>
                  <td className="text-right py-1" colSpan="2">
                    Total Value: ${workflowItems.reduce(
                      (sum, i) => sum + (i.quantities.inbound * (i.pricing?.inboundUnitPrice || 0)),
                      0
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-1">
                    ${workflowItems.reduce(
                      (sum, i) => sum + (i.quantities.sales * (i.pricing?.outboundUnitPrice || 0)),
                      0
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* INBOUND SCAN SHEET */}
      {workflowItems.length > 0 &&
        workflowItems.some((item) => item.quantities.inbound > 0) && (
          <section className="mb-6 page-break-before">
            <h3 className="text-lg font-bold border-b-2 border-black pb-1 mb-2">
              INBOUND SCAN SHEET
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Scan each barcode the number of times indicated.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {workflowItems
                .filter((item) => item.quantities.inbound > 0)
                .map((item) => (
                  <div
                    key={`inbound-${item.id}`}
                    className="border border-blue-300 rounded page-break-inside-avoid"
                  >
                    <div className="bg-blue-100 px-2 py-1 border-b border-blue-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs">
                            {item.product.ref}
                          </p>
                          <p className="text-[10px] text-gray-700">
                            {item.lot} | {item.expiry}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-blue-800">
                          ×{item.quantities.inbound}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      <div className="flex justify-center">
                        <BarcodeImage
                          gs1Data={item.gs1String}
                          scale={1}
                          height={8}
                        />
                      </div>
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {Array.from({ length: Math.min(item.quantities.inbound, 10) }).map(
                          (_, i) => (
                            <span
                              key={i}
                              className="inline-block w-3 h-3 border border-gray-400 rounded-sm bg-white"
                              title={`Scan ${i + 1}`}
                            ></span>
                          )
                        )}
                        {item.quantities.inbound > 10 && (
                          <span className="text-[10px] text-gray-500">+{item.quantities.inbound - 10}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* OUTBOUND SCAN SHEET */}
      {workflowItems.length > 0 &&
        workflowItems.some((item) => item.quantities.picking > 0) && (
          <section className="mb-6 page-break-before">
            <h3 className="text-lg font-bold border-b-2 border-black pb-1 mb-2">
              OUTBOUND SCAN SHEET
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Scan each barcode the number of times indicated.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {workflowItems
                .filter((item) => item.quantities.picking > 0)
                .map((item) => (
                  <div
                    key={`outbound-${item.id}`}
                    className="border border-green-300 rounded page-break-inside-avoid"
                  >
                    <div className="bg-green-100 px-2 py-1 border-b border-green-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs">
                            {item.product.ref}
                          </p>
                          <p className="text-[10px] text-gray-700">
                            {item.lot} | {item.expiry}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-green-800">
                          ×{item.quantities.picking}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      <div className="flex justify-center">
                        <BarcodeImage
                          gs1Data={item.gs1String}
                          scale={1}
                          height={8}
                        />
                      </div>
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {Array.from({ length: Math.min(item.quantities.picking, 10) }).map(
                          (_, i) => (
                            <span
                              key={i}
                              className="inline-block w-3 h-3 border border-gray-400 rounded-sm bg-white"
                              title={`Scan ${i + 1}`}
                            ></span>
                          )
                        )}
                        {item.quantities.picking > 10 && (
                          <span className="text-[10px] text-gray-500">+{item.quantities.picking - 10}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* RETURNS SCAN SHEET */}
      {workflowItems.length > 0 &&
        workflowItems.some((item) => item.quantities.returns > 0) && (
          <section className="mb-6 page-break-before">
            <h3 className="text-lg font-bold border-b-2 border-black pb-1 mb-2">
              RETURNS SCAN SHEET
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Scan each barcode the number of times indicated.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {workflowItems
                .filter((item) => item.quantities.returns > 0)
                .map((item) => (
                  <div
                    key={`returns-${item.id}`}
                    className="border border-orange-300 rounded page-break-inside-avoid"
                  >
                    <div className="bg-orange-100 px-2 py-1 border-b border-orange-300">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs">
                            {item.product.ref}
                          </p>
                          <p className="text-[10px] text-gray-700">
                            {item.lot} | {item.expiry}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-orange-800">
                          ×{item.quantities.returns}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 bg-white">
                      <div className="flex justify-center">
                        <BarcodeImage
                          gs1Data={item.gs1String}
                          scale={1}
                          height={8}
                        />
                      </div>
                      <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                        {Array.from({ length: Math.min(item.quantities.returns, 10) }).map(
                          (_, i) => (
                            <span
                              key={i}
                              className="inline-block w-3 h-3 border border-gray-400 rounded-sm bg-white"
                              title={`Scan ${i + 1}`}
                            ></span>
                          )
                        )}
                        {item.quantities.returns > 10 && (
                          <span className="text-[10px] text-gray-500">+{item.quantities.returns - 10}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

      {/* Use Cases by Module */}
      {Object.entries(groupedUseCases).map(([moduleId, useCases]) => {
        const moduleInfo = modules.find((m) => m.id === moduleId);

        // Get relevant workflow items for this module
        const moduleItems = workflowItems.filter((item) => {
          switch (moduleId) {
            case "inbound":
              return item.quantities.inbound > 0;
            case "sales":
              return item.quantities.sales > 0 && !item.flags.isExpired;
            case "accounting":
              return item.quantities.sales > 0;
            case "picking":
              return item.quantities.picking > 0 && !item.flags.isExpired;
            case "rma":
              return item.quantities.returns > 0 || item.quantities.sales > 0;
            case "expired-damaged":
              return item.flags.isExpired || item.flags.isDamaged;
            default:
              return true;
          }
        });

        return (
          <section key={moduleId} className="mb-8 page-break-inside-avoid">
            <h3 className="text-lg font-bold border-b-2 border-black pb-1 mb-4">
              {moduleInfo?.name || moduleId}
            </h3>

            {/* Products for this module */}
            {moduleItems.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded">
                <p className="text-sm font-medium mb-2">
                  Products for this module:
                </p>
                <div className="flex flex-wrap gap-2">
                  {moduleItems.map((item) => (
                    <span
                      key={item.id}
                      className="text-xs px-2 py-1 bg-white rounded border"
                    >
                      {item.product.ref} (Lot: {item.lot})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {useCases.map((uc, index) => {
              // Get a relevant workflow item for this use case
              const relevantItem =
                moduleItems[index % moduleItems.length] || moduleItems[0];

              return (
                <div
                  key={uc.id}
                  className="mb-6 p-4 border rounded page-break-inside-avoid"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold">
                        {index + 1}. {uc.title}
                      </h4>
                      <p className="text-sm text-gray-600">{uc.description}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded ${uc.complexity === "basic"
                        ? "bg-green-100"
                        : uc.complexity === "medium"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                        }`}
                    >
                      {uc.complexity.toUpperCase()}
                    </span>
                  </div>

                  {/* Test Steps */}
                  <div className="mb-4">
                    <h5 className="font-medium text-sm mb-2">Test Steps:</h5>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      {uc.testSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="inline-block w-4 h-4 border border-gray-400 rounded-sm flex-shrink-0 mt-0.5"></span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Inline Barcode for scanning steps */}
                  {relevantItem &&
                    (uc.module === "inbound" || uc.module === "picking") && (
                      <div className="mb-3 p-2 bg-gray-50 rounded">
                        <h5 className="font-medium text-xs mb-1">
                          Scan this barcode:
                        </h5>
                        <div className="flex justify-center bg-white p-2 rounded">
                          <BarcodeImage
                            gs1Data={relevantItem.gs1String}
                            scale={1}
                            height={10}
                          />
                        </div>
                        <p className="text-xs text-center mt-1 font-mono text-gray-600">
                          {relevantItem.product.ref} | {relevantItem.lot}
                        </p>
                      </div>
                    )}

                  {/* Expected Outcome */}
                  <div className="p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-sm">Expected Outcome:</h5>
                    <p className="text-sm">{uc.expectedOutcome}</p>
                  </div>

                  {/* Result checkbox */}
                  <div className="mt-3 pt-3 border-t flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border border-gray-400 rounded-sm"></span>
                      Pass
                    </label>
                    <label className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border border-gray-400 rounded-sm"></span>
                      Fail
                    </label>
                    <div className="flex-1">
                      <span className="text-gray-600">Notes: </span>
                      <span className="border-b border-gray-400 inline-block w-48"></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}

      {/* Footer */}
      <footer className="mt-8 pt-4 border-t text-sm text-gray-600">
        <div className="flex justify-between">
          <div>
            <p>
              <strong>Tester Name:</strong> _________________________
            </p>
            <p className="mt-2">
              <strong>Date Completed:</strong> _____________
            </p>
          </div>
          <div>
            <p>
              <strong>Signature:</strong> _________________________
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
