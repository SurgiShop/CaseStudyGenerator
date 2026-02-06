"use client";

import { Navigation } from "@/components/navigation";
import { UseCaseCard } from "@/components/use-case-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCaseStudy } from "@/context/case-study-context";
import Link from "next/link";

export function ModulePage({
  moduleId,
  moduleName,
  description,
  useCases,
  categories,
}) {
  const {
    isSelected,
    toggleUseCase,
    selectAllInCategory,
    deselectAllInCategory,
    selectedUseCases,
    isLoaded,
  } = useCaseStudy();

  const getUseCasesForCategory = (categoryId) => {
    return useCases.filter((uc) => uc.category === categoryId);
  };

  const getCategorySelectionCount = (categoryId) => {
    const categoryUseCases = getUseCasesForCategory(categoryId);
    return categoryUseCases.filter((uc) => selectedUseCases.includes(uc.id))
      .length;
  };

  const handleSelectAll = (categoryId) => {
    const categoryUseCaseIds = getUseCasesForCategory(categoryId).map(
      (uc) => uc.id
    );
    selectAllInCategory(categoryUseCaseIds);
  };

  const handleDeselectAll = (categoryId) => {
    const categoryUseCaseIds = getUseCasesForCategory(categoryId).map(
      (uc) => uc.id
    );
    deselectAllInCategory(categoryUseCaseIds);
  };

  const totalSelected = useCases.filter((uc) =>
    selectedUseCases.includes(uc.id)
  ).length;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      <Navigation />

      <main className="container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {moduleName}
            </h1>
            {isLoaded && totalSelected > 0 && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                {totalSelected} selected
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground text-base lg:text-lg">
            {description}
          </p>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue={categories[0]?.id} className="w-full">
          <TabsList className="mb-6 flex-wrap h-auto gap-2 p-2">
            {categories.map((category) => {
              const count = getCategorySelectionCount(category.id);
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="relative text-base px-4 py-3 h-12 touch-manipulation"
                >
                  {category.name}
                  {count > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-6 px-2 text-sm"
                    >
                      {count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => {
            const categoryUseCases = getUseCasesForCategory(category.id);
            const allSelected = categoryUseCases.every((uc) =>
              selectedUseCases.includes(uc.id)
            );
            const someSelected = categoryUseCases.some((uc) =>
              selectedUseCases.includes(uc.id)
            );

            return (
              <TabsContent key={category.id} value={category.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">{category.name}</h2>
                    <p className="text-base text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="h-12 px-6 text-base touch-manipulation"
                      onClick={() => handleSelectAll(category.id)}
                      disabled={allSelected}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-6 text-base touch-manipulation"
                      onClick={() => handleDeselectAll(category.id)}
                      disabled={!someSelected}
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {categoryUseCases.map((useCase) => (
                    <UseCaseCard
                      key={useCase.id}
                      useCase={useCase}
                      isSelected={isLoaded && isSelected(useCase.id)}
                      onToggle={() => toggleUseCase(useCase.id)}
                    />
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Floating Action - positioned above mobile nav */}
        {isLoaded && totalSelected > 0 && (
          <div className="fixed bottom-24 lg:bottom-8 right-4 lg:right-8 z-40">
            <Link href="/generator">
              <Button
                size="lg"
                className="shadow-lg h-14 px-8 text-lg touch-manipulation"
              >
                Generate ({selectedUseCases.length})
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
