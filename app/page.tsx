'use client'

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

/**
 * AgroVault Landing Page
 * Modern, responsive homepage for the AgroVault platform
 */
export default function LandingPage() {
  const features = [
    {
      icon: Warehouse,
      title: 'Storage Monitoring',
      description: 'Track temperature and humidity in real-time with IoT sensors',
    },
    {
      icon: Brain,
      title: 'AI Recommendations',
      description: 'Get intelligent advice to prevent spoilage and optimize storage',
    },
    {
      icon: CloudSun,
      title: 'Weather Insights',
      description: 'Plan harvesting and selling using accurate weather forecasts',
    },
    {
      icon: Users,
      title: 'Labor Connection',
      description: 'Find workers easily for harvesting and farm operations',
    },
    {
      icon: ShoppingCart,
      title: 'Marketplace',
      description: 'Connect with buyers and sell your produce at fair prices',
    },
    {
      icon: TrendingUp,
      title: 'Market Analysis',
      description: 'Access real-time market prices and trends for better decisions',
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
        {/* Hero Section */}
        <section id="home" className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-background dark:from-green-950/20 dark:via-emerald-950/20 dark:to-background" />
          
          {/* Decorative Elements */}
          <div className="absolute top-20 right-10 w-72 h-72 bg-green-200/30 dark:bg-green-800/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-800/20 rounded-full blur-3xl" />

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                  <CheckCircle className="h-4 w-4" />
                  Trusted by Farmers Across Kenya
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  Smart Post-Harvest{' '}
                  <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    Management
                  </span>{' '}
                  for Farmers
                </h1>
                
                <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
                  Monitor storage, prevent spoilage, and make data-driven decisions using AI and IoT technology.
                  Reduce crop losses and maximize your profits.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button
                    size="lg"
                    asChild
                    className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg shadow-green-500/25"
                  >
                    <Link href="/register">Get Started</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className="mt-12 grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">500+</div>
                    <div className="text-sm text-muted-foreground mt-1">Farmers</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">1000+</div>
                    <div className="text-sm text-muted-foreground mt-1">Storage Units</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600">30%</div>
                    <div className="text-sm text-muted-foreground mt-1">Loss Reduction</div>
                  </div>
                </div>
              </div>

              {/* Hero Illustration */}
              <div className="relative hidden md:block">
                <div className="relative">
                  {/* Main Card */}
                  <div className="bg-card rounded-2xl shadow-2xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Warehouse className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold">Storage Unit A1</div>
                        <div className="text-xs text-muted-foreground">Maize - 500 bags</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                        <Thermometer className="h-5 w-5 text-green-600 mb-2" />
                        <div className="text-2xl font-bold">24°C</div>
                        <div className="text-xs text-muted-foreground">Temperature</div>
                      </div>
                      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <CloudSun className="h-5 w-5 text-blue-600 mb-2" />
                        <div className="text-2xl font-bold">65%</div>
                        <div className="text-xs text-muted-foreground">Humidity</div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          All conditions optimal
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating Alert Card */}
                  <div className="absolute -top-4 -right-4 bg-card rounded-xl shadow-xl border border-border p-4 animate-bounce">
                    <div className="flex items-center gap-2">
                      <Bell className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">No Alerts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Everything You Need to{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Protect Your Harvest
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Comprehensive tools and insights to help you manage post-harvest operations efficiently
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

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                How{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  AgroVault
                </span>{' '}
                Works
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Get started in minutes and take control of your post-harvest management
              </p>
            </div>

            <div className="relative">
              {/* Connection Line */}
              <div className="hidden lg:block absolute top-8 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 -translate-x-1/2" />
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step) => (
                  <div key={step.stepNumber} className="relative">
                    <StepCard
                      stepNumber={step.stepNumber}
                      title={step.title}
                      description={step.description}
                    />
                  </div>
                ))}
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
                  Start Reducing Post-Harvest Losses Today
                </h2>
                <p className="mt-4 text-lg text-green-100 max-w-2xl mx-auto">
                  Join hundreds of farmers who are already using AgroVault to protect their harvest and increase profits
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
