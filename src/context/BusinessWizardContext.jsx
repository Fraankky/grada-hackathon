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
  const [userUuid, setUserUuid] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [mode, setMode] = useState(null); // ← TAMBAHKAN INI
  
  // Data analyze
  const [financialAnalysis, setFinancialAnalysis] = useState(null);
  const [businessTrends, setBusinessTrends] = useState([]);
  const [trendsSummary, setTrendsSummary] = useState("");
  const [categorizedTrends, setCategorizedTrends] = useState({});
  const [validationSummary, setValidationSummary] = useState(null);

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
        cartItems,
        setCartItems,
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