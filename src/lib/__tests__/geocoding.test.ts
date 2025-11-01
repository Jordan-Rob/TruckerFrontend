import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reverseGeocode } from '../geocoding'

// Mock fetch globally
global.fetch = vi.fn()

describe('geocoding', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Clear cache between tests
		const cache = (reverseGeocode as any).cache
		if (cache) {
			cache.clear()
		}
	})

	it('returns location name from successful geocoding', async () => {
		const mockResponse = {
			address: {
				city: 'Springfield',
				state: 'IL',
			},
			display_name: 'Springfield, IL, USA',
		}

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response)

		const result = await reverseGeocode(39.7817, -89.6501)

		expect(result.name).toBe('Springfield, IL')
		expect(result.address).toBe('Springfield, IL, USA')
		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining('nominatim.openstreetmap.org'),
			expect.objectContaining({
				headers: expect.objectContaining({
					'User-Agent': 'SpotterAI/1.0',
				}),
			})
		)
	})

	it('handles town instead of city', async () => {
		const mockResponse = {
			address: {
				town: 'Smalltown',
				state: 'TX',
			},
		}

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response)

		const result = await reverseGeocode(30.0, -98.0)

		expect(result.name).toBe('Smalltown, TX')
	})

	it('handles road address', async () => {
		const mockResponse = {
			address: {
				road: 'Main Street',
				house_number: '123',
			},
		}

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response)

		const result = await reverseGeocode(40.0, -75.0)

		expect(result.name).toBe('Main Street 123')
	})

	it('falls back to coordinates on error', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

		const result = await reverseGeocode(40.7128, -74.0060)

		expect(result.name).toBe('40.7128, -74.0060')
	})

	it('falls back to coordinates on non-ok response', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			statusText: 'Not Found',
		} as Response)

		const result = await reverseGeocode(40.7128, -74.0060)

		expect(result.name).toBe('40.7128, -74.0060')
	})

	it('caches results', async () => {
		// Clear any existing cache from previous tests by using unique coordinates
		const uniqueLat = 45.0
		const uniqueLon = -80.0
		
		const mockResponse = {
			address: {
				city: 'Test City',
				state: 'TS',
			},
		}

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response)

		// First call
		const result1 = await reverseGeocode(uniqueLat, uniqueLon)
		expect(fetch).toHaveBeenCalledTimes(1)
		
		// Second call with same coordinates (should use cache)
		vi.mocked(fetch).mockClear()
		const result2 = await reverseGeocode(uniqueLat, uniqueLon)
		
		// Fetch should not be called again due to caching
		expect(fetch).not.toHaveBeenCalled()
		expect(result1).toEqual(result2)
		expect(result1.name).toBe('Test City, TS')
	})

	it('handles missing address components gracefully', async () => {
		const mockResponse = {
			address: {},
		}

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			json: async () => mockResponse,
		} as Response)

		const result = await reverseGeocode(40.7128, -74.0060)

		// Should fall back to coordinates
		expect(result.name).toBe('40.7128, -74.0060')
	})
})

