"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { generateWorkflow } from "@/lib/workflow-generator";

const CaseStudyContext = createContext(null);

// localStorage key for current selection (not persisted to server until saved)
const SELECTION_KEY = "erp-case-study-selection";

export function CaseStudyProvider({ children }) {
  const [selectedUseCases, setSelectedUseCases] = useState([]);
  const [savedCaseStudies, setSavedCaseStudies] = useState([]);
  const [currentCaseStudy, setCurrentCaseStudy] = useState(null);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved case studies from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load current selection from localStorage
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem(SELECTION_KEY);
          if (stored) {
            const selection = JSON.parse(stored);
            setSelectedUseCases(selection.selectedUseCases || []);
          }
        }

        // Load saved case studies from API
        const response = await fetch("/api/case-studies");
        if (response.ok) {
          const data = await response.json();
          setSavedCaseStudies(data);
        }
      } catch (e) {
        console.error("Error loading data:", e);
        setError(e.message);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save current selection to localStorage when it changes
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem(
        SELECTION_KEY,
        JSON.stringify({
          selectedUseCases,
        })
      );
    }
  }, [selectedUseCases, isLoaded]);

  // Regenerate workflow when selection changes
  useEffect(() => {
    if (selectedUseCases.length > 0) {
      const workflow = generateWorkflow(selectedUseCases);
      setCurrentWorkflow(workflow);
    } else {
      setCurrentWorkflow(null);
    }
  }, [selectedUseCases]);

  const toggleUseCase = useCallback((useCaseId) => {
    setSelectedUseCases((prev) => {
      if (prev.includes(useCaseId)) {
        return prev.filter((id) => id !== useCaseId);
      }
      return [...prev, useCaseId];
    });
  }, []);

  const selectUseCase = useCallback((useCaseId) => {
    setSelectedUseCases((prev) => {
      if (!prev.includes(useCaseId)) {
        return [...prev, useCaseId];
      }
      return prev;
    });
  }, []);

  const deselectUseCase = useCallback((useCaseId) => {
    setSelectedUseCases((prev) => prev.filter((id) => id !== useCaseId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedUseCases([]);
    setCurrentWorkflow(null);
  }, []);

  const replaceSelection = useCallback((useCaseIds) => {
    setSelectedUseCases(useCaseIds);
  }, []);


  const selectAllInCategory = useCallback((useCaseIds) => {
    setSelectedUseCases((prev) => {
      const newIds = useCaseIds.filter((id) => !prev.includes(id));
      return [...prev, ...newIds];
    });
  }, []);

  const deselectAllInCategory = useCallback((useCaseIds) => {
    setSelectedUseCases((prev) =>
      prev.filter((id) => !useCaseIds.includes(id))
    );
  }, []);

  /**
   * Regenerate workflow with fresh random data
   */
  const regenerateWorkflow = useCallback(() => {
    if (selectedUseCases.length > 0) {
      const workflow = generateWorkflow(selectedUseCases);
      setCurrentWorkflow(workflow);
      return workflow;
    }
    return null;
  }, [selectedUseCases]);

  /**
   * Save case study to server
   */
  const saveCaseStudy = useCallback(
    async (name, customNotes = "") => {
      setIsLoading(true);
      setError(null);

      try {
        // Generate fresh workflow for saving
        const workflow = generateWorkflow(selectedUseCases);

        const id = `cs-${Date.now()}`;
        const newCaseStudy = {
          id,
          name,
          createdAt: new Date().toISOString(),
          selectedUseCases: [...selectedUseCases],
          workflow,
          customNotes,
        };

        const response = await fetch("/api/case-studies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCaseStudy),
        });

        if (!response.ok) {
          throw new Error("Failed to save case study");
        }

        const saved = await response.json();
        setSavedCaseStudies((prev) => [...prev, saved]);
        setCurrentCaseStudy(saved);
        setCurrentWorkflow(saved.workflow);

        return saved;
      } catch (e) {
        console.error("Error saving case study:", e);
        setError(e.message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [selectedUseCases]
  );

  /**
   * Load a saved case study
   */
  const loadCaseStudy = useCallback(
    async (caseStudyId) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/case-studies/${caseStudyId}`);
        if (!response.ok) {
          throw new Error("Failed to load case study");
        }

        const study = await response.json();
        setSelectedUseCases(study.selectedUseCases || []);
        setCurrentCaseStudy(study);
        setCurrentWorkflow(study.workflow || null);

        return study;
      } catch (e) {
        console.error("Error loading case study:", e);
        setError(e.message);
        // Fallback to local data
        const study = savedCaseStudies.find((s) => s.id === caseStudyId);
        if (study) {
          setSelectedUseCases(study.selectedUseCases || []);
          setCurrentCaseStudy(study);
          setCurrentWorkflow(study.workflow || null);
          return study;
        }
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [savedCaseStudies]
  );

  /**
   * Delete a case study from server
   */
  const deleteCaseStudy = useCallback(
    async (caseStudyId) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/case-studies/${caseStudyId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete case study");
        }

        setSavedCaseStudies((prev) => prev.filter((s) => s.id !== caseStudyId));
        if (currentCaseStudy?.id === caseStudyId) {
          setCurrentCaseStudy(null);
        }
      } catch (e) {
        console.error("Error deleting case study:", e);
        setError(e.message);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [currentCaseStudy]
  );

  /**
   * Refresh case studies from server
   */
  const refreshCaseStudies = useCallback(async () => {
    try {
      const response = await fetch("/api/case-studies");
      if (response.ok) {
        const data = await response.json();
        setSavedCaseStudies(data);
      }
    } catch (e) {
      console.error("Error refreshing case studies:", e);
    }
  }, []);

  const isSelected = useCallback(
    (useCaseId) => {
      return selectedUseCases.includes(useCaseId);
    },
    [selectedUseCases]
  );

  const getSelectionCount = useCallback(() => {
    return selectedUseCases.length;
  }, [selectedUseCases]);

  const value = {
    // Selection state
    selectedUseCases,
    currentWorkflow,

    // Saved data
    savedCaseStudies,
    currentCaseStudy,

    // Loading states
    isLoaded,
    isLoading,
    error,

    // Selection actions
    toggleUseCase,
    selectUseCase,
    deselectUseCase,
    clearSelection,
    replaceSelection,
    selectAllInCategory,
    deselectAllInCategory,

    // Workflow actions
    regenerateWorkflow,

    // CRUD actions
    saveCaseStudy,
    loadCaseStudy,
    deleteCaseStudy,
    refreshCaseStudies,

    // Utilities
    isSelected,
    getSelectionCount,
    setCurrentCaseStudy,
  };

  return (
    <CaseStudyContext.Provider value={value}>
      {children}
    </CaseStudyContext.Provider>
  );
}

export function useCaseStudy() {
  const context = useContext(CaseStudyContext);
  if (!context) {
    throw new Error("useCaseStudy must be used within a CaseStudyProvider");
  }
  return context;
}
