import React from "react";

export default function Layout({ children }) {
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white"> 
      
      <section className="flex w-full justify-center items-center min-h-screen p-8">
        
        <div className="w-full max-w-md bg-transparent">
         
      

          {/* Konten form login */}
          <div className="p-6 bg-white shadow-lg rounded-xl">
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}