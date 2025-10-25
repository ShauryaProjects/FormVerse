"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: "01",
    title: "Create Your Form",
    description: "Use our intuitive drag-and-drop builder to design your perfect form. Add questions, customize styling, and set up validation rules.",
  },
  {
    number: "02", 
    title: "Share & Collect",
    description: "Get a unique link for your form and share it with your audience. Responses are collected automatically in real-time.",
  },
  {
    number: "03",
    title: "Analyze Results",
    description: "View responses instantly, export data, and gain insights to make informed decisions based on your collected data.",
  },
]

export default function HowToUse() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)
  const videoElementRef = useRef<HTMLVideoElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hide elements before first paint
      gsap.set(titleRef.current, { opacity: 0 })
      gsap.set(videoRef.current, { opacity: 0, scale: 0.95 })
      gsap.set(stepsRef.current, { opacity: 0, y: 30 })

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
          },
        }
      )

      // Video animation
      gsap.fromTo(
        videoRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: videoRef.current,
            start: "top 75%",
            onEnter: () => {
              // Start video when section comes into view
              if (videoElementRef.current) {
                videoElementRef.current.play().catch(console.error)
              }
            },
            onLeave: () => {
              // Pause video when section leaves view
              if (videoElementRef.current) {
                videoElementRef.current.pause()
              }
            },
            onEnterBack: () => {
              // Resume video when scrolling back to section
              if (videoElementRef.current) {
                videoElementRef.current.play().catch(console.error)
              }
            },
            onLeaveBack: () => {
              // Pause video when scrolling away from section
              if (videoElementRef.current) {
                videoElementRef.current.pause()
              }
            }
          },
        }
      )

      // Staggered steps animations
      stepsRef.current.forEach((step, index) => {
        if (step) {
          gsap.fromTo(
            step,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: step,
                start: "top 85%",
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Cleanup: pause video when component unmounts
  useLayoutEffect(() => {
    return () => {
      if (videoElementRef.current) {
        videoElementRef.current.pause()
      }
    }
  }, [])

  return (
    <section ref={sectionRef} id="how-to-use-section" className="bg-background px-6 py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl">
        {/* Title */}
        <h2
          ref={titleRef}
          className="opacity-0 mb-16 text-balance text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
        >
          How to Use Formverse
        </h2>

        {/* Video Section */}
        <div 
          ref={videoRef}
          className="opacity-0 mb-20 flex justify-center"
        >
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="aspect-video w-full max-w-4xl">
              <video
                ref={videoElementRef}
                className="h-full w-full object-cover"
                loop
                muted
                playsInline
                aria-label="Formverse tutorial video"
              >
                <source src="/bgb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Video overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:gap-12 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={index}
              ref={(el) => {
                stepsRef.current[index] = el
              }}
              className="opacity-0 group text-center"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground transition-all group-hover:scale-110 group-hover:shadow-lg">
                {step.number}
              </div>
              <h3 className="mb-4 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {step.title}
              </h3>
              <p className="text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-16 text-center">
          <Button
            size="lg"
            className="group h-12 rounded-2xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-all hover:scale-105 hover:shadow-xl md:h-14 md:px-10 md:text-lg"
          >
            Start Building Your Form
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
    </section>
  )
}
