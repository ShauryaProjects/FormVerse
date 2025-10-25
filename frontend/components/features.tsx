"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card } from "@/components/ui/card"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
        />
      </svg>
    ),
    title: "Drag & Drop Builder",
    description: "Design custom forms with a simple and intuitive interface — no coding required.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
    ),
    title: "Instant Sharing",
    description: "Each form gets a unique link you can share with anyone, anywhere.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Real-Time Responses",
    description: "See responses the moment they're submitted. Export data anytime.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    title: "Secure & Reliable",
    description: "Your forms and submissions are protected with modern security standards.",
  },
]

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hide elements before first paint
      gsap.set(titleRef.current, { opacity: 0 })
      gsap.set(cardsRef.current, { opacity: 0, y: 10 })

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

      // Staggered card animations
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: index * 0.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} id="features-section" className="bg-background px-6 pb-24 md:pb-32 lg:pb-40">
      <div className="mx-auto max-w-7xl">
        <h2
          ref={titleRef}
          className="opacity-0 mb-20 text-balance text-center text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl"
        >
          Built for excellence
        </h2>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:gap-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
              className={`opacity-0 group relative overflow-hidden rounded-2xl p-8 shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl md:p-10 ${
                index % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
              }`}
            >
              <div
                className={`mb-6 inline-flex rounded-xl p-3 ${
                  index % 2 === 0 ? "bg-primary-foreground/10" : "bg-primary/5"
                }`}
              >
                <div className={index % 2 === 0 ? "text-primary-foreground" : "text-primary"}>{feature.icon}</div>
              </div>
              <h3 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">{feature.title}</h3>
              <p
                className={`text-pretty text-base leading-relaxed md:text-lg ${
                  index % 2 === 0 ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
