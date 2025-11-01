import { useState } from 'react'
import { TripForm, RouteMap, ELDLogCard } from '../features'
import type { TripPlanResult, ELDDay, ELDLogInfo } from '../../types'
import { api } from '../../lib/api'

export function PlanTripPage() {
	const [routeGeojson, setRouteGeojson] = useState<any | null>(null)
	const [logs, setLogs] = useState<{ days: ELDDay[] } | null>(null)
	const [tripPlanData, setTripPlanData] = useState<any | null>(null)
	const [eldInfo] = useState<ELDLogInfo>({
		truck_trailer_number: 'TRK-2024-001 / TRL-2024-001',
		carrier_name: 'Acme Transport Solutions',
		home_office_address: '123 Main Street, Suite 100\nSpringfield, IL 62701',
		home_terminal_address: '456 Industrial Blvd\nSpringfield, IL 62702',
	})

	const handlePlanned = async (result: TripPlanResult, formValues?: any) => {
		const data = result.data || result // Handle both old and new structure
		
		// Store trip plan data for location info
		// Get locations from form values if available, otherwise from trip data
		setTripPlanData({
			current_location: formValues ? {
				lat: formValues.current_lat,
				lon: formValues.current_lon,
			} : (data as any).trip ? {
				lat: (data as any).trip.current_lat,
				lon: (data as any).trip.current_lon,
			} : undefined,
			pickup_location: formValues ? {
				lat: formValues.pickup_lat,
				lon: formValues.pickup_lon,
			} : (data as any).trip ? {
				lat: (data as any).trip.pickup_lat,
				lon: (data as any).trip.pickup_lon,
			} : undefined,
			dropoff_location: formValues ? {
				lat: formValues.dropoff_lat,
				lon: formValues.dropoff_lon,
			} : (data as any).trip ? {
				lat: (data as any).trip.dropoff_lat,
				lon: (data as any).trip.dropoff_lon,
			} : undefined,
			distance_m: data.distance_m,
		})
		
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
						<TripForm 
							onPlanned={(result: TripPlanResult, formValues?: any) => handlePlanned(result, formValues)} 
						/>
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
								<div className="space-y-4">
									{logs.days.map((day: ELDDay, idx: number) => (
										<ELDLogCard
											key={idx}
											day={day}
											dayIndex={idx}
											tripData={tripPlanData}
											eldInfo={eldInfo}
											initialDate={new Date()}
											allDays={logs.days}
											routeGeometry={routeGeojson}
										/>
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

