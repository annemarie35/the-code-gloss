import Footer from '@/src/components/footer'
import Header from '@/src/components/header'
import React from 'react'
import '../styles/globals.css'

type MyComponentProps = React.PropsWithChildren<{ title?: string }>

export default function PageLayout({ children, ...props }: MyComponentProps) {
    const { title } = props
    return (
        <div className="bg-[#FFFDEA] px-10 h-screen flex flex-col">
            <div className="pb-4">
                <p className="text-[#EB6393] text-4xl ml-3">The</p>
                <p className="text-[#C4338E] text-4xl ml-10">Code</p>
                <p className="text-[#D53815] text-4xl">Gloss</p>
            </div>
            <Header title={title ?? ''} />
            <div className="py-8 px-2 h-full">{children}</div>
            <Footer />
        </div>
    )
}
