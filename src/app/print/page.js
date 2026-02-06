"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PrintDocument } from "@/components/print-document";
import { useCaseStudy } from "@/context/case-study-context";
import Link from "next/link";

function PrintContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const {
    savedCaseStudies,
    selectedUseCases,
    currentWorkflow,
    isLoaded,
    loadCaseStudy,
  } = useCaseStudy();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        if (id) {
          // Try to load from API first
          const response = await fetch(`/api/case-studies/${id}`);
          if (response.ok) {
            const data = await response.json();
            setCaseStudy(data);
          } else {
            // Fallback to local state
            const found = savedCaseStudies.find((s) => s.id === id);
            if (found) {
              setCaseStudy(found);
            } else {
              setError("Case study not found");
            }
          }
        } else if (isLoaded && selectedUseCases.length > 0) {
          // Create a temporary case study from current selection
          setCaseStudy({
            id: "preview",
            name: "Preview",
            createdAt: new Date().toISOString(),
            selectedUseCases: selectedUseCases,
            workflow: currentWorkflow,
            customNotes: "",
          });
        }
      } catch (e) {
        console.error("Error loading case study:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      load();
    }
  }, [isLoaded, id, savedCaseStudies, selectedUseCases, currentWorkflow]);

  const handlePrint = () => {
    window.print();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!caseStudy) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">No Case Study</h1>
          <p className="text-muted-foreground mb-4">
            Select use cases and generate a case study first.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Print Controls - hidden when printing */}
      <div className="print:hidden sticky top-0 bg-white border-b p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Back
            </Button>
          </Link>
          <h1 className="font-medium">{caseStudy.name}</h1>
          {caseStudy.workflow && (
            <span className="text-sm text-muted-foreground">
              {caseStudy.workflow.items?.length || 0} products
            </span>
          )}
        </div>
        <Button onClick={handlePrint}>Print / Save as PDF</Button>
      </div>

      {/* Print Preview */}
      <div className="py-8 print:py-0">
        <PrintDocument caseStudy={caseStudy} />
      </div>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading...</p>
        </div>
      }
    >
      <PrintContent />
    </Suspense>
  );
}
