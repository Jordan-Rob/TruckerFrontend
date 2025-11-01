import { z } from 'zod'

export const tripFormSchema = z.object({
	current_lat: z.coerce.number(),
	current_lon: z.coerce.number(),
	pickup_lat: z.coerce.number(),
	pickup_lon: z.coerce.number(),
	dropoff_lat: z.coerce.number(),
	dropoff_lon: z.coerce.number(),
	current_cycle_hours_used: z.coerce.number().min(0),
	persist: z.boolean().optional(),
})

export type TripFormValues = z.infer<typeof tripFormSchema>

export interface ELDSegment {
	start: number
	end: number
	status: number
}

export interface ELDDay {
	segments: ELDSegment[]
	note?: string
}

export interface TripPlanResult {
	data: {
		distance_m: number
		duration_s: number
		geometry: any
		segments?: any[]
		stops?: any
		current_cycle_hours_used?: number
		trip?: {
			id: number
			[key: string]: any
		}
	}
	current_cycle_hours_used: number
}

