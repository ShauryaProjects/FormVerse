"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"

export default function About() {
  const svgRef = useRef<HTMLObjectElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleSvgLoad = () => {
      // Remove animated class initially to prevent auto-play
      if (svgRef.current) {
        const svgDoc = svgRef.current.contentDocument
        if (svgDoc) {
          const svgElement = svgDoc.querySelector('svg')
          if (svgElement) {
            svgElement.classList.remove('animated')
          }
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && svgRef.current) {
            // Access the SVG document and restart animation
            const svgDoc = svgRef.current.contentDocument
            if (svgDoc) {
              const svgElement = svgDoc.querySelector('svg')
              if (svgElement) {
                svgElement.classList.remove('animated')
                // Small delay to ensure class removal takes effect
                setTimeout(() => {
                  svgElement.classList.add('animated')
                }, 50)
              }
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    // Add load event listener to SVG object
    if (svgRef.current) {
      svgRef.current.addEventListener('load', handleSvgLoad)
    }

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      observer.disconnect()
      if (svgRef.current) {
        svgRef.current.removeEventListener('load', handleSvgLoad)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className="bg-secondary px-6 py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* SVG Animation */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
              <object
                ref={svgRef}
                data="/online-resume-animate.svg"
                type="image/svg+xml"
                className="h-full w-full object-contain"
                aria-label="Online resume animation"
              />
            </div>
          </div>

          {/* Content */}
          <div className="space-y-5 md:space-y-6">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Why FormVerse?
            </h2>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              FormVerse helps you collect feedback, run surveys, and manage registrations with ease. Whether you&apos;re a
              business, educator, or creator, FormVerse gives you the tools to connect with your audience seamlessly.
            </p>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              With years of expertise and a passion for innovation, we&apos;ve helped countless businesses transform
              their digital presence and achieve remarkable results.
            </p>
            <div className="pt-4">
              <Button
                variant="outline"
                size="lg"
                className="group h-11 rounded-xl border-2 border-primary bg-transparent px-6 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:shadow-lg md:h-12 md:px-8 md:text-base"
              >
                Learn more about us
                <svg
                  className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
