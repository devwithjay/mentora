import CTASection from "@/components/sections/cta";
import FAQSection from "@/components/sections/faq";
import FeaturesSection from "@/components/sections/features";
import HeroSection from "@/components/sections/hero";

const HomePage = async () => {
  return (
    <div className="bg-primary h-full px-8">
      <HeroSection />
      <FeaturesSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
