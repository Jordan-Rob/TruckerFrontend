import { Link } from 'react-router-dom'

export function Header() {
	return (
		<header className="sticky top-0 z-10 border-b border-border bg-background">
			<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
				<Link to="/" className="text-xl font-semibold text-foreground">
					SpotterAI
				</Link>
				<nav className="flex gap-8 text-sm text-foreground">
					<Link to="/plan" className="hover:text-primary transition-colors">
						Plan Trip
					</Link>
					<Link to="/logs" className="hover:text-primary transition-colors">
						ELD Logs
					</Link>
				</nav>
			</div>
		</header>
	)
}

