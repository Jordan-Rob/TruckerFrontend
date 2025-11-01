import { describe, it, expect } from 'vitest'
import { getCoordinatesAtRatio } from '../routeUtils'

describe('routeUtils', () => {
	describe('getCoordinatesAtRatio', () => {
		const mockFeatureCollection = {
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					geometry: {
						type: 'LineString',
						coordinates: [
							[-74.0060, 40.7128], // Start
							[-75.1652, 39.9526], // Middle
							[-87.6298, 41.8781], // End
						],
					},
				},
			],
		}

		it('returns start coordinate at ratio 0', () => {
			const result = getCoordinatesAtRatio(mockFeatureCollection, 0)
			expect(result).toEqual({ lat: 40.7128, lon: -74.0060 })
		})

		it('returns end coordinate at ratio 1', () => {
			const result = getCoordinatesAtRatio(mockFeatureCollection, 1)
			expect(result).toEqual({ lat: 41.8781, lon: -87.6298 })
		})

		it('returns interpolated coordinate at ratio 0.5', () => {
			const result = getCoordinatesAtRatio(mockFeatureCollection, 0.5)
			expect(result).toBeDefined()
			expect(result?.lat).toBeCloseTo(39.9526, 4)
			expect(result?.lon).toBeCloseTo(-75.1652, 4)
		})

		it('handles LineString geometry directly', () => {
			const lineString = {
				type: 'LineString',
				coordinates: [
					[-74.0060, 40.7128],
					[-87.6298, 41.8781],
				],
			}

			const result = getCoordinatesAtRatio(lineString, 0)
			expect(result).toEqual({ lat: 40.7128, lon: -74.0060 })
		})

		it('handles MultiLineString geometry', () => {
			const multiLineString = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'MultiLineString',
							coordinates: [
								[
									[-74.0060, 40.7128],
									[-75.1652, 39.9526],
								],
								[
									[-87.6298, 41.8781],
								],
							],
						},
					},
				],
			}

			const result = getCoordinatesAtRatio(multiLineString, 0)
			expect(result).toBeDefined()
			expect(result?.lat).toBeCloseTo(40.7128, 4)
		})

		it('returns null for invalid geometry', () => {
			const invalid = { type: 'InvalidType' }
			const result = getCoordinatesAtRatio(invalid, 0)
			expect(result).toBeNull()
		})

		it('returns null for null/undefined input', () => {
			expect(getCoordinatesAtRatio(null, 0)).toBeNull()
			expect(getCoordinatesAtRatio(undefined, 0)).toBeNull()
		})

		it('clamps ratio to [0, 1]', () => {
			const resultNegative = getCoordinatesAtRatio(mockFeatureCollection, -0.5)
			const resultOver = getCoordinatesAtRatio(mockFeatureCollection, 1.5)

			expect(resultNegative).toEqual({ lat: 40.7128, lon: -74.0060 })
			expect(resultOver).toEqual({ lat: 41.8781, lon: -87.6298 })
		})

		it('handles single coordinate array', () => {
			const singlePoint = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'LineString',
							coordinates: [[-74.0060, 40.7128]],
						},
					},
				],
			}

			const result = getCoordinatesAtRatio(singlePoint, 0.5)
			expect(result).toEqual({ lat: 40.7128, lon: -74.0060 })
		})
	})
})

