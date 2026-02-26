export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-primary">About AgroVault</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Empowering agricultural stakeholders with real-time storage monitoring and market intelligence.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Features</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Real-time monitoring</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Risk assessment</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Market intelligence</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Geographic insights</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Support</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Documentation</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Contact us</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>FAQ</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Report issue</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary">Legal</h3>
            <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Privacy policy</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Terms of service</li>
              <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-primary/50"></span>Cookie policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border/40 pt-8 text-center text-xs text-muted-foreground">
          <p>© 2026 <span className="text-primary font-medium">AgroVault</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
