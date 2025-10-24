"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Linkedin, 
  Github,
  Send
} from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const detailsRef = useRef<HTMLDivElement>(null)
  const socialIconsRef = useRef<HTMLDivElement>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Main section fade + slide up animation
      gsap.fromTo(
        cardRef.current,
        { 
          opacity: 0, 
          y: 60,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
        }
      )

      // Form fields stagger animation
      gsap.fromTo(
        formRef.current?.querySelectorAll(".form-field") || [],
        { 
          opacity: 0, 
          x: -30 
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )

      // Contact details animation
      gsap.fromTo(
        detailsRef.current?.querySelectorAll(".contact-item") || [],
        { 
          opacity: 0, 
          x: 30 
        },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: detailsRef.current,
            start: "top 80%",
            once: true,
          },
        }
      )

      // Social icons float animation
      const socialIcons = socialIconsRef.current?.querySelectorAll(".social-icon")
      socialIcons?.forEach((icon) => {
        const iconElement = icon as HTMLElement
        
        iconElement.addEventListener("mouseenter", () => {
          gsap.to(iconElement, {
            y: -5,
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        iconElement.addEventListener("mouseleave", () => {
          gsap.to(iconElement, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          })
        })
      })

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Reset form
    setFormData({ name: "", email: "", message: "" })
    setIsSubmitting(false)
    
    // Show success message (you can replace with toast notification)
    alert("Message sent successfully!")
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    gsap.to(e.target, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    gsap.to(e.target, {
      scale: 1,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  return (
    <section 
      id="contact-section"
      ref={sectionRef} 
      className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 px-6 pb-24 md:pb-32 lg:pb-40"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            Get in Touch
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 md:text-xl">
            We'd love to hear from you. Reach out with questions, feedback, or support requests.
          </p>
        </div>

        {/* Main Contact Card */}
        <Card 
          ref={cardRef}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl md:p-12 lg:p-16"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            
            {/* Contact Form */}
            <div className="space-y-8">
              <div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">Send us a message</h3>
                <p className="text-gray-600">Fill out the form below and we'll get back to you soon.</p>
              </div>
              
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="form-field space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="h-12 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:border-gray-400 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-gray-200"
                    placeholder="Your full name"
                  />
                </div>

                <div className="form-field space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="h-12 rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:border-gray-400 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-gray-200"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className="form-field space-y-2">
                  <Label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    className="rounded-xl border-gray-200 bg-white/50 backdrop-blur-sm transition-all duration-200 focus:border-gray-400 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-gray-200 resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="group h-12 w-full rounded-xl bg-gray-900 px-8 text-white transition-all duration-300 hover:bg-gray-800 hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      Send Message
                    </div>
                  )}
                </Button>
              </form>
            </div>

            {/* Contact Details */}
            <div ref={detailsRef} className="space-y-8">
              <div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">Contact Information</h3>
                <p className="text-gray-600">Get in touch through any of these channels.</p>
              </div>

              <div className="space-y-6">
                <div className="contact-item flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <Mail className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">shauryasrivastav07@gmail.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="contact-item flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <Phone className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">+91 78974 26629</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="contact-item flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                    <MapPin className="h-5 w-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Office</h4>
                    <p className="text-gray-600">Madan Mohan Malviya University of Technology</p>
                    <p className="text-gray-600">Gorakhpur, Uttar Pradesh, India</p>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="pt-8">
                <h4 className="mb-4 font-semibold text-gray-900">Follow Us</h4>
                <div ref={socialIconsRef} className="flex gap-4">
                  <a
                    href="#"
                    className="social-icon flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-all duration-200 hover:bg-gray-900 hover:text-white hover:shadow-lg"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="social-icon flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-all duration-200 hover:bg-gray-900 hover:text-white hover:shadow-lg"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="social-icon flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-700 transition-all duration-200 hover:bg-gray-900 hover:text-white hover:shadow-lg"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}
