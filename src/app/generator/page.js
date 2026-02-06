"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCaseStudy } from "@/context/case-study-context";
import { modules, getUseCaseById, getUseCasesByModule } from "@/lib/use-cases";
import { ComplexityBadge } from "@/components/complexity-badge";
import { ProductBarcode } from "@/components/barcode-image";

export default function GeneratorPage() {
  const router = useRouter();
  const {
    selectedUseCases,
    currentWorkflow,
    clearSelection,
    deselectUseCase,
    saveCaseStudy,
    regenerateWorkflow,
    isLoaded,
    isLoading,
    error,
  } = useCaseStudy();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [saveError, setSaveError] = useState(null);

  // Group selected use cases by module
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

  const handleSaveAndPrint = async () => {
    if (!name.trim()) {
      setSaveError("Please enter a case study name");
      return;
    }
    setSaveError(null);

    try {
      const saved = await saveCaseStudy(name, notes);
      router.push(`/print?id=${saved.id}`);
    } catch (e) {
      setSaveError(e.message || "Failed to save case study");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveError("Please enter a case study name");
      return;
    }
    setSaveError(null);

    try {
      await saveCaseStudy(name, notes);
      alert("Case study saved!");
    } catch (e) {
      setSaveError(e.message || "Failed to save case study");
    }
  };

  const handleRegenerateWorkflow = () => {
    regenerateWorkflow();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  if (selectedUseCases.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle className="text-xl">No Use Cases Selected</CardTitle>
              <CardDescription className="text-base">
                Select use cases from the modules to generate a case study.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {modules.map((m) => (
                  <Link key={m.id} href={m.href}>
                    <Button
                      variant="outline"
                      className="w-full h-14 text-base touch-manipulation"
                    >
                      {m.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      <Navigation />

      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Generate Case Study
            </h1>
            <p className="text-muted-foreground text-base lg:text-lg">
              Review your selections, preview test data, and save or print your
              case study.
            </p>
          </div>

          {/* Error Display */}
          {(error || saveError) && (
            <Card className="mb-6 border-destructive">
              <CardContent className="pt-4">
                <p className="text-destructive text-base">
                  {error || saveError}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Case Study Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Case Study Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="block text-base font-medium mb-2">
                  Case Study Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Full Warehouse Cycle Test"
                  className="w-full px-4 py-3 text-base border rounded-lg bg-background touch-manipulation"
                />
              </div>
              <div>
                <label className="block text-base font-medium mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions or focus areas..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg bg-background resize-none touch-manipulation"
                />
              </div>
            </CardContent>
          </Card>

          {/* Workflow Items Preview */}
          {currentWorkflow && (
            <Card className="mb-6">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">Test Data Preview</CardTitle>
                    <CardDescription className="text-base">
                      These products will be used throughout the test. Barcodes
                      are scannable.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="h-12 px-5 text-base touch-manipulation"
                    onClick={handleRegenerateWorkflow}
                  >
                    Regenerate Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {currentWorkflow.items.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {currentWorkflow.summary.totalInboundQty}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Inbound Units
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {currentWorkflow.summary.totalSalesQty}
                    </p>
                    <p className="text-xs text-muted-foreground">Sales Units</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-2xl font-bold">
                      {currentWorkflow.items.reduce(
                        (sum, i) => sum + i.quantities.returns,
                        0
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Return Units
                    </p>
                  </div>
                </div>

                {/* Value Summary */}
                {currentWorkflow.summary.totalInboundValue && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        ${currentWorkflow.summary.totalInboundValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">Inbound Value</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-lg font-bold text-green-700 dark:text-green-300">
                        ${currentWorkflow.summary.totalSalesValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">Sales Value</p>
                    </div>
                    <div className={`text-center p-3 rounded-lg border ${currentWorkflow.summary.expectedProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'}`}>
                      <p className={`text-lg font-bold ${currentWorkflow.summary.expectedProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
                        {currentWorkflow.summary.expectedProfit >= 0 ? '+' : ''}${currentWorkflow.summary.expectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs ${currentWorkflow.summary.expectedProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>Expected Profit</p>
                    </div>
                  </div>
                )}

                {/* Flags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentWorkflow.summary.hasExpiredItems && (
                    <Badge variant="destructive">Includes Expired Items</Badge>
                  )}
                  {currentWorkflow.summary.hasNearExpiryItems && (
                    <Badge
                      variant="outline"
                      className="border-yellow-500 text-yellow-700"
                    >
                      Includes Near-Expiry Items
                    </Badge>
                  )}
                  {currentWorkflow.summary.hasDamagedItems && (
                    <Badge
                      variant="outline"
                      className="border-orange-500 text-orange-700"
                    >
                      Includes Damaged Items
                    </Badge>
                  )}
                </div>

                {/* Product Cards with Barcodes */}
                <div className="space-y-4">
                  {currentWorkflow.items.map((item, index) => (
                    <ProductBarcode key={item.id} workflowItem={item} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Selected Use Cases</CardTitle>
                <Badge className="text-base px-3 py-1">
                  {selectedUseCases.length} total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-5">
                {Object.keys(groupedUseCases).map((moduleId) => {
                  const moduleInfo = modules.find((m) => m.id === moduleId);
                  return (
                    <Badge
                      key={moduleId}
                      variant="outline"
                      className="text-base px-3 py-1"
                    >
                      {moduleInfo?.name}: {groupedUseCases[moduleId].length}
                    </Badge>
                  );
                })}
              </div>
              <Button
                variant="outline"
                className="h-12 px-5 text-base touch-manipulation"
                onClick={clearSelection}
              >
                Clear All
              </Button>
            </CardContent>
          </Card>

          {/* Use Cases by Module */}
          {Object.entries(groupedUseCases).map(([moduleId, useCases]) => {
            const moduleInfo = modules.find((m) => m.id === moduleId);
            return (
              <Card key={moduleId} className="mb-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{moduleInfo?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {useCases.map((uc) => (
                      <div
                        key={uc.id}
                        className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                      >
                        <div className="flex items-center gap-4">
                          <ComplexityBadge
                            complexity={uc.complexity}
                            className="text-sm px-3 py-1"
                          />
                          <div>
                            <p className="font-medium text-base">{uc.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {uc.testSteps.length} steps
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="h-12 px-4 text-base touch-manipulation text-muted-foreground hover:text-destructive"
                          onClick={() => deselectUseCase(uc.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Separator className="my-8" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              variant="outline"
              className="h-14 px-8 text-lg touch-manipulation"
              onClick={handleSave}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? "Saving..." : "Save Only"}
            </Button>
            <Button
              className="h-14 px-8 text-lg touch-manipulation"
              onClick={handleSaveAndPrint}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? "Saving..." : "Save & Print"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
