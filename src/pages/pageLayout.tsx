import Footer from '@/src/components/footer'
import Header from '@/src/components/header'
import React from 'react'
import '../../app/globals.css'

type MyComponentProps = React.PropsWithChildren<{ title?: string }>

export default function PageLayout({ children, ...props }: MyComponentProps) {
    const { title } = props
    return (
        <div className="flex flex-col h-screen bg-[#FFFDEA] px-10">
            <p className="text-[#EB6393] text-4xl ml-3">The</p>
            <p className="text-[#C4338E] text-4xl ml-10">Code</p>
            <p className="text-[#D53815] text-4xl">Gloss</p>
            <p className="text-[#780068] text-4xl ml-5">!!!</p>
            <Header title={title ?? ''} />
            <div>{children}</div>
            <Footer />
        </div>
    )
}
