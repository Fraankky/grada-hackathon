"use client";

import { useState, useEffect } from "react";

import StepUpload from "@/components/platform/StepUpload";
import StepResult from "@/components/platform/StepResult";
import StepBusiness from "@/components/platform/StepBusiness";
import { BusinessWizardProvider } from "@/context/BusinessWizardContext";

export default function PlatformPage() {
  const [step, setStep] = useState("upload");
  const [mode, setMode] = useState("business");
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setStep("business");
  };

  const handleBackToUpload = () => {
    setStep("upload");
    setAnalysisData(null);
    setSelectedCategory("");
  };

  return (
    <main className="min-h-screen bg-white text-slate-900 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4 py-8">
        <BusinessWizardProvider>
          <PlatformContent
            step={step}
            setStep={setStep}
            mode={mode}
            analysisData={analysisData}
            onSelectCategory={handleSelectCategory}
            onBackToUpload={handleBackToUpload}
          />
        </BusinessWizardProvider>
      </div>
    </main>
  );
}

function PlatformContent({
  step,
  setStep,
  mode,
  analysisData,
  onSelectCategory,
  onBackToUpload,
}) {

  if (step === "upload") {
    return <StepUpload />;
  }

  if (step === "result") {
    return (
      <StepResult
        result={{
          vibe: mode === "crypto" ? "Crypto Enthusiast" : "Business Innovator",
          description: `Analisis profil Anda menunjukkan ${
            mode === "crypto"
              ? "strategi kuat untuk investasi cryptocurrency"
              : "potensi entrepreneurial untuk peluang bisnis"
          }. Berdasarkan skill dan pengalaman Anda, berikut rekomendasi yang disesuaikan.`,
          mode,
        }}
        analysisData={analysisData}
        onSelectCategory={onSelectCategory}
        onBack={onBackToUpload}
      />
    );
  }

  if (step === "business") {
    return <StepBusiness />;
  }

  return null;
}
