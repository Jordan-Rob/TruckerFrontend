import { LogsViewer } from '../features/LogsViewer'

export function LogsPage() {
	return (
		<div className="bg-background py-12">
			<div className="max-w-6xl mx-auto px-6">
				<h2 className="text-3xl font-semibold text-foreground mb-8">ELD Logs</h2>
				<LogsViewer />
			</div>
		</div>
	)
}

