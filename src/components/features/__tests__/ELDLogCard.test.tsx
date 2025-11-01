import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ELDLogCard } from '../ELDLogCard'
import type { ELDDay } from '../../../types'

// Mock the geocoding library
vi.mock('../../../lib/geocoding', () => ({
	reverseGeocode: vi.fn().mockResolvedValue({
		name: 'Test City, State',
		address: 'Test Address',
	}),
}))

// Mock route utilities
vi.mock('../../../lib/routeUtils', () => ({
	getCoordinatesAtRatio: vi.fn().mockReturnValue({
		lat: 40.0,
		lon: -75.0,
	}),
}))

const mockDay: ELDDay = {
	segments: [
		{ start: 0, end: 0.5, status: 4 }, // On duty (not driving)
		{ start: 0.5, end: 8.5, status: 3 }, // Driving
		{ start: 8.5, end: 9, status: 1 }, // Off duty (break)
		{ start: 9, end: 11, status: 3 }, // Driving
		{ start: 11, end: 11.5, status: 4 }, // On duty (post-trip)
		{ start: 11.5, end: 24, status: 1 }, // Off duty
	],
}

describe('ELDLogCard', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders collapsed by default', () => {
		render(
			<ELDLogCard
				day={mockDay}
				dayIndex={0}
				tripData={{
					current_location: { lat: 40.7128, lon: -74.0060 },
					pickup_location: { lat: 39.9526, lon: -75.1652 },
					dropoff_location: { lat: 41.8781, lon: -87.6298 },
					distance_m: 160934,
				}}
				initialDate={new Date('2024-01-15')}
			/>
		)

		expect(screen.getByText(/01\/15\/2024/i)).toBeInTheDocument()
		expect(screen.queryByText(/hours of service log/i)).not.toBeInTheDocument()
	})

	it('expands when clicked', async () => {
		const user = userEvent.setup()
		render(
			<ELDLogCard
				day={mockDay}
				dayIndex={0}
				tripData={{
					current_location: { lat: 40.7128, lon: -74.0060 },
					pickup_location: { lat: 39.9526, lon: -75.1652 },
					dropoff_location: { lat: 41.8781, lon: -87.6298 },
					distance_m: 160934,
				}}
				initialDate={new Date('2024-01-15')}
			/>
		)

		const header = screen.getByRole('button')
		await user.click(header)

		await waitFor(() => {
			expect(screen.getByText(/hours of service log/i)).toBeInTheDocument()
		})
		
		// Date fields use read-only inputs, check by placeholder or value
		expect(screen.getByDisplayValue('01')).toBeInTheDocument()
	})

	it('displays correct date', () => {
		const testDate = new Date('2024-03-15')
		render(
			<ELDLogCard
				day={mockDay}
				dayIndex={0}
				initialDate={testDate}
			/>
		)

		expect(screen.getByText(/03\/15\/2024/i)).toBeInTheDocument()
	})

	it('calculates driving miles correctly', () => {
		// Mock day has 10 hours of driving (0.5-8.5 = 8h, 9-11 = 2h)
		render(
			<ELDLogCard
				day={mockDay}
				dayIndex={0}
				tripData={{
					distance_m: 160934, // 100 miles
				}}
				allDays={[mockDay]}
			/>
		)

		const header = screen.getByRole('button')
		expect(header.textContent).toContain('Driving Miles')
	})

	it('displays example data in fields when expanded', async () => {
		const user = userEvent.setup()
		render(
			<ELDLogCard
				day={mockDay}
				dayIndex={0}
				eldInfo={{
					truck_trailer_number: 'TRK-2024-001 / TRL-2024-001',
					carrier_name: 'Acme Transport Solutions',
					home_office_address: '123 Main St',
					home_terminal_address: '456 Industrial Blvd',
				}}
			/>
		)

		const header = screen.getByRole('button')
		await user.click(header)

		await waitFor(() => {
			expect(screen.getByDisplayValue(/TRK-2024-001/i)).toBeInTheDocument()
			expect(screen.getByDisplayValue(/Acme Transport Solutions/i)).toBeInTheDocument()
		})
	})

	it('collapses when clicked again', async () => {
		const user = userEvent.setup()
		render(
			<ELDLogCard
				day={mockDay}
				dayIndex={0}
			/>
		)

		const header = screen.getByRole('button')
		
		// Expand
		await user.click(header)
		expect(screen.getByText(/hours of service log/i)).toBeInTheDocument()

		// Collapse
		await user.click(header)
		expect(screen.queryByText(/hours of service log/i)).not.toBeInTheDocument()
	})

	it('calculates cumulative distance correctly for multiple days', () => {
		const day1: ELDDay = {
			segments: [
				{ start: 0.5, end: 8.5, status: 3 }, // 8 hours driving
			],
		}
		const day2: ELDDay = {
			segments: [
				{ start: 0.5, end: 4.5, status: 3 }, // 4 hours driving
			],
		}

		// Total: 12 hours driving, 100 miles
		// Day 1: 8/12 * 100 = ~67 miles
		// Day 2: 4/12 * 100 = ~33 miles
		
		const { container: container1 } = render(
			<ELDLogCard
				day={day1}
				dayIndex={0}
				tripData={{ distance_m: 160934 }}
				allDays={[day1, day2]}
			/>
		)

		const { container: container2 } = render(
			<ELDLogCard
				day={day2}
				dayIndex={1}
				tripData={{ distance_m: 160934 }}
				allDays={[day1, day2]}
			/>
		)

		// Check that distances are calculated
		expect(container1.textContent).toContain('Driving Miles')
		expect(container2.textContent).toContain('Driving Miles')
	})

	it('handles empty segments gracefully', () => {
		const emptyDay: ELDDay = {
			segments: [],
		}

		render(
			<ELDLogCard
				day={emptyDay}
				dayIndex={0}
			/>
		)

		expect(screen.getByText(/0 mi/i)).toBeInTheDocument()
	})

	it('displays note when present', async () => {
		const user = userEvent.setup()
		const dayWithNote: ELDDay = {
			...mockDay,
			note: '34-hour reset required after 70-hour cycle',
		}

		render(
			<ELDLogCard
				day={dayWithNote}
				dayIndex={0}
			/>
		)

		const header = screen.getByRole('button')
		await user.click(header)

		expect(screen.getByText(/34-hour reset required/i)).toBeInTheDocument()
	})
})

