import Cta from '@/components/Cta';
import Faq from '@/components/Faq';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Notice from '@/components/Notice';
import Routes from '@/components/Routes';

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Routes />
        <HowItWorks />
        {/* <Pricing /> */}
        <Features />
        <Notice />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
