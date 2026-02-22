import type { MarketData } from '@/lib/mock-data'

interface MarketTableProps {
  data: MarketData[]
}

export function MarketTable({ data }: MarketTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted">
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Crop</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Current Price</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Change</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Trend</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.crop} className="border-b border-border hover:bg-muted">
              <td className="px-4 py-3 text-sm text-foreground">{item.crop}</td>
              <td className="px-4 py-3 text-sm font-semibold text-foreground">KES {item.price.toFixed(0)}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`font-semibold ${
                    item.priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {item.priceChange >= 0 ? '+' : ''}{item.priceChange.toFixed(0)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    item.trend === 'up'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : item.trend === 'down'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'
                  }`}
                >
                  {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.trend}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
