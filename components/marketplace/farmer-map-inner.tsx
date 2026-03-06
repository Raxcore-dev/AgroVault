/**
 * Farmer Map Inner Component
 * 
 * This file is dynamically imported by farmer-map.tsx to avoid SSR issues
 * with Leaflet (which requires the `window` object).
 */

'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix the default marker icon paths for Leaflet in bundled environments
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

interface FarmerMapInnerProps {
  latitude: number
  longitude: number
  farmerName: string
  locationName: string
}

export function FarmerMapInner({ latitude, longitude, farmerName, locationName }: FarmerMapInnerProps) {
  return (
    <div className="h-[300px] rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">{farmerName}</p>
              <p className="text-xs text-gray-500">{locationName}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
