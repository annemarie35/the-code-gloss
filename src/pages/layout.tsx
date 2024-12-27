import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'The Code Gloss',
    description: 'All about the code gloss'
}

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
