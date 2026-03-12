import { redirect } from 'next/navigation'

/**
 * /marketplace — redirects to /market-intelligence
 * The marketplace feature has been replaced by the Market Intelligence module.
 */
export default function MarketplacePage() {
  redirect('/market-intelligence')
}
