import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { TripForm } from '../TripForm'
import { api } from '../../../lib/api'

// Mock the API
vi.mock('../../../lib/api', () => ({
	api: {
		post: vi.fn(),
	},
}))

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>
			<BrowserRouter>{children}</BrowserRouter>
		</QueryClientProvider>
	)
}

describe('TripForm', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders form fields with default values', () => {
		render(<TripForm />, { wrapper: createWrapper() })

		// Find inputs by their label text (they're wrapped in labels)
		const currentLat = screen.getByLabelText(/current lat/i)
		const currentLon = screen.getByLabelText(/current lon/i)
		const pickupLat = screen.getByLabelText(/pickup lat/i)
		const pickupLon = screen.getByLabelText(/pickup lon/i)
		const dropoffLat = screen.getByLabelText(/dropoff lat/i)
		const dropoffLon = screen.getByLabelText(/dropoff lon/i)
		const cycleHours = screen.getByLabelText(/cycle hours used/i)
		
		// HTML input values may be formatted differently, check numeric equivalence
		const checkValue = (input: HTMLElement, expected: number, precision = 4) => {
			const inputElement = input as HTMLInputElement
			const value = parseFloat(inputElement.value || '0')
			expect(value).toBeCloseTo(expected, precision)
		}

		checkValue(currentLat, 40.7128)
		checkValue(currentLon, -74.0060)
		checkValue(pickupLat, 39.9526)
		checkValue(pickupLon, -75.1652)
		checkValue(dropoffLat, 41.8781)
		checkValue(dropoffLon, -87.6298)
		checkValue(cycleHours, 10, 0)
		expect(screen.getByLabelText(/save trip/i)).toBeChecked()
	})

	it('allows user to input values', async () => {
		const user = userEvent.setup()
		render(<TripForm />, { wrapper: createWrapper() })

		// Find input by label
		const currentLatInput = screen.getByLabelText(/current lat/i)
		await user.clear(currentLatInput)
		await user.type(currentLatInput, '37.7749')

		// HTML input values are strings, so check as string
		expect(currentLatInput).toHaveValue('37.7749')
	})

	it('submits form with correct payload', async () => {
		const user = userEvent.setup()
		const mockResponse = {
			data: {
				distance_m: 160934,
				duration_s: 36000,
				geometry: { type: 'LineString', coordinates: [] },
			},
		}

		vi.mocked(api.post).mockResolvedValue(mockResponse)

		render(<TripForm />, { wrapper: createWrapper() })

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith(
				'/api/plan_trip/?save=1',
				expect.objectContaining({
					current_location: { lat: 40.7128, lon: -74.0060 },
					pickup_location: { lat: 39.9526, lon: -75.1652 },
					dropoff_location: { lat: 41.8781, lon: -87.6298 },
					current_cycle_hours_used: 10,
				})
			)
		})
	})

	it('submits without save parameter when persist is unchecked', async () => {
		const user = userEvent.setup()
		const mockResponse = {
			data: {
				distance_m: 160934,
				duration_s: 36000,
				geometry: { type: 'LineString', coordinates: [] },
			},
		}

		vi.mocked(api.post).mockResolvedValue(mockResponse)

		render(<TripForm />, { wrapper: createWrapper() })

		const persistCheckbox = screen.getByLabelText(/save trip/i)
		await user.click(persistCheckbox)

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(api.post).toHaveBeenCalledWith(
				'/api/plan_trip/',
				expect.any(Object)
			)
		})
	})

	it('displays loading state during submission', async () => {
		const user = userEvent.setup()
		const mockResponse = {
			data: {
				distance_m: 160934,
				duration_s: 36000,
				geometry: { type: 'LineString', coordinates: [] },
			},
		}

		// Delay the response
		vi.mocked(api.post).mockImplementation(
			() =>
				new Promise(resolve =>
					setTimeout(() => resolve(mockResponse), 100)
				)
		)

		render(<TripForm />, { wrapper: createWrapper() })

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		expect(screen.getByRole('button', { name: /planning/i })).toBeDisabled()

		await waitFor(() => {
			expect(screen.queryByRole('button', { name: /planning/i })).not.toBeInTheDocument()
		})
	})

	it('displays error message on API failure', async () => {
		const user = userEvent.setup()
		const errorResponse = {
			response: {
				data: {
					detail: 'OpenRouteService API key not configured',
				},
			},
		}

		vi.mocked(api.post).mockRejectedValue(errorResponse)

		render(<TripForm />, { wrapper: createWrapper() })

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/error/i)).toBeInTheDocument()
			expect(
				screen.getByText(/OpenRouteService API key not configured/i)
			).toBeInTheDocument()
		})
	})

	it('displays error tip for ORS_API_KEY errors', async () => {
		const user = userEvent.setup()
		const errorResponse = {
			response: {
				data: {
					detail: 'OpenRouteService API key not configured. Please set ORS_API_KEY',
				},
			},
		}

		vi.mocked(api.post).mockRejectedValue(errorResponse)

		render(<TripForm />, { wrapper: createWrapper() })

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(
				screen.getByText(/tip: add your openrouteservice api key/i)
			).toBeInTheDocument()
		})
	})

	it('calls onPlanned callback on successful submission', async () => {
		const user = userEvent.setup()
		const mockResponse = {
			data: {
				distance_m: 160934,
				duration_s: 36000,
				geometry: { type: 'LineString', coordinates: [] },
				trip: { id: 123 },
			},
		}

		vi.mocked(api.post).mockResolvedValue(mockResponse)

		const onPlanned = vi.fn()
		render(<TripForm onPlanned={onPlanned} />, { wrapper: createWrapper() })

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(onPlanned).toHaveBeenCalled()
		})
	})

	it('displays trip results after successful submission', async () => {
		const user = userEvent.setup()
		const mockResponse = {
			data: {
				distance_m: 160934, // 100 miles
				duration_s: 36000, // 10 hours
				geometry: { type: 'LineString', coordinates: [] },
			},
		}

		vi.mocked(api.post).mockResolvedValue(mockResponse)

		render(<TripForm />, { wrapper: createWrapper() })

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText(/trip results/i)).toBeInTheDocument()
			expect(screen.getByText(/100.0 mi/i)).toBeInTheDocument()
			expect(screen.getByText(/10.0 h/i)).toBeInTheDocument()
		})
	})

	it('validates numeric inputs', async () => {
		const user = userEvent.setup()
		render(<TripForm />, { wrapper: createWrapper() })

		// Find input by label
		const currentLatInput = screen.getByLabelText(/current lat/i)
		await user.clear(currentLatInput)
		await user.type(currentLatInput, '37.7749')

		// Form should submit with valid numeric value
		const mockResponse = {
			data: {
				distance_m: 160934,
				duration_s: 36000,
				geometry: { type: 'LineString', coordinates: [] },
			},
		}

		vi.mocked(api.post).mockResolvedValue(mockResponse)

		const submitButton = screen.getByRole('button', { name: /plan trip/i })
		await user.click(submitButton)

		// React Hook Form + Zod will handle validation
		await waitFor(() => {
			expect(api.post).toHaveBeenCalled()
		})
	})
})

