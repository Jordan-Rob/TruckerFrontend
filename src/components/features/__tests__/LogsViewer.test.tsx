import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LogsViewer } from '../LogsViewer'
import { api } from '../../../lib/api'

// Mock the API
vi.mock('../../../lib/api', () => ({
	api: {
		get: vi.fn(),
	},
}))

// Mock ELDLogCard to avoid complex dependencies
vi.mock('../ELDLogCard', () => ({
	ELDLogCard: ({ day, dayIndex }: { day: any; dayIndex: number }) => (
		<div data-testid={`eld-card-${dayIndex}`}>Day {dayIndex + 1}</div>
	),
}))

const createWrapper = () => {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	})

	return ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	)
}

describe('LogsViewer', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Mock window.location.search
		Object.defineProperty(window, 'location', {
			writable: true,
			value: {
				search: '?trip_id=1',
			},
		})
	})

	it('displays loading state initially', () => {
		vi.mocked(api.get).mockImplementation(
			() =>
				new Promise(resolve =>
					setTimeout(() => resolve({ data: { days: [] } }), 100)
				)
		)

		render(<LogsViewer />, { wrapper: createWrapper() })

		expect(screen.getByText(/loading eld logs/i)).toBeInTheDocument()
	})

	it('displays error message on API failure', async () => {
		vi.mocked(api.get).mockRejectedValue(new Error('API Error'))

		render(<LogsViewer />, { wrapper: createWrapper() })

		await waitFor(() => {
			expect(screen.getByText(/failed to load eld logs/i)).toBeInTheDocument()
		})
	})

	it('displays empty state when no logs available', async () => {
		vi.mocked(api.get).mockResolvedValue({
			data: { days: [] },
		})

		render(<LogsViewer />, { wrapper: createWrapper() })

		await waitFor(() => {
			expect(
				screen.getByText(/no eld logs available/i)
			).toBeInTheDocument()
		})
	})

	it('renders ELD log cards for each day', async () => {
		const mockDays = [
			{
				segments: [{ start: 0, end: 8, status: 3 }],
			},
			{
				segments: [{ start: 0, end: 6, status: 3 }],
			},
		]

		vi.mocked(api.get).mockResolvedValue({
			data: { days: mockDays },
		})

		render(<LogsViewer />, { wrapper: createWrapper() })

		await waitFor(() => {
			expect(screen.getByTestId('eld-card-0')).toBeInTheDocument()
			expect(screen.getByTestId('eld-card-1')).toBeInTheDocument()
		})
	})

	it('fetches logs with trip_id from URL params', async () => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: {
				search: '?trip_id=123',
			},
		})

		vi.mocked(api.get).mockResolvedValue({
			data: { days: [] },
		})

		render(<LogsViewer />, { wrapper: createWrapper() })

		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith('/api/eld_logs/?trip_id=123')
		})
	})

	it('fetches logs with duration_s from URL params', async () => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: {
				search: '?duration_s=36000',
			},
		})

		vi.mocked(api.get).mockResolvedValue({
			data: { days: [] },
		})

		render(<LogsViewer />, { wrapper: createWrapper() })

		await waitFor(() => {
			expect(api.get).toHaveBeenCalledWith('/api/eld_logs/?duration_s=36000')
		})
	})

	it('does not fetch when no params provided', () => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: {
				search: '',
			},
		})

		render(<LogsViewer />, { wrapper: createWrapper() })

		expect(api.get).not.toHaveBeenCalled()
	})
})

