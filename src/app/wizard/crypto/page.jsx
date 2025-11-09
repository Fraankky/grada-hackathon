"use client";

import { BusinessWizardProvider } from "@/context/BusinessWizardContext";

export default function CryptoWizardPage() {
  return (
    <BusinessWizardProvider>
      <main className="min-h-screen bg-white text-slate-100 flex items-center justify-center">
        <div className="w-full max-w-4xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Crypto Investment Flow</h1>
            <p className="text-gray-400">Coming soon...</p>
            <p className="mt-4">Flow crypto investment akan diimplementasi di sini.</p>
          </div>
        </div>
      </main>
    </BusinessWizardProvider>
  );
}