import type { MarketData } from '@/lib/data/kenya-market-data'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface MarketTableProps {
  data: MarketData[]
}

export function MarketTable({ data }: MarketTableProps) {
  // Sort data alphabetically by crop
  const sortedData = [...data].sort((a, b) => a.crop.localeCompare(b.crop))

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Commodity</th>
            <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Current Price</th>
            <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Change</th>
            <th className="px-6 py-4 text-sm font-semibold text-muted-foreground">Market Trend</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={item.crop}
              className={`group transition-colors hover:bg-muted/10 ${index !== sortedData.length - 1 ? 'border-b border-border' : ''}`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner border border-primary/20">
                    {item.crop.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{item.crop}</div>
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
                <span
                  className={`inline-flex items-center font-semibold ${item.priceChange > 0
                    ? 'text-emerald-500'
                    : item.priceChange < 0
                      ? 'text-red-500'
                      : 'text-muted-foreground'
                    }`}
                >
                  {item.priceChange > 0 ? '+' : ''}{item.priceChange !== 0 ? item.priceChange.toFixed(0) : '-'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${item.trend === 'up'
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : item.trend === 'down'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-muted/50 text-muted-foreground border-border/50'
                    }`}
                >
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
