import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { ELDCanvas } from './ELDCanvas'
import type { ELDDay } from '../../types'

export function LogsViewer() {
	const params = new URLSearchParams(window.location.search)
	const tripId = params.get('trip_id')
	const durationParam = params.get('duration_s')
	
	const { data, isLoading, error } = useQuery({
		queryKey: ['logs', tripId, durationParam],
		queryFn: async () => {
			const qs = tripId ? `?trip_id=${tripId}` : `?duration_s=${durationParam || 3600 * 10}`
			const { data } = await api.get(`/api/eld_logs/${qs}`)
			return data
		},
		enabled: !!(tripId || durationParam),
	})

	if (isLoading) {
		return <div className="text-center py-8 text-muted-foreground">Loading ELD logs...</div>
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-300 bg-red-50 p-4">
				<p className="text-sm text-red-700">Failed to load ELD logs: {String(error)}</p>
			</div>
		)
	}

	if (!data?.days || data.days.length === 0) {
		return (
			<div className="text-center py-8 text-muted-foreground">
				No ELD logs available. Plan a trip to generate logs.
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{data.days.map((day: ELDDay, idx: number) => (
				<div key={idx} className="rounded-lg border border-border bg-background">
					<div className="px-6 py-4 border-b border-border flex items-center justify-between">
						<div className="font-semibold text-foreground">Day {idx + 1}</div>
						<div className="text-xs text-muted-foreground">
							Segments: {day.segments?.length || 0}
							{day.note && (
								<span className="ml-2 text-orange-600">({day.note})</span>
							)}
						</div>
					</div>
					<div className="p-4">
						<ELDCanvas segments={day.segments || []} />
					</div>
				</div>
			))}
		</div>
	)
}

