'use client'
import { createBooking } from '@/lib/actions/event.booking';
import posthog from 'posthog-js';
import {useState} from 'react';

const BookEvent = ({eventId, slug}: {eventId: string, slug: string}) => {

    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { success } = await createBooking({eventId, slug, email});

        if(success) {
            setSubmitted(true);
            posthog.capture('event_booked', {eventId, slug, email});
        }else{
            console.log('Booking creation failed');
            posthog.captureException('Booking creation failed');
        }

    }
        

  return (
    <div id="book-event">
        {submitted ? (
            <p className='text-sm'>Thank you for booking your slot</p>

        ):
        (
            <form action="" onSubmit={handleSubmit}>
                <label htmlFor="email">Email Address</label>
                <input type="email" placeholder='Enter your email address' id='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                <button type='submit' className='btn'>Book Slot</button>
            </form>
        )
        }

    </div>
  )
}

export default BookEvent