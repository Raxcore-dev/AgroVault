'use client'

import NextImage from 'next/image'
import Link from 'next/link'
import {
  Thermometer,
  Brain,
  CloudSun,
  Users,
  ShoppingCart,
  Warehouse,
  Bell,
  TrendingUp,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { FeatureCard } from '@/components/feature-card'
import { StepCard } from '@/components/step-card'
import { HeroSection } from '@/components/hero-section'

/**
 * AgroVault Landing Page
 * Modern, responsive homepage for the AgroVault platform
 */
export default function LandingPage() {
  const features = [
    {
      icon: Warehouse,
      title: 'Smart Storage & Drying',
      description: 'Solar drying and monitoring for smallholders and commercial silos',
    },
    {
      icon: Brain,
      title: 'Post-Harvest AI',
      description: 'Intelligent advice to prevent spoilage and optimize your harvest value',
    },
    {
      icon: CloudSun,
      title: 'Dynamic Planning',
      description: 'Climate-aware harvesting and drying schedules for your specific area',
    },
    {
      icon: Users,
      title: 'Farmer Cooperatives',
      description: 'Connect with local clusters to share resources and logistics',
    },
    {
      icon: ShoppingCart,
      title: 'Direct Market Access',
      description: 'Sell directly to verified buyers and skip the expensive middlemen',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Intelligence',
      description: 'Transparent market prices across all major Kenyan agricultural hubs',
    },
  ]

  const steps = [
    {
      stepNumber: 1,
      title: 'Add Your Storage Unit',
      description: 'Register your storage facility and connect IoT sensors for monitoring',
    },
    {
      stepNumber: 2,
      title: 'Monitor Conditions',
      description: 'Track temperature, humidity, and other conditions in real-time',
    },
    {
      stepNumber: 3,
      title: 'Receive Alerts',
      description: 'Get instant notifications and AI-powered recommendations',
    },
    {
      stepNumber: 4,
      title: 'Make Better Decisions',
      description: 'Use data insights to optimize selling and reduce losses',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      <main className="flex-1">
        {/* Advanced Hero Section with County Search and AI Chat */}
        <HeroSection />

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Solutions for <span className="text-primary">Every Stage</span> of the Harvest
              </h2>
              <p className="text-lg text-muted-foreground">
                From high-tech solar drying to AI-powered market intelligence, we support smallholders and large farms alike.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Quality Assurance Section */}
        <section className="py-20 md:py-28 bg-background overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
              <div className="flex-1 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                  <CheckCircle className="h-3 w-3" />
                  Quality First
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Precision <span className="text-primary">Quality Control</span> for Every Bag
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Our sensors don't just track storage; they verify the health of your harvest. From moisture content to spoilage biomarkers, AgroVault gives you the professional data needed to secure high-value contracts.
                </p>
                <ul className="space-y-4">
                  {[
                    'Instant moisture & temperature probes',
                    'Aflatoxin & spoilage risk prediction',
                    'Certified quality reports for buyers',
                    'Actionable mitigation alerts'
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground/80 font-medium">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 relative w-full aspect-square max-w-[550px]">
                <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] -rotate-6 scale-95" />
                <div className="relative h-full w-full rounded-lg overflow-hidden border border-border">
                  <NextImage
                    src="/quality-control.png"
                    alt="Precision Quality Control"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="about" className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 to-emerald-700 p-8 md:p-16">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
              </div>

              <div className="relative text-center">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                  Join the Future of African Agriculture
                </h2>
                <p className="mt-4 text-lg text-green-100 max-w-2xl mx-auto">
                  AgroVault is built in Africa, for Africa. We are empowering millions of smallholders to secure their future.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    asChild
                    className="bg-white text-green-700 hover:bg-green-50 shadow-lg"
                  >
                    <Link href="/register">Create Account</Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="border-white text-green-700 hover:bg-white/10"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
