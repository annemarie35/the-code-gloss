import Navbar from '@/src/components/navbar'

export default function Header({ title }: { title: string }) {
    return (
        <div className="flex flex-row gap-4 bg-white text-[#780068]">
            <Navbar />
            <h2 className="flex grow justify-end text-xl p-2">{title}</h2>
        </div>
    )
}
