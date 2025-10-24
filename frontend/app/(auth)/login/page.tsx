"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Github, Mail, ChevronLeft, Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { auth, googleProvider, githubProvider } from "@/firebase"
import { signInWithPopup, signInWithEmailAndPassword, onAuthStateChanged, signOut, type User } from "firebase/auth"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [step, setStep] = useState<"email" | "password">("email")
  const [showPassword, setShowPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!cardRef.current) return
    gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
    const unsub = onAuthStateChanged(auth, (u) => setCurrentUser(u))
    return () => unsub()
  }, [])

  const glowFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, { boxShadow: "0 0 0 6px rgba(0,0,0,0.06)", duration: 0.25, ease: "power2.out" })
  }
  const glowBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    gsap.to(e.currentTarget, { boxShadow: "0 0 0 0 rgba(0,0,0,0)", duration: 0.25, ease: "power2.in" })
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === "email") {
      setStep("password")
      return
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast.success("Welcome back!")
        router.push("/")
      })
      .catch((err) => toast.error(err.message || "Login failed"))
  }

  const handleGoogle = () => 
    signInWithPopup(auth, googleProvider)
      .then(() => {
        toast.success("Signed in with Google!")
        router.push("/")
      })
      .catch((err) => toast.error(err.message || "Google sign-in failed"))

  const handleGithub = () => 
    signInWithPopup(auth, githubProvider)
      .then(() => {
        toast.success("Signed in with GitHub!")
        router.push("/")
      })
      .catch((err) => toast.error(err.message || "GitHub sign-in failed"))

  const handleLogout = () => 
    signOut(auth)
      .then(() => toast.success("Signed out successfully"))
      .catch((err) => toast.error(err.message || "Logout failed"))

  return (
    <div ref={cardRef} className="w-full rounded-2xl border border-white/30 bg-white/60 p-8 shadow-xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-2xl font-bold">👋 Welcome back to FormVerse!</h1>
        <p className="text-sm text-black/60">Access your forms and track submissions effortlessly.</p>
      </div>

      {step === "email" ? (
        <form onSubmit={onSubmit} className="space-y-4" aria-labelledby="login-title">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              onFocus={glowFocus}
              onBlur={glowBlur}
              className="border-black/20 bg-white/70 focus:border-black/30 focus:ring-0"
              required
              aria-required="true"
            />
          </div>

          <Button
            type="submit"
            className="mt-1 w-full bg-black text-white ring-1 ring-black/10 transition-transform duration-200 hover:scale-[1.01] hover:ring-black/30"
            aria-label="Continue with email"
          >
            Continue
          </Button>

          <div className="flex items-center gap-3 py-2" role="separator" aria-label="OR">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-xs uppercase tracking-wide text-black/60">OR</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <div className="grid gap-3">
            <Button type="button" onClick={handleGoogle} className="flex w-full items-center justify-start gap-3 bg-black/80 text-white ring-1 ring-black/20 hover:bg-black" aria-label="Continue with Google">
              <Image src="/icons/google.svg" alt="Google" width={20} height={20} className="h-5 w-5" />
              <span className="mx-auto">Continue with Google</span>
            </Button>
            <Button type="button" onClick={handleGithub} className="flex w-full items-center justify-start gap-3 bg-black/80 text-white ring-1 ring-black/20 hover:bg-black" aria-label="Continue with GitHub">
              <Image src="/icons/github.png" alt="GitHub" width={20} height={20} className="h-5 w-5" />
              <span className="mx-auto">Continue with GitHub</span>
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" aria-labelledby="password-title">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Link href="#" className="text-sm text-black/60 underline-offset-4 hover:underline">
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                onFocus={glowFocus}
                onBlur={glowBlur}
                className="border-black/20 bg-white/70 pr-10 focus:border-black/30 focus:ring-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-1 w-full bg-black text-white ring-1 ring-black/10 transition-transform duration-200 hover:scale-[1.01] hover:ring-black/30"
          >
            Sign in
          </Button>

          <div className="flex items-center gap-3 py-2" role="separator" aria-label="OR">
            <span className="h-px flex-1 bg-black/10" />
            <span className="text-xs uppercase tracking-wide text-black/60">OR</span>
            <span className="h-px flex-1 bg-black/10" />
          </div>

          <Button type="button" className="flex w-full items-center justify-start gap-3 bg-transparent text-black ring-1 ring-black/20 hover:bg-black/5">
            <Mail className="h-5 w-5" aria-hidden />
            <span className="mx-auto">Email sign-in code</span>
          </Button>

          <button type="button" onClick={() => setStep("email")} className="mx-auto flex items-center gap-2 text-sm text-black/70 underline-offset-4 hover:underline">
            <ChevronLeft className="h-4 w-4" aria-hidden /> Go back
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        Don’t have an account?{" "}
        <Link href="/signup" className="font-medium text-blue-700 hover:underline">
          Sign up
        </Link>
      </div>
      {currentUser ? (
        <div className="mt-4 rounded-md border border-black/10 bg-white/60 p-3 text-sm text-black/80">
          Signed in as {currentUser.displayName || currentUser.email}
          <Button type="button" onClick={handleLogout} className="ml-3 h-7 px-3 bg-black text-white">
            Logout
          </Button>
        </div>
      ) : null}
    </div>
  )
}


