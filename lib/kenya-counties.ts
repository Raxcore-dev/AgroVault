/**
 * All 47 Kenya counties with their headquarters coordinates.
 * Coordinates are for the county headquarters (HQ) town.
 */

export interface KenyaCounty {
  name: string       // Official county name
  hq: string         // Headquarters town
  lat: number
  lon: number
  /** normalised key used for coordinate lookup */
  key: string
}

export const KENYA_COUNTIES: KenyaCounty[] = [
  { name: 'Mombasa',          hq: 'Mombasa City',   lat: -4.0435,  lon: 39.6682, key: 'mombasa' },
  { name: 'Kwale',            hq: 'Kwale Town',     lat: -4.1720,  lon: 39.4523, key: 'kwale' },
  { name: 'Kilifi',           hq: 'Kilifi Town',    lat: -3.6305,  lon: 39.8499, key: 'kilifi' },
  { name: 'Tana River',       hq: 'Hola',           lat: -1.4980,  lon: 40.0300, key: 'tana river' },
  { name: 'Lamu',             hq: 'Lamu Town',      lat: -2.2686,  lon: 40.9020, key: 'lamu' },
  { name: 'Taita-Taveta',     hq: 'Wundanyi',       lat: -3.3943,  lon: 38.3607, key: 'taita-taveta' },
  { name: 'Garissa',          hq: 'Garissa Town',   lat: -0.4536,  lon: 42.1355, key: 'garissa' },
  { name: 'Wajir',            hq: 'Wajir Town',     lat: 1.7471,   lon: 40.0573, key: 'wajir' },
  { name: 'Mandera',          hq: 'Mandera Town',   lat: 3.9373,   lon: 41.8569, key: 'mandera' },
  { name: 'Marsabit',         hq: 'Marsabit Town',  lat: 2.3284,   lon: 37.9947, key: 'marsabit' },
  { name: 'Isiolo',           hq: 'Isiolo Town',    lat: 0.3540,   lon: 37.5820, key: 'isiolo' },
  { name: 'Meru',             hq: 'Meru Town',      lat: 0.0515,   lon: 37.6559, key: 'meru' },
  { name: 'Tharaka-Nithi',    hq: 'Chuka',          lat: -0.3390,  lon: 37.6480, key: 'tharaka-nithi' },
  { name: 'Embu',             hq: 'Embu Town',      lat: -0.5389,  lon: 37.4596, key: 'embu' },
  { name: 'Kitui',            hq: 'Kitui Town',     lat: -1.3670,  lon: 38.0100, key: 'kitui' },
  { name: 'Machakos',         hq: 'Machakos Town',  lat: -1.5177,  lon: 37.2634, key: 'machakos' },
  { name: 'Makueni',          hq: 'Wote',           lat: -1.7895,  lon: 37.6257, key: 'makueni' },
  { name: 'Nyandarua',        hq: 'Ol Kalou',       lat: -0.2660,  lon: 36.3791, key: 'nyandarua' },
  { name: 'Nyeri',            hq: 'Nyeri Town',     lat: -0.4197,  lon: 36.9511, key: 'nyeri' },
  { name: 'Kirinyaga',        hq: 'Kerugoya',       lat: -0.4974,  lon: 37.2805, key: 'kirinyaga' },
  { name: "Murang'a",         hq: "Murang'a Town",  lat: -0.7195,  lon: 37.1504, key: "murang'a" },
  { name: 'Kiambu',           hq: 'Kiambu Town',    lat: -1.1716,  lon: 36.8350, key: 'kiambu' },
  { name: 'Turkana',          hq: 'Lodwar',         lat: 3.1193,   lon: 35.5966, key: 'turkana' },
  { name: 'West Pokot',       hq: 'Kapenguria',     lat: 1.2390,   lon: 35.1125, key: 'west pokot' },
  { name: 'Samburu',          hq: 'Maralal',        lat: 1.0983,   lon: 36.6988, key: 'samburu' },
  { name: 'Trans Nzoia',      hq: 'Kitale',         lat: 1.0187,   lon: 35.0020, key: 'trans nzoia' },
  { name: 'Uasin Gishu',      hq: 'Eldoret',        lat: 0.5143,   lon: 35.2698, key: 'uasin gishu' },
  { name: 'Elgeyo-Marakwet',  hq: 'Iten',           lat: 0.6713,   lon: 35.5093, key: 'elgeyo-marakwet' },
  { name: 'Nandi',            hq: 'Kapsabet',       lat: 0.2049,   lon: 35.0994, key: 'nandi' },
  { name: 'Baringo',          hq: 'Kabarnet',       lat: 0.4896,   lon: 35.7428, key: 'baringo' },
  { name: 'Laikipia',         hq: 'Nanyuki',        lat: 0.0066,   lon: 37.0722, key: 'laikipia' },
  { name: 'Nakuru',           hq: 'Nakuru Town',    lat: -0.3031,  lon: 36.0800, key: 'nakuru' },
  { name: 'Narok',            hq: 'Narok Town',     lat: -1.0800,  lon: 35.8690, key: 'narok' },
  { name: 'Kajiado',          hq: 'Kajiado Town',   lat: -1.8534,  lon: 36.7773, key: 'kajiado' },
  { name: 'Kericho',          hq: 'Kericho Town',   lat: -0.3692,  lon: 35.2863, key: 'kericho' },
  { name: 'Bomet',            hq: 'Bomet Town',     lat: -0.7823,  lon: 35.3416, key: 'bomet' },
  { name: 'Kakamega',         hq: 'Kakamega Town',  lat: 0.2827,   lon: 34.7519, key: 'kakamega' },
  { name: 'Vihiga',           hq: 'Mbale',          lat: 0.0666,   lon: 34.7233, key: 'vihiga' },
  { name: 'Bungoma',          hq: 'Bungoma Town',   lat: 0.5635,   lon: 34.5607, key: 'bungoma' },
  { name: 'Busia',            hq: 'Busia Town',     lat: 0.4608,   lon: 34.1112, key: 'busia' },
  { name: 'Siaya',            hq: 'Siaya Town',     lat: -0.0612,  lon: 34.2880, key: 'siaya' },
  { name: 'Kisumu',           hq: 'Kisumu City',    lat: -0.0917,  lon: 34.7680, key: 'kisumu' },
  { name: 'Homa Bay',         hq: 'Homa Bay Town',  lat: -0.5272,  lon: 34.4572, key: 'homa bay' },
  { name: 'Migori',           hq: 'Migori Town',    lat: -1.0634,  lon: 34.4731, key: 'migori' },
  { name: 'Kisii',            hq: 'Kisii Town',     lat: -0.6817,  lon: 34.7665, key: 'kisii' },
  { name: 'Nyamira',          hq: 'Nyamira Town',   lat: -0.5671,  lon: 34.9352, key: 'nyamira' },
  { name: 'Nairobi',          hq: 'Nairobi City',   lat: -1.2921,  lon: 36.8219, key: 'nairobi' },
]

/** Sorted county names for UI dropdowns */
export const COUNTY_NAMES: string[] = KENYA_COUNTIES.map(c => c.name).sort((a, b) =>
  a.localeCompare(b),
)

/** Fast coordinate lookup by county key */
export const COUNTY_COORDS: Record<string, { lat: number; lon: number }> =
  Object.fromEntries(KENYA_COUNTIES.map(c => [c.key, { lat: c.lat, lon: c.lon }]))
