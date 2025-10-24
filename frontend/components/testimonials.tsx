"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

interface Testimonial {
  id: number
  name: string
  review: string
  rating: number
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    review: "FormVerse transformed how I collect customer feedback. The intuitive builder and beautiful forms make my business look professional and trustworthy.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sarah&backgroundColor=b6e3f4&hair=short01&eyes=variant01"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    review: "As a freelance designer, I need forms that match my brand aesthetic. FormVerse's customization options are exactly what I was looking for.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Marcus&backgroundColor=ffd5dc&hair=dannyPhantom&eyes=eyes"
  },
  {
    id: 3,
    name: "Emily Watson",
    review: "The analytics dashboard gives me insights I never had before. Understanding my audience through form data has been a game-changer for my startup.",
    rating: 4,
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Emily&backgroundColor=c0aede&eyes=eva&mouth=smile01"
  },
  {
    id: 4,
    name: "David Kim",
    review: "Setting up complex multi-step forms used to take hours. With FormVerse, I can create them in minutes. The time savings alone pays for itself.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David&backgroundColor=ffdfbf&accessories=round&hair=shortWaved"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    review: "My event registration process is now seamless. Attendees love the clean interface, and I love how easy it is to manage responses.",
    rating: 4,
    avatar: "https://api.dicebear.com/7.x/open-peeps/svg?seed=Lisa&backgroundColor=d1d4f9&hair=short&accessories=glasses"
  },
  {
    id: 6,
    name: "Alex Morgan",
    review: "The integration capabilities are fantastic. Connecting FormVerse to our CRM and email tools was straightforward and works flawlessly.",
    rating: 5,
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Alex&backgroundColor=b6e3f4&shapeColor=0a5b83,1c799f,69d2e7"
  }
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { 
          opacity: 0, 
          y: 40 
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )

      // Cards stagger animation
      gsap.fromTo(
        cardsRef.current?.querySelectorAll(".testimonial-card") || [],
        { 
          opacity: 0, 
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )

      // Star ratings animation
      gsap.fromTo(
        cardsRef.current?.querySelectorAll(".star-rating") || [],
        { 
          opacity: 0,
          scale: 0.8
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.05,
          delay: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )


    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Separate effect for hover animations - runs immediately
  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".testimonial-card")
    
    const cleanupFunctions: (() => void)[] = []
    
    cards?.forEach((card) => {
      const cardElement = card as HTMLElement
      
      const handleMouseEnter = () => {
        gsap.to(cardElement, {
          scale: 1.05,
          y: -8,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          duration: 0.2,
          ease: "power2.out"
        })
      }
      
      const handleMouseLeave = () => {
        gsap.to(cardElement, {
          scale: 1,
          y: 0,
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          duration: 0.2,
          ease: "power2.out"
        })
      }
      
      cardElement.addEventListener("mouseenter", handleMouseEnter)
      cardElement.addEventListener("mouseleave", handleMouseLeave)
      
      // Store cleanup functions
      cleanupFunctions.push(() => {
        cardElement.removeEventListener("mouseenter", handleMouseEnter)
        cardElement.removeEventListener("mouseleave", handleMouseLeave)
      })
    })

    // Cleanup function
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, []) // Empty dependency array - runs once on mount

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`star-rating h-4 w-4 ${
          index < rating 
            ? "fill-amber-400 text-amber-400" 
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ))
  }

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 px-6 py-24 md:py-32 lg:py-40"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div ref={titleRef} className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            What Our Users Say
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            See how FormVerse helps creators and teams build forms effortlessly.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div 
          ref={cardsRef}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="testimonial-card group relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-8 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/40"
            >
              {/* Quote content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.review}"
                </p>
              </div>

              {/* Rating */}
              <div className="mb-4 flex items-center gap-1">
                {renderStars(testimonial.rating)}
              </div>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 ring-2 ring-white/50">
                  <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name} avatar`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent && !parent.querySelector('.fallback-initials')) {
                        const fallback = document.createElement('div')
                        fallback.className = 'fallback-initials flex h-full w-full items-center justify-center text-sm font-semibold text-gray-700'
                        fallback.textContent = testimonial.name.split(' ').map(n => n[0]).join('')
                        parent.appendChild(fallback)
                      }
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                </div>
              </div>

              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Bottom accent */}
        {/* <div className="mt-16 text-center">
          <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
        </div> */}
      </div>
    </section>
  )
}
