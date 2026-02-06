"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCaseStudy } from "@/context/case-study-context";
import { modules } from "@/lib/use-cases";

export function Navigation() {
  const pathname = usePathname();
  const { getSelectionCount, isLoaded } = useCaseStudy();
  const count = isLoaded ? getSelectionCount() : 0;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Mobile menu button */}
              <button
                className="lg:hidden p-3 -ml-3 touch-manipulation"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
              <Link href="/" className="font-bold text-xl">
                ERP Case Study
              </Link>
              <div className="hidden lg:flex items-center gap-2">
                {modules.map((module) => (
                  <Link key={module.id} href={module.href}>
                    <Button
                      variant={pathname === module.href ? "secondary" : "ghost"}
                      className="text-base px-4 py-2 h-11 touch-manipulation"
                    >
                      {module.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {count > 0 && (
                <Badge
                  variant="secondary"
                  className="font-normal text-base px-3 py-1"
                >
                  {count} selected
                </Badge>
              )}
              <Link href="/generator">
                <Button className="h-11 px-5 text-base touch-manipulation">
                  Generate
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu panel */}
          <div className="absolute top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-background shadow-xl">
            <div className="p-4 border-b">
              <h2 className="font-bold text-xl">Modules</h2>
            </div>
            <div className="p-2">
              {modules.map((module) => (
                <Link
                  key={module.id}
                  href={module.href}
                  onClick={() => setMenuOpen(false)}
                >
                  <Button
                    variant={pathname === module.href ? "secondary" : "ghost"}
                    className="w-full justify-start text-lg h-14 px-4 mb-1 touch-manipulation"
                  >
                    <span className="mr-3 text-xl">{module.icon || "📦"}</span>
                    {module.name}
                  </Button>
                </Link>
              ))}
              <div className="border-t mt-4 pt-4">
                <Link href="/" onClick={() => setMenuOpen(false)}>
                  <Button
                    variant={pathname === "/" ? "secondary" : "ghost"}
                    className="w-full justify-start text-lg h-14 px-4 touch-manipulation"
                  >
                    <span className="mr-3 text-xl">🏠</span>
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { getSelectionCount, isLoaded } = useCaseStudy();
  const count = isLoaded ? getSelectionCount() : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background lg:hidden z-50 safe-area-inset-bottom">
      <div className="grid grid-cols-4 gap-1 p-2 pb-safe">
        <Link href="/">
          <Button
            variant={pathname === "/" ? "secondary" : "ghost"}
            className="w-full h-14 flex-col gap-1 text-xs px-1 touch-manipulation"
          >
            <span className="text-lg">🏠</span>
            Home
          </Button>
        </Link>
        <Link href="/inbound">
          <Button
            variant={pathname === "/inbound" ? "secondary" : "ghost"}
            className="w-full h-14 flex-col gap-1 text-xs px-1 touch-manipulation"
          >
            <span className="text-lg">📥</span>
            Inbound
          </Button>
        </Link>
        <Link href="/sales">
          <Button
            variant={pathname === "/sales" ? "secondary" : "ghost"}
            className="w-full h-14 flex-col gap-1 text-xs px-1 touch-manipulation"
          >
            <span className="text-lg">💰</span>
            Sales
          </Button>
        </Link>
        <Link href="/generator">
          <Button
            variant={pathname === "/generator" ? "secondary" : "ghost"}
            className="w-full h-14 flex-col gap-1 text-xs px-1 touch-manipulation relative"
          >
            <span className="text-lg">📝</span>
            Generate
            {count > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </div>
  );
}
