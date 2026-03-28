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

        {/* Hardware Section - AgroVault Sentinel */}
        <section className="py-20 md:py-32 bg-muted/40 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              {/* Product Layout - Three Angles Showcase */}
              <div className="flex-1 relative w-full aspect-square max-w-[600px] lg:max-w-none">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-3xl -z-10 translate-x-4 translate-y-4" />
                
                {/* Main Hero Shot */}
                <div className="relative h-full w-full rounded-2xl overflow-hidden border border-border shadow-2xl bg-black/5 z-0 group">
                  <NextImage
                    src="/gadget-hero.png"
                    alt="AgroVault Sentinel IoT Device - Hero View"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Floating Badge */}
                  <div className="absolute top-8 left-8 px-5 py-2.5 rounded-full bg-primary/95 text-white text-xs font-bold shadow-2xl backdrop-blur-md border border-white/20 uppercase tracking-widest italic animate-pulse">
                    Sentinel v1.2 Pro
                  </div>
                </div>

                {/* Secondary Angles - Grid Layout */}
                <div className="absolute -bottom-8 -right-8 flex gap-4 z-10 hidden md:flex">
                  <div className="w-40 aspect-square rounded-xl overflow-hidden border-4 border-background shadow-2xl transition-transform hover:-translate-y-2 duration-300">
                    <NextImage
                      src="/gadget.png"
                      alt="AgroVault Sentinel- Front"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="w-40 aspect-square rounded-xl overflow-hidden border-4 border-background shadow-2xl transition-transform hover:-translate-y-2 duration-300">
                    <NextImage
                      src="/gadget-angle.png"
                      alt="AgroVault Sentinel - Side"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="flex-1 text-left lg:pl-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                  <Brain className="h-3 w-3" />
                  Engineering Excellence
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight italic">
                  Meet the <span className="text-primary italic">AgroVault Sentinel</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-10 leading-relaxed italic max-w-xl">
                  The ultimate post-harvest guardian. A rugged, premium IoT device designed specifically for African farm conditions. Plug it in, or go completely off-grid.
                </p>

                <div className="grid sm:grid-cols-2 gap-10 mb-12">
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                      <Thermometer className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-foreground italic">Inbuilt Power System</h3>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      Equipped with a high-capacity rechargeable battery that lasts up to 6 months on a single charge. No constant wiring needed.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                      <Bell className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-foreground italic">Global SIM Connectivity</h3>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      Includes a side-access SIM slot. We handle the data plan so your sensors stay online even in the most remote areas.
                    </p>
                  </div>
                </div>

                {/* Offer Box */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-4 shadow-sm">
                  <h4 className="font-bold text-primary flex items-center gap-2 uppercase tracking-widest italic text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Zero-Config Deployment
                  </h4>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    Our team handles all the initial setups, including a <span className="font-bold text-foreground italic">complimentary one-month data plan</span> to get you started immediately. Just place it in your storage and forget it.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
