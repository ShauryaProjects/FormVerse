export default function Footer() {

  return (
    <footer className="bg-primary px-6 py-4 text-primary-foreground md:py-5">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-2 sm:gap-3 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-foreground" />
            <span className="text-xl font-bold tracking-tight">FormVerse</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-primary-foreground/60 sm:text-sm">© 2025 FormVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
