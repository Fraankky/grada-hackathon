// context/BusinessWizardContext.jsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const BusinessWizardContext = createContext();

// Helper functions for localStorage
const STORAGE_KEY = "grada_wizard_data";

function loadFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function BusinessWizardProvider({ children }) {
  // Initialize state with null to ensure server/client match
  const [userUuid, setUserUuidState] = useState(null);
  const [selectedCategory, setSelectedCategoryState] = useState(null);
  const [mode, setModeState] = useState(null);
  
  // Data analyze
  const [financialAnalysis, setFinancialAnalysisState] = useState(null);
  const [businessTrends, setBusinessTrendsState] = useState([]);
  const [trendsSummary, setTrendsSummaryState] = useState("");
  const [categorizedTrends, setCategorizedTrendsState] = useState({});
  const [validationSummary, setValidationSummaryState] = useState(null);

  // Load from localStorage only on client side after hydration
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      if (stored.userUuid) setUserUuidState(stored.userUuid);
      if (stored.selectedCategory) setSelectedCategoryState(stored.selectedCategory);
      if (stored.mode) setModeState(stored.mode);
      if (stored.financialAnalysis) setFinancialAnalysisState(stored.financialAnalysis);
      if (stored.businessTrends) setBusinessTrendsState(stored.businessTrends);
      if (stored.trendsSummary) setTrendsSummaryState(stored.trendsSummary);
      if (stored.categorizedTrends) setCategorizedTrendsState(stored.categorizedTrends);
      if (stored.validationSummary) setValidationSummaryState(stored.validationSummary);
    }
  }, []);

  // Wrapper functions that also save to localStorage
  const setUserUuid = (uuid) => {
    setUserUuidState(uuid);
  };

  const setSelectedCategory = (category) => {
    setSelectedCategoryState(category);
  };

  const setMode = (newMode) => {
    setModeState(newMode);
  };

  const setFinancialAnalysis = (data) => {
    setFinancialAnalysisState(data);
  };

  const setBusinessTrends = (trends) => {
    setBusinessTrendsState(trends);
  };

  const setTrendsSummary = (summary) => {
    setTrendsSummaryState(summary);
  };

  const setCategorizedTrends = (trends) => {
    setCategorizedTrendsState(trends);
  };

  const setValidationSummary = (summary) => {
    setValidationSummaryState(summary);
  };

  // Save to localStorage whenever any state changes
  useEffect(() => {
    saveToStorage({
      userUuid,
      selectedCategory,
      mode,
      financialAnalysis,
      businessTrends,
      trendsSummary,
      categorizedTrends,
      validationSummary,
    });
  }, [userUuid, selectedCategory, mode, financialAnalysis, businessTrends, trendsSummary, categorizedTrends, validationSummary]);

  return (
    <BusinessWizardContext.Provider
      value={{
        userUuid,
        setUserUuid,
        selectedCategory,
        setSelectedCategory,
        mode,
        setMode,
        financialAnalysis,
        setFinancialAnalysis,
        businessTrends,
        setBusinessTrends,
        trendsSummary,
        setTrendsSummary,
        categorizedTrends,
        setCategorizedTrends,
        validationSummary,
        setValidationSummary,
      }}
    >
      {children}
    </BusinessWizardContext.Provider>
  );
}

export function useBusinessWizard() {
  const context = useContext(BusinessWizardContext);
  if (!context) {
    throw new Error("useBusinessWizard must be used within BusinessWizardProvider");
  }
  return context;
}