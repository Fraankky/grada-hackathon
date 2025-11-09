"use client";

<<<<<<< HEAD
import { Suspense, useEffect } from "react";
=======
import { useEffect, Suspense } from "react";
>>>>>>> 1e40848 (build)
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
<<<<<<< HEAD
      <Suspense fallback={
        <main className="min-h-screen bg-white text-slate-100 flex items-center justify-center">
          <div className="w-full max-w-4xl px-4 py-8">
            <div className="text-center">Loading...</div>
          </div>
        </main>
      }>
=======
      <Suspense fallback={<div>Loading...</div>}>
>>>>>>> 1e40848 (build)
        <BusinessWizardContent />
      </Suspense>
    </BusinessWizardProvider>
  );
}