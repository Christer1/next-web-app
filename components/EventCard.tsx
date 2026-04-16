import Image from "next/image";
import Link from "next/link";

interface props {
    title: string;
    image: string;
    date: string;
    time: string;
    location: string;
    description: string;
    slug: string;
}

const EventCard = ({title, image, date, time, location, description, slug}: props) => {

    return (
        <Link href={`/events/${slug}`}>
            <Image src={image} alt={title} width={410} height={300} className="poster" />
            
            <div className="flex flex-row gap-2">
            <Image src="/icons/pin.svg" alt="location" width={14} height={14} />
            <p>{location}</p>                
            </div>

            <p className="title">{title}</p>

            <div className="datetime">
                <div className="flex flex-row gap-2">
                    <Image src="/icons/calendar.svg" alt="date" width={14} height={14} />
                    <p>{date}</p>
                </div>
                <div className="flex flex-row gap-2">
                    <Image src="/icons/clock.svg" alt="time" width={14} height={14} />
                    <p>{time}</p>
                </div>
            </div>
                
        </Link>
    )
}

export  default EventCard;