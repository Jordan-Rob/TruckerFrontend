import { useEffect, useRef } from 'react'
import type { ELDSegment } from '../../types'

interface ELDCanvasProps {
	segments: ELDSegment[]
}

export function ELDCanvas({ segments }: ELDCanvasProps) {
	const ref = useRef<HTMLCanvasElement | null>(null)

	useEffect(() => {
		const canvas = ref.current
		if (!canvas || !segments || segments.length === 0) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const w = canvas.width
		const h = canvas.height
		const labelWidth = 120
		const chartWidth = w - labelWidth

		// Clear and fill background
		ctx.clearRect(0, 0, w, h)
		ctx.fillStyle = '#ece9f0'
		ctx.fillRect(0, 0, w, h)

		// Status labels and row positions
		const statusLabels = [
			{ id: 1, name: 'Off Duty' },
			{ id: 2, name: 'Sleeper Berth' },
			{ id: 3, name: 'Driving' },
			{ id: 4, name: 'On Duty (Not Driving)' },
		]
		const rowHeight = h / 4
		const rowY = (status: number) => (status - 1) * rowHeight + rowHeight / 2

		// Draw status row labels and horizontal dividers
		ctx.strokeStyle = '#d9d3e0'
		ctx.lineWidth = 1
		ctx.fillStyle = '#333333'
		ctx.font = '12px sans-serif'
		ctx.textBaseline = 'middle'

		statusLabels.forEach((label, idx) => {
			const y = idx * rowHeight
			// Draw row divider
			ctx.beginPath()
			ctx.moveTo(0, y)
			ctx.lineTo(w, y)
			ctx.stroke()

			// Draw label
			ctx.fillText(label.name, 10, rowY(label.id))
		})

		// Draw hour grid lines (vertical)
		ctx.strokeStyle = '#e0dde5'
		ctx.lineWidth = 0.5
		for (let i = 0; i <= 24; i++) {
			const x = labelWidth + (i / 24) * chartWidth
			ctx.beginPath()
			ctx.moveTo(x, 0)
			ctx.lineTo(x, h)
			ctx.stroke()

			// Hour labels at top
			if (i % 4 === 0 || i === 24) {
				ctx.fillStyle = '#666666'
				ctx.font = '10px sans-serif'
				ctx.textAlign = 'center'
				ctx.fillText(String(i), x, 10)
				ctx.textAlign = 'left'
			}
		}

		// Sort segments by start time for proper connection
		const sortedSegs = [...segments].sort((a, b) => a.start - b.start)

		// Draw connecting vertical lines between adjacent segments
		ctx.strokeStyle = '#333333'
		ctx.lineWidth = 2
		for (let i = 0; i < sortedSegs.length - 1; i++) {
			const curr = sortedSegs[i]
			const next = sortedSegs[i + 1]

			// If segments are adjacent in time, draw connecting line
			if (Math.abs(curr.end - next.start) < 0.01) {
				const x = labelWidth + (curr.end / 24) * chartWidth
				const y1 = rowY(curr.status)
				const y2 = rowY(next.status)

				ctx.beginPath()
				ctx.moveTo(x, y1)
				ctx.lineTo(x, y2)
				ctx.stroke()
			}
		}

		// Draw horizontal segment lines
		ctx.strokeStyle = '#6d5efc'
		ctx.lineWidth = 6
		ctx.lineCap = 'round'

		sortedSegs.forEach(seg => {
			const x1 = labelWidth + Math.max(0, (seg.start / 24) * chartWidth)
			const x2 = labelWidth + Math.min(chartWidth, (seg.end / 24) * chartWidth)
			const y = rowY(seg.status)

			if (x2 > x1) {
				ctx.beginPath()
				ctx.moveTo(x1, y)
				ctx.lineTo(x2, y)
				ctx.stroke()
			}
		})

		// Draw vertical lines at segment start/end points
		ctx.strokeStyle = '#333333'
		ctx.lineWidth = 1.5
		sortedSegs.forEach(seg => {
			const x1 = labelWidth + (seg.start / 24) * chartWidth
			const x2 = labelWidth + (seg.end / 24) * chartWidth
			const y = rowY(seg.status)
			const halfRow = rowHeight / 2

			// Start marker
			ctx.beginPath()
			ctx.moveTo(x1, y - halfRow + 2)
			ctx.lineTo(x1, y + halfRow - 2)
			ctx.stroke()

			// End marker
			ctx.beginPath()
			ctx.moveTo(x2, y - halfRow + 2)
			ctx.lineTo(x2, y + halfRow - 2)
			ctx.stroke()
		})
	}, [segments])

	return <canvas ref={ref} width={1000} height={220} className="w-full h-auto" />
}

