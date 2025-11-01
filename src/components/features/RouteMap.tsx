import { useEffect, useRef, useState } from 'react'
import maplibregl, { type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

interface RouteMapProps {
	externalGeojson?: any
}

export function RouteMap({ externalGeojson }: RouteMapProps) {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const mapRef = useRef<maplibregl.Map | null>(null)
	const [geojson, setGeojson] = useState<any | null>(null)

	// Allow external geojson to drive the map
	useEffect(() => {
		if (externalGeojson) setGeojson(externalGeojson)
	}, [externalGeojson])

	// Initialize map
	useEffect(() => {
		if (!containerRef.current || mapRef.current) return

		mapRef.current = new maplibregl.Map({
			container: containerRef.current,
			style: 'https://api.maptiler.com/maps/bright/style.json?key=By9WoELLM6papKOjRM1G',
			center: [-95.7129, 37.0902] as LngLatLike,
			zoom: 3.2,
		})

		// Add navigation controls
		mapRef.current.addControl(new maplibregl.NavigationControl())

		// Cleanup
		return () => {
			if (mapRef.current) {
				mapRef.current.remove()
				mapRef.current = null
			}
		}
	}, [])

	// Update route when geojson changes
	useEffect(() => {
		const map = mapRef.current
		if (!map || !geojson) return

		const updateRoute = () => {
			try {
				// Remove existing route layer if it exists
				if (map.getLayer('route-line')) {
					map.removeLayer('route-line')
				}
				if (map.getSource('route')) {
					map.removeSource('route')
				}

				// Add route source
				map.addSource('route', { type: 'geojson', data: geojson })
				map.addLayer({
					id: 'route-line',
					type: 'line',
					source: 'route',
					paint: {
						'line-color': '#6d5efc',
						'line-width': 4,
					},
				})

				// Fit map to route bounds (LineString or MultiLineString)
				if (geojson.features && geojson.features.length > 0) {
					const bounds = new maplibregl.LngLatBounds()
					geojson.features.forEach((feature: any) => {
						if (feature.geometry && feature.geometry.coordinates) {
							if (feature.geometry.type === 'LineString') {
								feature.geometry.coordinates.forEach((coord: [number, number]) =>
									bounds.extend(coord)
								)
							} else if (feature.geometry.type === 'MultiLineString') {
								feature.geometry.coordinates.forEach((line: [number, number][]) => {
									line.forEach((coord: [number, number]) => bounds.extend(coord))
								})
							}
						}
					})
					if (!bounds.isEmpty()) {
						map.fitBounds(bounds, { padding: 50, maxZoom: 12 })
					}
				}
			} catch (err) {
				console.error('Error updating route:', err)
			}
		}

		// Wait for map to be loaded
		if (map.loaded()) {
			updateRoute()
		} else {
			const handleLoad = () => {
				updateRoute()
				map.off('load', handleLoad)
			}
			map.on('load', handleLoad)
		}
	}, [geojson])

	return (
		<div
			ref={containerRef}
			className="h-[520px] rounded-lg border border-border bg-background"
		/>
	)
}

