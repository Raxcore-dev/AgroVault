/**
 * Farmer Location Map Component
 * 
 * Renders an interactive OpenStreetMap showing the farmer's location.
 * Uses Leaflet + react-leaflet. Displayed on the product details page
 * so buyers can see where the farm is located.
 * 
 * Props:
 *   - latitude: GPS latitude
 *   - longitude: GPS longitude
 *   - farmerName: Name shown in the popup
 *   - locationName: Display name of the location
 */

'use client'

import { useEffect, useState } from 'react'

interface FarmerMapProps {
  latitude: number
  longitude: number
  farmerName: string
  locationName: string
}

export function FarmerMap({ latitude, longitude, farmerName, locationName }: FarmerMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<FarmerMapProps> | null>(null)

  // Dynamically import Leaflet components (they require window/document)
  useEffect(() => {
    import('./farmer-map-inner').then((mod) => {
      setMapComponent(() => mod.FarmerMapInner)
    })
  }, [])

  if (!MapComponent) {
    return (
      <div className="h-[300px] rounded-lg bg-muted flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return <MapComponent latitude={latitude} longitude={longitude} farmerName={farmerName} locationName={locationName} />
}
