import Navbar from '@/src/components/navbar'

export default function Header({ title }: { title: string }) {
    return (
        <>
            <Navbar />
            <h1>{title}</h1>
        </>
    )
}
