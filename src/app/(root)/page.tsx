import FeaturesSection from "@/components/sections/features";
import HeroSection from "@/components/sections/hero";

const HomePage = async () => {
  return (
    <div className="bg-primary h-full px-12">
      <HeroSection />
      <FeaturesSection />
    </div>
  );
};

export default HomePage;
