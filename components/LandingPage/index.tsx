import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Routes from "@/components/Routes"
import HowItWorks from "@/components/HowItWorks"
import Pricing from "@/components/Pricing"
import Features from "@/components/Features"
import Notice from "@/components/Notice"
import Faq from "@/components/Faq"
import Cta from "@/components/Cta"
import Footer from "@/components/Footer"

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
  )
}
