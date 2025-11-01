/**
 * Reverse geocoding utility to get location names from coordinates
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 */

export interface LocationInfo {
	name: string
	address?: string
}

const CACHE: Map<string, LocationInfo> = new Map()
const CACHE_KEY = (lat: number, lon: number) => `${lat.toFixed(4)},${lon.toFixed(4)}`

export async function reverseGeocode(
	lat: number,
	lon: number
): Promise<LocationInfo> {
	const cacheKey = CACHE_KEY(lat, lon)
	if (CACHE.has(cacheKey)) {
		return CACHE.get(cacheKey)!
	}

	try {
		const response = await fetch(
			`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
			{
				headers: {
					'User-Agent': 'SpotterAI/1.0',
				},
			}
		)

		if (!response.ok) {
			throw new Error(`Geocoding failed: ${response.statusText}`)
		}

		const data = await response.json()
		const address = data.address || {}
		
		// Build location name from address components
		let name = ''
		if (address.city || address.town || address.village) {
			name = address.city || address.town || address.village
			if (address.state) {
				name += `, ${address.state}`
			}
		} else if (address.road && address.house_number) {
			name = `${address.road} ${address.house_number}`
		} else if (address.road) {
			name = address.road
		} else {
			name = `${lat.toFixed(4)}, ${lon.toFixed(4)}`
		}

		const result: LocationInfo = {
			name,
			address: data.display_name,
		}

		CACHE.set(cacheKey, result)
		return result
	} catch (error) {
		console.error('Reverse geocoding error:', error)
		// Fallback to coordinates
		return {
			name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
		}
	}
}

export async function reverseGeocodeMultiple(
	coordinates: Array<{ lat: number; lon: number }>
): Promise<LocationInfo[]> {
	return Promise.all(
		coordinates.map(coord => reverseGeocode(coord.lat, coord.lon))
	)
}

