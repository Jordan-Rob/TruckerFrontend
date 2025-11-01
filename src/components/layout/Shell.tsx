import { type ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface ShellProps {
	children: ReactNode
}

export function Shell({ children }: ShellProps) {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</div>
	)
}

