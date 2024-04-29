import React from 'react'
// import { MobileSidebar } from './mobile-sidebar'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
// import { DashboardNav } from './dashboard-nav'
// import { navItems } from '@/constants/data'
// import LanguageSwitcher from './language-switcher'

export default function Navbar() {
    return (
        <div className="fixed top-0 left-0 right-0 z-[40]  supports-backdrop-blur:bg-background/60  bg-background/95 backdrop-blur  ">
            <nav className="h-14 flex items-center justify-between px-4">
                <div className=" lg:block">
                    <h1 className='text-black  text-lg font-bold'>MB Jain and Partners</h1>
                </div>
                <div className='lg:flex space-x-8  md:hidden hidden'>
                    {/* <DashboardNav items={navItems} /> */}
                    <Link href='/'>
                        <h1 className='text-black font-bold cursor-pointer '>Main Data</h1>
                    </Link>
                    <Link href='/Agents'>
                        <h1 className='text-black font-bold cursor-pointer '>Agents</h1>
                    </Link>
                    <Link href='/Proprietors'>
                        <h1 className='text-black font-bold cursor-pointer '>Proprietors</h1>
                    </Link>
                </div>



                {/* <UserNav /> */}



            </nav>
        </div>
    )
}
