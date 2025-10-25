import './globals.css'

export const metadata = {
  title: 'TaskBoard Pro',
  description: 'Professional task management for teams',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  )
}
