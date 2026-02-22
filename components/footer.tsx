export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">About AgroVault</h3>
            <p className="mt-2 text-xs text-muted-foreground">
              Empowering agricultural stakeholders with real-time storage monitoring and market intelligence.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Features</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Real-time monitoring</li>
              <li>Risk assessment</li>
              <li>Market intelligence</li>
              <li>Geographic insights</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Documentation</li>
              <li>Contact us</li>
              <li>FAQ</li>
              <li>Report issue</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legal</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>Privacy policy</li>
              <li>Terms of service</li>
              <li>Cookie policy</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>© 2024 AgroVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
