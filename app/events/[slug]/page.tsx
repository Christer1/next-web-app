import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import { IEvent } from "@/database/event.model";
import EventCard from "@/components/EventCard";
import {eventData} from '@/lib/constants';

// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailsItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => {
  return (
    <div className="flex flex-row gap-2 items-center">
      <Image src={icon} alt={alt} width={24} height={24} />
      <p>{label}</p>
    </div>
  );
};

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-2 flex-wrap">
      {tags.map((tag) => (
        <div className="pill mr-2" key={tag}>
          {tag}
        </div>
      ))}
    </div>
  );
};

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((items) => (
          <li key={items}>{items}</li>
        ))}
      </ul>
    </div>
  );
};

// async function getCachedEventData(slug: string) {
//   'use cache';
//   cacheLife('hours');
//   try {
//     const res = await fetch(`${BASE_URL}/api/events/${slug}`);
//     if (!res.ok) return null;
//     const body = await res.json();
//     if (!body || !body.event) return null;
//     return body.event;
//   } catch (error) {
//     return null;
//   }
// }

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;
  
  // const eventData = await getCachedEventData(slug);
  // if (!eventData) {
  //   notFound();
  // }

  const similarEvents: IEvent[]  = await getSimilarEventsBySlug(slug);
  const booking = 10;

  const {
    description,
    image,
    overview,
    location,
    title,
    date,
    time,
    mode,
    agenda,
    tags,
    category,
    _id,
    audience,
    organizer,
  } = eventData;

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p className="mt-2">{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            src={image}
            alt="Event banner"
            width={800}
            height={800}
            className="banner rounded-lg"
          />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
            <EventDetailsItem
              icon="/icons/calendar.svg"
              alt="Calendar"
              label={date}
            />
            <EventDetailsItem
              icon="/icons/clock.svg"
              alt="clock"
              label={time}
            />
            <EventDetailsItem
              icon="/icons/pin.svg"
              alt="pin"
              label={location}
            />
            <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={mode} />
            <EventDetailsItem
              icon="/icons/audience.svg"
              alt="audience"
              label={audience}
            />
          </section>

          <EventAgenda
            agendaItems={agenda ?? []}
          />
          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={tags && tags.length > 0 ? tags[0].split(",") : []} />
        </div>

        <aside className="booking">
          <div className="signup-card">
            <h2>
              Book your slot
            </h2>
            {(
              booking > 0 ? (
                <p className="text-sm">Join {booking} people who have already book their slot</p>
              ) : (
                <p className="text-sm">Be the first to book your slot</p>
              )
            )}

            <BookEvent eventId={_id as string} slug={slug} />

          </div>
        </aside>
      </div>

      <div className='flex w-full flex-col gap-4 pt-20'>
        <h2>Similar Events</h2>
        <ol className="events">
          {similarEvents.length > 0 && similarEvents.map((event: IEvent) => (
            <EventCard key={event._id as string} {...event} />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default EventDetailsPage;
