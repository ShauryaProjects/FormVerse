"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { auth, googleProvider, githubProvider } from "@/firebase"
import { createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged, type User } from "firebase/auth"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"



export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState<"info" | "password">("info")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
    if (step === "info") {
      setStep("password")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        toast.success("Account created successfully!")
        router.push("/")
      })
      .catch((err) => toast.error(err.message || "Signup failed"))
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

  return (
    <div ref={cardRef} className="w-full rounded-2xl border border-white/30 bg-white/60 p-8 shadow-xl backdrop-blur-xl">
      <div className="mb-6 text-center">
        <h1 className="mb-1 text-2xl font-bold">✨ Join FormVerse Today!</h1>
        <p className="text-sm text-black/60">Create, customize, and share forms in minutes.</p>
      </div>

      {step === "info" ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              onFocus={glowFocus}
              onBlur={glowBlur}
              className="border-black/20 bg-white/70 focus:border-black/30 focus:ring-0"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onFocus={glowFocus}
              onBlur={glowBlur}
              className="border-black/20 bg-white/70 focus:border-black/30 focus:ring-0"
              required
            />
          </div>

          <Button
            type="submit"
            className="mt-1 w-full bg-black text-white ring-1 ring-black/10 transition-transform duration-200 hover:scale-[1.01] hover:ring-black/30"
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                onFocus={glowFocus}
                onBlur={glowBlur}
                className="border-black/20 bg-white/70 pr-10 focus:border-black/30 focus:ring-0"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                aria-pressed={showConfirm}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/60 hover:text-black"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="mt-1 w-full bg-black text-white ring-1 ring-black/10 transition-transform duration-200 hover:scale-[1.01] hover:ring-black/30"
          >
            Sign up
          </Button>

          <button type="button" onClick={() => setStep("info")} className="mx-auto flex items-center justify-center text-sm text-black/70 underline-offset-4 hover:underline">
            Go back
          </button>
        </form>
      )}

      {currentUser ? (
        <div className="mt-4 text-center text-sm text-black/80">
          Signed in as {currentUser.displayName || currentUser.email}
        </div>
      ) : null}

      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-blue-700 hover:underline">
          Login
        </Link>
      </div>
    </div>
  )
}


