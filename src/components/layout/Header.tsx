import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'

export function Header() {
	const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
	const apiDocsUrl = `${apiUrl}/api/docs/`

	return (
		<header className="sticky top-0 z-10 border-b border-border bg-background">
			<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
				<Link to="/" className="text-xl font-semibold text-foreground">
					SpotterAI
				</Link>
				<nav className="flex gap-8 text-sm text-foreground items-center">
					<Link to="/plan" className="hover:text-primary transition-colors">
						Plan Trip
					</Link>
					<Link to="/logs" className="hover:text-primary transition-colors">
						ELD Logs
					</Link>
					<a
						href={apiDocsUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-primary transition-colors flex items-center gap-1"
					>
						API Docs
						<ExternalLink className="w-3 h-3" />
					</a>
				</nav>
			</div>
		</header>
	)
}

