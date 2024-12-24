import Link from 'next/link'

export default function Navbar() {
    return (
        <>
            <div className="flex flex-row gap-4 p-4 items-center" data-testid="navbar">
                <Link href="/about">About</Link>
                <Link href="/">Home</Link>
            </div>
        </>
    )
}
