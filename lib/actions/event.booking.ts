"use server";

import Booking from "@/database/booking.model";
import { connectToDatabase } from "@/lib/mongodb";

export const createBooking = async ({eventId, slug, email}: {eventId: string, slug: string, email: string}) => {
    try {
        await connectToDatabase();
        await Booking.create({eventId, email});
        return {success: true}
    } catch (error) {
        console.log(error);
       return {success: false};
    }
}