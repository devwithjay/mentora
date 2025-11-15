import CTASection from "@/components/sections/cta";
import FeaturesSection from "@/components/sections/features";
import HeroSection from "@/components/sections/hero";

const HomePage = async () => {
  return (
    <div className="bg-primary h-full px-8">
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
};

export default HomePage;
