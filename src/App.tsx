import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Shell } from './components/layout/Shell'
import { Landing } from './components/pages/Landing'
import { PlanTripPage } from './components/pages/PlanTripPage'
import { LogsPage } from './components/pages/LogsPage'
import './index.css'

const qc = new QueryClient()

export default function App() {
	return (
		<QueryClientProvider client={qc}>
			<BrowserRouter>
				<Shell>
					<Routes>
						<Route path="/" element={<Landing />} />
						<Route path="/plan" element={<PlanTripPage />} />
						<Route path="/logs" element={<LogsPage />} />
						<Route path="*" element={<Navigate to="/" replace />} />
					</Routes>
				</Shell>
			</BrowserRouter>
		</QueryClientProvider>
	)
}
