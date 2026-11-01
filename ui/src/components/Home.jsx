import HeroSection from './HeroSection';
import CategorySection from './CategorySection';
import TrustedSection from './TrustedSection';
import TrendingSection from './TrendingSection';
import TestimonalSection from './TestimonalSection';
import Contact from './Contact';
import ArticleSection from './ArticleSection';
import TalentSection from './TalentSection';
import Pricing from './Pricing';

const Home = () => (
  <main className="overflow-hidden">
    <HeroSection />
    <CategorySection />
    <TrustedSection />
    <TrendingSection />
    <TestimonalSection />
    <TalentSection />
    <Pricing />
    <ArticleSection />
    <Contact />
  </main>
);

export default Home;