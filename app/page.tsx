"use client";

import Header from "./components/Header";
import Hero from "./components/Hero";
import FeatureGrid from "./components/FeatureGrid";
import Footer from "./components/Footer";
import HowItWorks from "./components/HowItWorks";
import FAQ from "./components/FAQ";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto">
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}