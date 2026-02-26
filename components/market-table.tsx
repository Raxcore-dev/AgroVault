import type { MarketData } from '@/lib/data/kenya-market-data'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MarketTableProps {
  data: MarketData[]
}

export function MarketTable({ data }: MarketTableProps) {
  const sortedData = [...data].sort((a, b) => a.crop.localeCompare(b.crop))

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Commodity</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Price</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Change</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Market Trend</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={item.crop}
              className={`transition-colors hover:bg-muted/50 ${index !== sortedData.length - 1 ? 'border-b border-border' : ''}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/8 flex items-center justify-center text-primary font-bold text-sm border border-primary/10">
                    {item.crop.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{item.crop}</div>
                    <div className="text-xs text-muted-foreground">Per {item.unit}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="font-bold text-foreground">
                  {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(item.price)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center font-semibold text-sm ${
                  item.priceChange > 0 ? 'text-primary' : item.priceChange < 0 ? 'text-danger' : 'text-muted-foreground'
                }`}>
                  {item.priceChange > 0 ? '+' : ''}{item.priceChange !== 0 ? item.priceChange.toFixed(0) : '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  item.trend === 'up'
                    ? 'bg-primary/10 text-primary'
                    : item.trend === 'down'
                      ? 'bg-danger/10 text-danger'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {item.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : item.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  <span className="capitalize">{item.trend}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
