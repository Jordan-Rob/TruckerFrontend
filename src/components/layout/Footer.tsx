export function Footer() {
	return (
		<footer className="border-t border-border bg-background py-8">
			<div className="max-w-6xl mx-auto px-6">
				<div className="text-xs text-muted-foreground text-center">
					© {new Date().getFullYear()} SpotterAI. All rights reserved.
				</div>
			</div>
		</footer>
	)
}

