import Link from 'next/link'

export default function Navbar() {
    return (
        <>
            <div className="flex flex-row gap-4 p-4 items-center" data-testid="navbar">
                <Link href="/about">About</Link>
                <Link href="/">Add a gloss</Link>
                <Link href="/people">Add a person</Link>
                <Link href="/feeds">Feeds</Link>
                <Link href="/rss" aria-label="RSS">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <circle cx="6.18" cy="17.82" r="2.18" />
                        <path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56zm0 5.66v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z" />
                    </svg>
                </Link>
            </div>
        </>
    )
}
