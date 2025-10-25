"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { auth } from "@/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setCurrentUser(user))
    return () => unsub()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollThreshold = 10 // Minimum scroll distance to trigger hide/show
      
      // Only update if scroll difference is significant enough
      if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down and past 100px - hide navbar
          setIsVisible(false)
        } else {
          // Scrolling up or at top - show navbar
          setIsVisible(true)
        }
        setLastScrollY(currentScrollY)
      }
    }

    // Throttle scroll events for better performance
    let timeoutId: NodeJS.Timeout
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 10)
    }

    window.addEventListener('scroll', throttledHandleScroll)
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [lastScrollY])

  const handleAvatarClick = () => {
    router.push("/admin")
  }

  const handleContactClick = () => {
    // Check if we're on the home page
    if (window.location.pathname === '/') {
      const contactSection = document.getElementById('contact-section')
      if (contactSection) {
        contactSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // Navigate to home page with contact section hash
      router.push('/#contact-section')
    }
    // Close mobile menu if open and ensure navbar stays visible during navigation
    setMobileOpen(false)
    setIsVisible(true)
  }

  const handleAboutClick = () => {
    // Check if we're on the home page
    if (window.location.pathname === '/') {
      const aboutSection = document.getElementById('about-section')
      if (aboutSection) {
        aboutSection.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    } else {
      // Navigate to home page with about section hash
      router.push('/#about-section')
    }
    // Close mobile menu if open and ensure navbar stays visible during navigation
    setMobileOpen(false)
    setIsVisible(true)
  }

  const handleHomeClick = () => {
    // Smooth scroll to top of page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    // Close mobile menu if open and ensure navbar stays visible during navigation
    setMobileOpen(false)
    setIsVisible(true)
  }

  return (
    <nav 
      ref={navRef} 
      className={`fixed left-0 right-0 z-50 w-full overflow-x-hidden bg-primary/95 backdrop-blur-sm transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 md:px-12">
        <div className="flex items-center justify-between py-5">
        {/* Logo */}
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-primary-foreground" />
            <span className="truncate text-lg font-bold tracking-tight text-primary-foreground md:text-xl">FormVerse</span>
        </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 text-sm font-medium text-primary-foreground md:flex md:gap-8">
          <button 
            onClick={handleHomeClick}
            className="transition-colors hover:text-primary-foreground/70 cursor-pointer"
          >
            Home
          </button>
          <button 
            onClick={handleAboutClick}
            className="transition-colors hover:text-primary-foreground/70 cursor-pointer"
          >
            About
          </button>
          <button 
            onClick={handleContactClick}
            className="transition-colors hover:text-primary-foreground/70 cursor-pointer"
          >
            Contact
          </button>
          <Link href="/builder">
            <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all duration-300 hover:scale-105">
              Create Form
            </Button>
          </Link>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  Heyy, {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User'}!
                </span>
                <button
                  onClick={handleAvatarClick}
                  className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground text-sm font-medium hover:bg-primary-foreground/30 transition-colors cursor-pointer"
                  aria-label="Open admin panel"
                >
                  {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                </button>
              </div>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Login
                </Button>
              </Link>
            )}
        </div>

          {/* Mobile menu button */}
          <button
            aria-label="Toggle menu"
            className="md:hidden inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileOpen && (
          <div className="md:hidden overflow-hidden">
            <div className="flex flex-col gap-4 border-t border-primary-foreground/10 py-4">
              <button 
                onClick={handleHomeClick}
                className="px-1 py-2 text-primary-foreground/90 hover:text-primary-foreground text-left cursor-pointer"
              >
                Home
              </button>
              <button 
                onClick={handleAboutClick}
                className="px-1 py-2 text-primary-foreground/90 hover:text-primary-foreground text-left cursor-pointer"
              >
                About
              </button>
              <button 
                onClick={handleContactClick}
                className="px-1 py-2 text-primary-foreground/90 hover:text-primary-foreground text-left cursor-pointer"
              >
                Contact
              </button>
              <Link href="/builder" className="pt-2">
                <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Create Form
                </Button>
              </Link>
              {currentUser ? (
                <div className="px-1 py-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAvatarClick}
                      className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground text-sm font-medium hover:bg-primary-foreground/30 transition-colors cursor-pointer"
                      aria-label="Open admin panel"
                    >
                      {(currentUser.displayName?.[0] || currentUser.email?.[0] || 'U').toUpperCase()}
                    </button>
                    <span className="text-primary-foreground/90">
                      Heyy, {currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'User'}!
                    </span>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="px-1 py-2 text-primary-foreground/90 hover:text-primary-foreground">
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
