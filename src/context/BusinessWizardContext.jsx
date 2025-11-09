// context/BusinessWizardContext.jsx
"use client";

import { createContext, useContext, useState } from "react";

const BusinessWizardContext = createContext();

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
        mode,           // ← TAMBAHKAN INI
        setMode,        // ← TAMBAHKAN INI
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