import Link from 'next/link'

export default function Page() {
  return (
      <div>
        <h1>Home</h1>
          <footer>
              <Link href="/about">About</Link>
          </footer>
      </div>
  )
}