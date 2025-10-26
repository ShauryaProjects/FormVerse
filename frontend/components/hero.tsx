"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadingRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Ensure elements are hidden before first paint to avoid flash
      gsap.set([headingRef.current, subheadingRef.current, buttonRef.current], {
        opacity: 0,
      })

      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" }
      )

      // Subheading animation
      gsap.fromTo(
        subheadingRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, delay: 0.35, ease: "power3.out" }
      )

      // Button animation with scale
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.8, delay: 0.5, ease: "back.out(1.7)" }
      )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative flex min-h-screen flex-col overflow-hidden bg-primary text-primary-foreground">
      {/* Hero Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1
          ref={headingRef}
          className="opacity-0 max-w-5xl text-balance font-sans text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl will-change-transform"
        >
          Create Forms. Share Links. Collect Responses.
        </h1>
        <p
          ref={subheadingRef}
          className="opacity-0 mt-6 max-w-2xl text-pretty text-base leading-relaxed text-primary-foreground/70 sm:text-lg md:mt-8 md:text-xl will-change-transform"
        >
          Build beautiful forms in minutes. Share them instantly and track responses effortlessly — all in one place.
        </p>
        <div ref={buttonRef} className="opacity-0 mt-12 will-change-transform">
          <Button
            size="lg"
            className="group h-12 rounded-2xl bg-primary-foreground px-8 text-base font-semibold text-primary transition-all hover:scale-105 hover:shadow-2xl hover:bg-transparent hover:border-2 hover:border-white hover:text-white md:h-14 md:px-10 md:text-lg"
          >
            Start Building Now
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

      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="h-6 w-6 text-primary-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
