"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BusinessWizardProvider, useBusinessWizard } from "@/context/BusinessWizardContext";
import StepEquipment from "@/components/platform/StepEquipment";

function EquipmentWizardContent() {
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
      <div className="w-full max-w-6xl px-4 py-8">
        <StepEquipment />
      </div>
    </main>
  );
}

export default function EquipmentWizardPage() {
  return (
    <BusinessWizardProvider>
      <EquipmentWizardContent />
    </BusinessWizardProvider>
  );
}