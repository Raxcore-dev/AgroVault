'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#about', label: 'About' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/10 shadow-sm transition-all duration-300">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo Section */}
          <div className="flex items-center gap-10">
             <Link href="/" className="hover:opacity-90 transition-opacity">
               <Logo size="sm" />
             </Link>

             {/* Desktop Navigation */}
             <div className="hidden lg:flex items-center gap-8">
               {navLinks.map((link) => (
                 <Link
                   key={link.href}
                   href={link.href}
                   className="text-[13px] font-bold uppercase tracking-widest text-black/60 hover:text-primary transition-all duration-200"
                 >
                   {link.label}
                 </Link>
               ))}
             </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-[13px] font-bold uppercase tracking-widest text-black/80 hover:text-primary transition-all duration-200 px-4"
            >
              Login
            </Link>
            <Button asChild className="bg-black hover:bg-primary text-white rounded-none h-11 px-8 text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-lg">
              <Link href="/register">Join AgroVault</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-black hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-black/5 animate-in slide-in-from-top-2 bg-white/95 backdrop-blur-2xl">
            <div className="flex flex-col gap-6 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-bold uppercase tracking-widest text-black/60 hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-6 border-t border-black/5">
                <Button variant="outline" asChild className="w-full h-12 rounded-none uppercase tracking-widest font-bold text-xs">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full h-12 rounded-none bg-black hover:bg-primary text-white uppercase tracking-widest font-bold text-xs">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
