'use client'
import Link from 'next/link'
import Image from 'next/image'
import posthog from 'posthog-js'

const Navbar = () => {
    const handleNavClick = (label: string) => {
        posthog.capture('nav_link_clicked', { label })
    }

    return (
        <header>
            <nav>
                <Link href="/" className='logo' > <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                    <p>DevEvent</p>
                </Link>


                <ul className="list-none p-0 m-0">
                    <li><Link href="/" onClick={() => handleNavClick('Home')}>Home</Link></li>
                    <li><Link href="/" onClick={() => handleNavClick('Events')}>Events</Link></li>
                    <li><Link href="/" onClick={() => handleNavClick('Create Event')}>Create Event</Link></li>
                </ul>

            </nav>

        </header>
    )
}

export default Navbar