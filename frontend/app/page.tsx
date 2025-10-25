"use client"

import { useEffect } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import About from "@/components/about"
import HowToUse from "@/components/how-to-use"
import Testimonials from "@/components/testimonials"
import Contact from "@/components/contact"
import Footer from "@/components/footer"

export default function Home() {
  useEffect(() => {
    // Handle hash navigation when page loads
    const handleHashNavigation = () => {
      const hash = window.location.hash
      if (hash) {
        // Wait a bit for components to render
        setTimeout(() => {
          const element = document.getElementById(hash.substring(1))
          if (element) {
            element.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            })
          }
        }, 100)
      }
    }

    // Handle initial load
    handleHashNavigation()

    // Handle hash changes (when navigating with browser back/forward)
    window.addEventListener('hashchange', handleHashNavigation)

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation)
    }
  }, [])

  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <HowToUse />
      <Features />
      <About />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  )
}