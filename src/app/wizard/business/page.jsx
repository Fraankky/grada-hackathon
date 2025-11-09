"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BusinessWizardProvider, useBusinessWizard } from "@/context/BusinessWizardContext";
import StepBusiness from "@/components/platform/StepBusiness";

function BusinessWizardContent() {
  const searchParams = useSearchParams();
  const { setUserUuid } = useBusinessWizard();

  useEffect(() => {
    const userUuid = searchParams.get("userUuid");
    if (userUuid) {
      setUserUuid(userUuid);
    }
  }, [searchParams, setUserUuid]);

  return (
    <main className="min-h-screen bg-white text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-4xl px-4 py-8">
        <StepBusiness />
      </div>
    </main>
  );
}

export default function BusinessWizardPage() {
  return (
    <BusinessWizardProvider>
      <BusinessWizardContent />
    </BusinessWizardProvider>
  );
}