'use client'
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

interface props {
    title: string;
    image: string;
    date: string;
    time: string;
    location: string;
    description: string;
    slug: string;
}

const EventCard = ({ title, image, date, time, location, description, slug }: props) => {

    const handleClick = () => {
        posthog.capture('event_card_clicked', {
            event_title: title,
            event_slug: slug,
            event_date: date,
            event_location: location,
        })
    }

    return (
        <Link href={`/events/${slug}`} className="flex flex-col gap-3 group" onClick={handleClick}>
            <Image src={image} alt={title} width={410} height={240} className="w-full h-[240px] rounded-[16px] object-cover" />

            <div className="flex flex-col gap-1.5 px-0.5">
                <div className="flex flex-row items-center gap-1.5 text-[13px] text-zinc-400">
                    <Image src="/icons/pin.svg" alt="location" width={12} height={12} className="opacity-80" />
                    <p>{location}</p>
                </div>

                <p className="text-[17px] font-semibold text-zinc-100 tracking-tight">{title}</p>

                <div className="flex flex-row items-center gap-4 text-[13px] text-zinc-400 font-medium mt-0.5">
                    <div className="flex flex-row items-center gap-1.5">
                        <Image src="/icons/calendar.svg" alt="date" width={12} height={12} className="opacity-80" />
                        <p>{date}</p>
                    </div>
                    <div className="flex flex-row items-center gap-1.5">
                        <Image src="/icons/clock.svg" alt="time" width={12} height={12} className="opacity-80" />
                        <p>{time}</p>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default EventCard;