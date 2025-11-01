/**
 * Utilities for calculating positions along a route
 */

/**
 * Get coordinates at a specific distance ratio along the route
 * @param routeGeometry - GeoJSON FeatureCollection or Feature with LineString/MultiLineString
 * @param ratio - Ratio from 0 to 1 (0 = start, 1 = end)
 * @returns { lat: number, lon: number } or null
 */
export function getCoordinatesAtRatio(
	routeGeometry: any,
	ratio: number
): { lat: number; lon: number } | null {
	if (!routeGeometry) return null

	// Extract coordinates from GeoJSON
	let coordinates: number[][] = []
	
	try {
		if (routeGeometry.type === 'FeatureCollection' && routeGeometry.features) {
			// Get first feature's geometry
			const feature = routeGeometry.features[0]
			if (feature?.geometry) {
				if (feature.geometry.type === 'LineString') {
					coordinates = feature.geometry.coordinates
				} else if (feature.geometry.type === 'MultiLineString') {
					coordinates = feature.geometry.coordinates.flat()
				}
			}
		} else if (routeGeometry.type === 'Feature' && routeGeometry.geometry) {
			if (routeGeometry.geometry.type === 'LineString') {
				coordinates = routeGeometry.geometry.coordinates
			} else if (routeGeometry.geometry.type === 'MultiLineString') {
				coordinates = routeGeometry.geometry.coordinates.flat()
			}
		} else if (routeGeometry.type === 'LineString') {
			coordinates = routeGeometry.coordinates
		} else if (routeGeometry.type === 'MultiLineString') {
			coordinates = routeGeometry.coordinates.flat()
		}
	} catch (e) {
		console.error('Error extracting coordinates:', e)
		return null
	}

	if (!coordinates || coordinates.length === 0) return null

	// Clamp ratio to [0, 1]
	const clampedRatio = Math.max(0, Math.min(1, ratio))

	// Calculate index
	const index = clampedRatio * (coordinates.length - 1)
	const lowerIndex = Math.floor(index)
	const upperIndex = Math.min(coordinates.length - 1, lowerIndex + 1)
	const fraction = index - lowerIndex

	// Interpolate between two points
	const lower = coordinates[lowerIndex]
	const upper = coordinates[upperIndex]

	// GeoJSON coordinates are [lon, lat]
	const lon = lower[0] + (upper[0] - lower[0]) * fraction
	const lat = lower[1] + (upper[1] - lower[1]) * fraction

	return { lat, lon }
}

