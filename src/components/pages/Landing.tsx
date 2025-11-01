import { Link } from 'react-router-dom'

export function Landing() {
	return (
		<section className="bg-background py-20">
			<div className="max-w-6xl mx-auto px-6 py-16">
				<div className="text-center mb-12">
					<h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground mb-4">
						Plan smarter routes with HOS-ready ELD logs
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Enter your current, pickup, and dropoff locations. We compute the route, required breaks, fueling stops, and generate daily log sheets.
					</p>
				</div>
				<div className="flex justify-center gap-4 mb-16">
					<Link
						to="/plan"
						className="inline-flex items-center rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:opacity-90 transition-opacity"
					>
						Plan a Trip
					</Link>
					<a
						href="/api/docs/"
						className="inline-flex items-center rounded-lg border border-border bg-background px-6 py-3 text-foreground font-medium hover:bg-muted transition-colors"
					>
						API Docs
					</a>
				</div>
				<div className="aspect-[16/10] rounded-lg border border-border bg-background mx-auto max-w-4xl p-8 flex items-center justify-center relative overflow-hidden">
					{/* Decorative background pattern */}
					<div className="absolute inset-0 opacity-5">
						<svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
							<defs>
								<pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
									<path
										d="M 10 0 L 0 0 0 10"
										fill="none"
										stroke="currentColor"
										strokeWidth="0.5"
									/>
								</pattern>
							</defs>
							<rect width="100" height="100" fill="url(#grid)" className="text-primary" />
						</svg>
					</div>

					{/* Feature icons grid */}
					<div className="grid grid-cols-3 gap-8 relative z-10 w-full max-w-2xl">
						{/* Route Planning */}
						<div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
							<svg
								className="w-12 h-12 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"
								/>
							</svg>
							<span className="text-sm font-medium text-foreground">Route Planning</span>
						</div>

						{/* ELD Logs */}
						<div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
							<svg
								className="w-12 h-12 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							<span className="text-sm font-medium text-foreground">ELD Logs</span>
						</div>

						{/* Fuel Stops */}
						<div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
							<svg
								className="w-12 h-12 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span className="text-sm font-medium text-foreground">Fuel Stops</span>
						</div>

						{/* HOS Compliance */}
						<div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
							<svg
								className="w-12 h-12 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-sm font-medium text-foreground">HOS Compliance</span>
						</div>

						{/* Truck Icon */}
						<div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
							<svg
								className="w-12 h-12 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M8 7v8a2 2 0 002 2h6M8 7H5a2 2 0 00-2 2v10a2 2 0 002 2h3M8 7V5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M16 17a1 1 0 11-2 0 1 1 0 012 0zM5 17a1 1 0 11-2 0 1 1 0 012 0z"
								/>
							</svg>
							<span className="text-sm font-medium text-foreground">Transport</span>
						</div>

						{/* Analytics */}
						<div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-muted/50 border border-border">
							<svg
								className="w-12 h-12 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
								/>
							</svg>
							<span className="text-sm font-medium text-foreground">Analytics</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

