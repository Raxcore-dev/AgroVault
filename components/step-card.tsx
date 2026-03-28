interface StepCardProps {
  stepNumber: number
  title: string
  description: string
}

export function StepCard({ stepNumber, title, description }: StepCardProps) {
  return (
    <div className="relative flex flex-col items-center text-center p-6">
      {/* Step Number Circle */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white text-xl font-semibold">
        {stepNumber}
      </div>
      
      {/* Content */}
      <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">{description}</p>
    </div>
  )
}
