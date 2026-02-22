export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AgroVault</h1>
            <p className="mt-1 text-sm text-muted-foreground">Agricultural Storage & Market Intelligence</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Real-time Monitoring Dashboard</p>
          </div>
        </div>
      </div>
    </header>
  )
}
