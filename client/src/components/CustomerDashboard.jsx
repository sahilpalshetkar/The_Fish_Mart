import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import ProductSection from "../components/ProductSection";
import WhyChooseUs from "../components/WhyChooseUs";
import HowItWorks from "../components/HowItWorks";
import Footer from "../components/Footer";
import DashboardVideo from "./DashboardVideo";
import BestSellerSection from "./BestSellerSection";

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-white text-slate-800">
      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <main>
        <Hero />

        {/* Categories */}
        <CategorySection />

        {/* Video Section */}
        <DashboardVideo />

        {/* Best Sellers */}
        <BestSellerSection />

        {/* How It Works */}
        <HowItWorks />

        {/* Fresh Fish */}
        <ProductSection
          title="Fresh Fish"
          subtitle="Freshly sourced seafood, cleaned and packed with care"
        />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* More Products */}
        <ProductSection
          title="Explore Our Seafood"
          subtitle="Discover premium seafood for your next meal"
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
