import React from 'react'
import {notFound} from "next/navigation";
import {IEvent} from "@/database/event.model";
import {getSimilarEventsBySlug} from "@/lib/actions/event.actions";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import {cacheLife} from "next/cache";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const normalizeList = (list: string | string[]): string[] => {
    if (!list) return [];
    if (typeof list === 'string') {
        try { return JSON.parse(list); } catch { return list.split(',').map(i => i.trim()); }
    }
    // Handle corrupted array `['["AI"', '"ML"]']` from NextJS formData parsing issue
    if (list.length > 0 && typeof list[0] === 'string' && list[0].startsWith('["')) {
        try {
            return JSON.parse(list.join(','));
        } catch {
            return list.map(item => item.replace(/^\[?"?|"?\]?$/g, '').trim());
        }
    }
    // Default fallback to clean lingering artifacts on existing items
    return list.map(item => typeof item === 'string' ? item.replace(/^\[?"?|"?\]?$/g, '').trim() : item);
}

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string; }) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
)

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
    const cleanAgenda = normalizeList(agendaItems);
    return (
        <div className="agenda">
            <h2>Agenda</h2>
            <ul>
                {cleanAgenda.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        </div>
    );
}

const EventTags = ({ tags }: { tags: string[] }) => {
    const cleanTags = normalizeList(tags);
    return (
        <div className="flex flex-row gap-1.5 flex-wrap">
            {cleanTags.map((tag) => (
                <div className="pill" key={tag}>{tag}</div>
            ))}
        </div>
    );
}

import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";

const EventDetails = async ({ params }: { params: Promise<string> }) => {
    'use cache'
    cacheLife('hours');
    const slug = await params;

    let event;
    try {
        await connectToDatabase();
        const eventRaw = await Event.findOne({ slug }).lean();
        if (!eventRaw) {
            return notFound();
        }
        event = JSON.parse(JSON.stringify(eventRaw));
    } catch (error) {
        console.error('Error fetching event:', error);
        return notFound();
    }

    const { description, image, overview, date, time, location, mode, agenda, audience, tags, organizer } = event;

    if(!description) return notFound();

    const bookings = 10;

    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

    return (
        <section id="event">
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                {/*    Left Side - Event Content */}
                <div className="content">
                    <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>

                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={agenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={tags} />
                </div>

                {/*    Right Side - Booking Form */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked their spot!
                            </p>
                        ): (
                            <p className="text-sm">Be the first to book your spot!</p>
                        )}

                        <BookEvent eventId={event._id} slug={event.slug} />
                    </div>
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                        <EventCard key={similarEvent.title} {...similarEvent} />
                    ))}
                </div>
            </div>
        </section>
    )
}
export default EventDetails