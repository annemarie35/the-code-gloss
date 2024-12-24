import Link from 'next/link'

export default function Navbar() {
    return (
        <>
            <div className="flex flex-row gap-3 bg-white">
                <Link href="/about">About</Link>
                <Link href="/">Home</Link>
            </div>
        </>
    )
}
