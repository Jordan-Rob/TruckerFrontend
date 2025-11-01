import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ELDCanvas } from './ELDCanvas'
import { reverseGeocode } from '../../lib/geocoding'
import { getCoordinatesAtRatio } from '../../lib/routeUtils'
import type { ELDDay, ELDLogInfo } from '../../types'

interface ELDLogCardProps {
	day: ELDDay
	dayIndex: number
	tripData?: {
		current_location?: { lat: number; lon: number }
		pickup_location?: { lat: number; lon: number }
		dropoff_location?: { lat: number; lon: number }
		distance_m?: number
	}
	eldInfo?: ELDLogInfo
	initialDate?: Date
	allDays?: ELDDay[]
	routeGeometry?: any
}

export function ELDLogCard({
	day,
	dayIndex,
	tripData,
	eldInfo,
	initialDate,
	allDays = [],
	routeGeometry,
}: ELDLogCardProps) {
	const [isExpanded, setIsExpanded] = useState(false)
	const [fromName, setFromName] = useState<string>('Loading...')
	const [toName, setToName] = useState<string>('Loading...')

	// Calculate date for this day
	const logDate = day.date
		? new Date(day.date)
		: initialDate
		? new Date(initialDate.getTime() + dayIndex * 24 * 60 * 60 * 1000)
		: new Date()

	const month = String(logDate.getMonth() + 1).padStart(2, '0')
	const dayNum = String(logDate.getDate()).padStart(2, '0')
	const year = logDate.getFullYear()

	// Calculate total driving hours across all days
	const totalDrivingHours = allDays.reduce((sum, d) => {
		const hours = d.segments
			.filter((s: any) => s.status === 3) // Status 3 = Driving
			.reduce((h: number, s: any) => h + (s.end - s.start), 0)
		return sum + hours
	}, 0)

	// Calculate driving hours for this day
	const drivingHours = day.segments
		.filter(s => s.status === 3) // Status 3 = Driving
		.reduce((sum, s) => sum + (s.end - s.start), 0)

	// Calculate cumulative driving hours up to (but not including) this day
	const cumulativeHoursBefore = allDays
		.slice(0, dayIndex)
		.reduce((sum, d) => {
			const hours = d.segments
				.filter((s: any) => s.status === 3)
				.reduce((h: number, s: any) => h + (s.end - s.start), 0)
			return sum + hours
		}, 0)

	// Calculate distance for this day based on driving hours ratio
	const totalDistanceMiles = tripData?.distance_m ? tripData.distance_m / 1609.34 : 0
	const distanceRatio = totalDrivingHours > 0 ? drivingHours / totalDrivingHours : 0
	const drivingMilesToday = totalDistanceMiles > 0 
		? Math.round(totalDistanceMiles * distanceRatio)
		: Math.round(drivingHours * 55) // Fallback: estimate at 55 mph

	// Calculate cumulative distance up to and including this day
	const cumulativeDistanceToday = totalDistanceMiles > 0
		? Math.round(totalDistanceMiles * ((cumulativeHoursBefore + drivingHours) / totalDrivingHours))
		: Math.round((cumulativeHoursBefore + drivingHours) * 55)
	const totalMileageToday = cumulativeDistanceToday

	// Get from/to locations
	useEffect(() => {
		async function fetchLocationNames() {
			let fromCoord: { lat: number; lon: number } | null = null
			let toCoord: { lat: number; lon: number } | null = null

			// Calculate distance ratios for this day
			const totalDrivingHours = allDays.reduce((sum, d) => {
				const hours = d.segments
					.filter((s: any) => s.status === 3)
					.reduce((h: number, s: any) => h + (s.end - s.start), 0)
				return sum + hours
			}, 0)

			const cumulativeHoursBefore = allDays
				.slice(0, dayIndex)
				.reduce((sum, d) => {
					const hours = d.segments
						.filter((s: any) => s.status === 3)
						.reduce((h: number, s: any) => h + (s.end - s.start), 0)
					return sum + hours
				}, 0)

			const cumulativeHoursAfter = cumulativeHoursBefore + drivingHours

			// Calculate ratio along route
			const startRatio = totalDrivingHours > 0 ? cumulativeHoursBefore / totalDrivingHours : 0
			const endRatio = totalDrivingHours > 0 ? cumulativeHoursAfter / totalDrivingHours : 0

			// First day: use actual locations
			if (dayIndex === 0) {
				if (day.from_location) {
					fromCoord = { lat: day.from_location.lat, lon: day.from_location.lon }
				} else if (tripData?.current_location) {
					fromCoord = tripData.current_location
				} else if (tripData?.pickup_location) {
					fromCoord = tripData.pickup_location
				}
			} else {
				// Subsequent days: use where previous day's driving stopped
				if (routeGeometry && startRatio > 0) {
					fromCoord = getCoordinatesAtRatio(routeGeometry, startRatio)
				}
			}

			// Last day: use dropoff, otherwise calculate from route
			if (dayIndex === allDays.length - 1) {
				if (day.to_location) {
					toCoord = { lat: day.to_location.lat, lon: day.to_location.lon }
				} else if (tripData?.dropoff_location) {
					toCoord = tripData.dropoff_location
				}
			} else {
				// Intermediate days: use where this day's driving stops
				if (routeGeometry && endRatio > 0) {
					toCoord = getCoordinatesAtRatio(routeGeometry, endRatio)
				} else if (tripData?.pickup_location) {
					toCoord = tripData.pickup_location
				}
			}

			// Fallback for first day "to"
			if (!toCoord && dayIndex === 0 && tripData?.pickup_location) {
				toCoord = tripData.pickup_location
			}

			if (fromCoord) {
				try {
					const fromInfo = await reverseGeocode(fromCoord.lat, fromCoord.lon)
					setFromName(fromInfo.name)
				} catch {
					setFromName(`${fromCoord.lat.toFixed(4)}, ${fromCoord.lon.toFixed(4)}`)
				}
			} else {
				setFromName('N/A')
			}

			if (toCoord) {
				try {
					const toInfo = await reverseGeocode(toCoord.lat, toCoord.lon)
					setToName(toInfo.name)
				} catch {
					setToName(`${toCoord.lat.toFixed(4)}, ${toCoord.lon.toFixed(4)}`)
				}
			} else {
				setToName('N/A')
			}
		}

		fetchLocationNames()
	}, [day, dayIndex, tripData, allDays, routeGeometry, drivingHours])

	return (
		<div className="rounded-lg border border-border bg-background overflow-hidden">
			{/* Collapsed Header */}
			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className="w-full px-6 py-4 border-b border-border flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
			>
				<div className="flex-1 grid grid-cols-4 gap-4 items-center">
					<div>
						<div className="text-xs text-muted-foreground mb-1">Date</div>
						<div className="font-semibold text-foreground">
							{month}/{dayNum}/{year}
						</div>
					</div>
					<div>
						<div className="text-xs text-muted-foreground mb-1">From</div>
						<div className="font-medium text-foreground text-sm truncate">
							{fromName}
						</div>
					</div>
					<div>
						<div className="text-xs text-muted-foreground mb-1">To</div>
						<div className="font-medium text-foreground text-sm truncate">{toName}</div>
					</div>
					<div>
						<div className="text-xs text-muted-foreground mb-1">Driving Miles</div>
						<div className="font-medium text-foreground">{drivingMilesToday} mi</div>
					</div>
				</div>
				<div className="ml-4">
					{isExpanded ? (
						<ChevronUp className="w-5 h-5 text-muted-foreground" />
					) : (
						<ChevronDown className="w-5 h-5 text-muted-foreground" />
					)}
				</div>
			</button>

			{/* Expanded Content */}
			{isExpanded && (
				<div className="p-6 space-y-6">
					{/* ELD Canvas */}
					<div>
						<h4 className="text-sm font-semibold text-foreground mb-3">
							Hours of Service Log
						</h4>
						<ELDCanvas segments={day.segments} />
					</div>

					{/* Driver's Log Information */}
					<div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
						<div className="space-y-4">
							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									Date
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										value={month}
										readOnly
										className="w-16 px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
										placeholder="MM"
									/>
									<input
										type="text"
										value={dayNum}
										readOnly
										className="w-16 px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
										placeholder="DD"
									/>
									<input
										type="text"
										value={year}
										readOnly
										className="w-24 px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
										placeholder="YYYY"
									/>
								</div>
							</div>

							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									From
								</label>
								<input
									type="text"
									value={fromName}
									readOnly
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									To
								</label>
								<input
									type="text"
									value={toName}
									readOnly
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									Total Miles Driving Today
								</label>
								<input
									type="text"
									value={`${drivingMilesToday} mi`}
									readOnly
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									Total Mileage Today
								</label>
								<input
									type="text"
									value={`${totalMileageToday} mi`}
									readOnly
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm"
								/>
							</div>
						</div>

						<div className="space-y-4">
							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									Truck and Trailer Number
								</label>
								<input
									type="text"
									defaultValue={eldInfo?.truck_trailer_number || 'TRK-2024-001 / TRL-2024-001'}
									placeholder="Enter truck/trailer number"
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									Name of Carrier
								</label>
								<input
									type="text"
									defaultValue={eldInfo?.carrier_name || 'Acme Transport Solutions'}
									placeholder="Enter carrier name"
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									Home Office Address
								</label>
								<textarea
									defaultValue={eldInfo?.home_office_address || '123 Main Street, Suite 100\nSpringfield, IL 62701'}
									placeholder="Enter home office address"
									rows={2}
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
								/>
							</div>

							<div>
								<label className="text-xs font-medium text-muted-foreground mb-1 block">
									Home Terminal Address
								</label>
								<textarea
									defaultValue={eldInfo?.home_terminal_address || '456 Industrial Blvd\nSpringfield, IL 62702'}
									placeholder="Enter home terminal address"
									rows={2}
									className="w-full px-3 py-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
								/>
							</div>
						</div>
					</div>

					{day.note && (
						<div className="pt-4 border-t border-border">
							<div className="text-xs text-orange-600 font-medium">{day.note}</div>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

