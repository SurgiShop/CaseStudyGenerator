"use client";

import { useEffect } from "react";
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
import { useCaseStudy } from "@/context/case-study-context";
import { modules, getUseCasesByModule, getRandomUseCases } from "@/lib/use-cases";

export default function Home() {
  const router = useRouter();
  const {
    selectedUseCases,
    savedCaseStudies,
    isLoaded,
    isLoading,
    loadCaseStudy,
    deleteCaseStudy,
    refreshCaseStudies,
    currentWorkflow,
    replaceSelection,
  } = useCaseStudy();

  const handleRandomCaseStudy = () => {
    const randomIds = getRandomUseCases();
    replaceSelection(randomIds);
    router.push("/generator");
  };

  // Refresh case studies on mount
  useEffect(() => {
    if (isLoaded) {
      refreshCaseStudies();
    }
  }, [isLoaded, refreshCaseStudies]);

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      <Navigation />

      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            ERPNext Case Study Generator
          </h1>
          <p className="text-muted-foreground mt-2 text-base lg:text-lg">
            Create comprehensive test case studies for your ERPNext warehouse
            implementation. Select use cases from each module to build your test
            scenario.
          </p>
        </div>

        {/* Random Case Study Button */}
        <Card className="mb-8 border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Quick Start</h3>
              <p className="text-muted-foreground text-base">
                Generate a case study with randomized use cases from multiple modules
              </p>
            </div>
            <Button
              onClick={handleRandomCaseStudy}
              className="h-12 px-6 text-base touch-manipulation whitespace-nowrap"
              disabled={!isLoaded}
            >
              🎲 Random Case Study
            </Button>
          </CardContent>
        </Card>

        {/* Current Selection Summary */}
        {isLoaded && selectedUseCases.length > 0 && (
          <Card className="mb-8 border-primary/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex flex-wrap items-center gap-3">
                Current Selection
                <Badge className="text-base px-3 py-1">
                  {selectedUseCases.length} use cases
                </Badge>
                {currentWorkflow && (
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {currentWorkflow.items?.length || 0} products
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 mb-5">
                {modules.map((m) => {
                  const { useCases } = getUseCasesByModule(m.id);
                  const count = useCases.filter((uc) =>
                    selectedUseCases.includes(uc.id)
                  ).length;
                  if (count === 0) return null;
                  return (
                    <Badge
                      key={m.id}
                      variant="outline"
                      className="text-base px-3 py-1"
                    >
                      {m.name}: {count}
                    </Badge>
                  );
                })}
              </div>
              <Link href="/generator">
                <Button className="h-12 px-6 text-base touch-manipulation">
                  Generate Case Study
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Module Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {modules.map((module) => {
            const { useCases, categories } = getUseCasesByModule(module.id);
            const selectedCount = isLoaded
              ? useCases.filter((uc) => selectedUseCases.includes(uc.id)).length
              : 0;

            return (
              <Link key={module.id} href={module.href}>
                <Card className="h-full hover:border-primary/50 active:scale-[0.99] transition-all cursor-pointer touch-manipulation">
                  <CardHeader className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">{module.name}</CardTitle>
                      {selectedCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-base px-3 py-1"
                        >
                          {selectedCount}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-base mt-2">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="outline"
                          className="text-sm"
                        >
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-base text-muted-foreground mt-4">
                      {useCases.length} use cases available
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Saved Case Studies */}
        {isLoaded && savedCaseStudies.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl lg:text-2xl font-semibold mb-5">
              Saved Case Studies
            </h2>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {savedCaseStudies.map((study) => (
                <Card key={study.id}>
                  <CardHeader className="pb-3 p-5">
                    <CardTitle className="text-lg">{study.name}</CardTitle>
                    <CardDescription className="text-base">
                      {new Date(study.createdAt).toLocaleDateString()} &bull;{" "}
                      {study.selectedUseCases?.length || 0} use cases
                      {study.workflow?.items && (
                        <> &bull; {study.workflow.items.length} products</>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        className="h-12 px-5 text-base touch-manipulation"
                        onClick={() => loadCaseStudy(study.id)}
                        disabled={isLoading}
                      >
                        Load
                      </Button>
                      <Link href={`/print?id=${study.id}`}>
                        <Button
                          variant="outline"
                          className="h-12 px-5 text-base touch-manipulation"
                        >
                          Print
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="h-12 px-5 text-base touch-manipulation text-destructive"
                        onClick={() => deleteCaseStudy(study.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for saved studies */}
        {isLoaded && savedCaseStudies.length === 0 && (
          <div className="mt-8">
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground mb-2 text-lg">
                  No saved case studies yet
                </p>
                <p className="text-base text-muted-foreground">
                  Select use cases from the modules above and generate your
                  first case study.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
