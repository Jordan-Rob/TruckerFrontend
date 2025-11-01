import { useState } from 'react'
import { TripForm } from '../features/TripForm'
import { RouteMap } from '../features/RouteMap'
import { ELDCanvas } from '../features/ELDCanvas'
import type { TripPlanResult, ELDDay } from '../../types'
import { api } from '../../lib/api'

export function PlanTripPage() {
	const [routeGeojson, setRouteGeojson] = useState<any | null>(null)
	const [logs, setLogs] = useState<{ days: ELDDay[] } | null>(null)

	const handlePlanned = async (result: TripPlanResult) => {
		const data = result.data || result // Handle both old and new structure
		// Update route for map – coerce to valid FeatureCollection
		try {
			if (data?.geometry) {
				let fc: any
				const g = data.geometry
				if (g.type && (g.type === 'LineString' || g.type === 'MultiLineString')) {
					fc = {
						type: 'FeatureCollection',
						features: [{ type: 'Feature', geometry: g, properties: {} }],
					}
				} else if (g.type === 'FeatureCollection' && Array.isArray(g.features)) {
					fc = g
				} else {
					console.error('Unexpected geometry shape from API:', g)
				}
				if (fc) setRouteGeojson(fc)
			}
		} catch (e) {
			console.error('Failed to normalize route geometry', e)
		}
		// Fetch logs by trip_id if saved, else by duration (with current_cycle_hours_used)
		const currentCycleHours =
			result.current_cycle_hours_used ?? data?.current_cycle_hours_used ?? 0
		let qs: string
		if (data?.trip?.id) {
			qs = `?trip_id=${data.trip.id}`
		} else {
			qs = `?duration_s=${data.duration_s}`
			if (currentCycleHours > 0) {
				qs += `&current_cycle_hours_used=${currentCycleHours}`
			}
		}
		try {
			const res = await api.get(`/api/eld_logs/${qs}`)
			setLogs(res.data)
		} catch (e) {
			console.error('Failed to fetch logs', e)
		}
	}

	return (
		<div className="bg-background py-12">
			<div className="max-w-6xl mx-auto px-6">
				<h2 className="text-3xl font-semibold text-foreground mb-8">Plan Your Trip</h2>
				<div className="grid lg:grid-cols-3 gap-8">
					<div className="lg:col-span-1">
						<TripForm onPlanned={handlePlanned} />
					</div>
					<div className="lg:col-span-2 space-y-6">
						<div className="bg-background rounded-lg border border-border p-4">
							<h3 className="text-lg font-semibold text-foreground mb-4">Route Map</h3>
							<RouteMap externalGeojson={routeGeojson} />
						</div>
						{logs?.days && (
							<div className="bg-background rounded-lg border border-border p-4">
								<h3 className="text-lg font-semibold text-foreground mb-4">
									Daily ELD Logs
								</h3>
								<div className="space-y-6">
									{logs.days.map((day: ELDDay, idx: number) => (
										<div
											key={idx}
											className="rounded-lg border border-border bg-background"
										>
											<div className="px-6 py-4 border-b border-border flex items-center justify-between">
												<div className="font-semibold text-foreground">Day {idx + 1}</div>
												<div className="text-xs text-muted-foreground">
													Segments: {day.segments.length}
													{day.note && (
														<span className="ml-2 text-orange-600">({day.note})</span>
													)}
												</div>
											</div>
											<div className="p-4">
												<ELDCanvas segments={day.segments} />
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

