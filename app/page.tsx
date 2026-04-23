import React from 'react';
import ExploreBtn from '@/components/ExploreBtn';
import EventCard from '@/components/EventCard';
import { IEvent } from '@/database/event.model';
import { cacheLife } from 'next/cache';

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const Home = async () => {
  'use cache'
  cacheLife('hours');

  let events: IEvent[] = [];
  try {
    const response = await fetch(`${API_URL}/api/events`);
    if (!response.ok) {
      console.error("Failed to load events");
    } else {
      const data = await response.json();
      events = data.events || [];
    }
  } catch (error) {
    console.error("Error fetching events:", error);
  }
  return (

    <section>
      <h1 className='text-center'>The Hub for Every Dev <br /> Event You Can&apos;t Miss</h1>
      <p className='text-center mt-5'>Discover and join the best tech events around you</p>
      <ExploreBtn />

      <div className='mt-20 space-y-7'>
        <h3>Featured Events</h3>

        <ol className='events'>
          {events.map((event: IEvent) => (
            <li key={event.title }><EventCard {...event} /></li>
          ))}
        </ol>
      </div>

    </section>

  )
}
export default Home