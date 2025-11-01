import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { tripFormSchema, type TripFormValues, type TripPlanResult } from '../../types'
import { api } from '../../lib/api'

interface TripFormProps {
	onPlanned?: (result: TripPlanResult) => void
}

export function TripForm({ onPlanned }: TripFormProps) {
	const { register, handleSubmit } = useForm<TripFormValues>({
		resolver: zodResolver(tripFormSchema) as any,
		defaultValues: {
			current_lat: 40.7128,
			current_lon: -74.0060,
			pickup_lat: 39.9526,
			pickup_lon: -75.1652,
			dropoff_lat: 41.8781,
			dropoff_lon: -87.6298,
			current_cycle_hours_used: 10,
			persist: true,
		},
	})

	const [result, setResult] = useState<any>(null)
	const planMutation = useMutation({
		mutationFn: async (values: TripFormValues): Promise<TripPlanResult> => {
			const payload = {
				current_location: { lat: values.current_lat, lon: values.current_lon },
				pickup_location: { lat: values.pickup_lat, lon: values.pickup_lon },
				dropoff_location: { lat: values.dropoff_lat, lon: values.dropoff_lon },
				current_cycle_hours_used: values.current_cycle_hours_used,
			}
			const url = values.persist ? '/api/plan_trip/?save=1' : '/api/plan_trip/'
			const { data } = await api.post(url, payload)
			return { data, current_cycle_hours_used: values.current_cycle_hours_used }
		},
		onSuccess: (result) => {
			setResult(result.data)
			onPlanned && onPlanned(result)
		},
	})

	return (
		<div className="space-y-6">
			<form
				onSubmit={handleSubmit((v: TripFormValues) => planMutation.mutate(v))}
				className="space-y-4 rounded-lg border border-border p-6 bg-background"
			>
				<h3 className="text-lg font-semibold text-foreground mb-4">Trip Details</h3>
				<div className="grid grid-cols-2 gap-4">
					<label className="text-sm font-medium text-foreground">
						Current Lat
						<input
							className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							{...register('current_lat')}
						/>
					</label>
					<label className="text-sm font-medium text-foreground">
						Current Lon
						<input
							className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							{...register('current_lon')}
						/>
					</label>
					<label className="text-sm font-medium text-foreground">
						Pickup Lat
						<input
							className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							{...register('pickup_lat')}
						/>
					</label>
					<label className="text-sm font-medium text-foreground">
						Pickup Lon
						<input
							className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							{...register('pickup_lon')}
						/>
					</label>
					<label className="text-sm font-medium text-foreground">
						Dropoff Lat
						<input
							className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							{...register('dropoff_lat')}
						/>
					</label>
					<label className="text-sm font-medium text-foreground">
						Dropoff Lon
						<input
							className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							{...register('dropoff_lon')}
						/>
					</label>
					<label className="text-sm font-medium text-foreground col-span-2">
						Cycle Hours Used
						<input
							className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
							{...register('current_cycle_hours_used')}
						/>
					</label>
					<label className="flex items-center gap-2 text-sm text-foreground col-span-2">
						<input
							type="checkbox"
							className="rounded border-border"
							{...register('persist')}
						/>
						Save trip
					</label>
				</div>
				<button
					disabled={planMutation.isPending}
					className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
				>
					{planMutation.isPending ? 'Planning…' : 'Plan Trip'}
				</button>
			</form>

			{planMutation.isError && (
				<div className="rounded-lg border border-red-300 bg-red-50 p-4">
					<h3 className="text-sm font-semibold text-red-800 mb-2">Error</h3>
					<p className="text-sm text-red-700">
						{(planMutation.error as any)?.response?.data?.detail ||
							planMutation.error?.message ||
							'Failed to plan trip. Please try again.'}
					</p>
					{(planMutation.error as any)?.response?.data?.detail?.includes('ORS_API_KEY') && (
						<p className="text-xs text-red-600 mt-2">
							Tip: Add your OpenRouteService API key to backend/.env file as ORS_API_KEY
						</p>
					)}
				</div>
			)}

			{result && (
				<div className="rounded-lg border border-border p-6 bg-background">
					<h3 className="text-lg font-semibold text-foreground mb-4">Trip Results</h3>
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="text-foreground">
							<span className="text-muted-foreground">Distance:</span>{' '}
							<span className="font-medium">
								{(result.distance_m / 1609.34).toFixed(1)} mi
							</span>
						</div>
						<div className="text-foreground">
							<span className="text-muted-foreground">Duration:</span>{' '}
							<span className="font-medium">
								{(result.duration_s / 3600).toFixed(1)} h
							</span>
						</div>
						{result.trip?.id && (
							<div className="col-span-2">
								<Link
									to={`/logs?trip_id=${result.trip.id}`}
									className="text-primary hover:underline font-medium"
								>
									View ELD logs →
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	)
}

