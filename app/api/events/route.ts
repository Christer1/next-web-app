import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/database/event.model";


export async function POST(request: NextRequest) {
    try {
        
        await connectToDatabase();
        
        const formData = await request.formData();
        let event;

        try {
            
            event = Object.fromEntries(formData.entries());

        } catch (e) {
            return NextResponse.json({ message: "Invalid JSON data format"}, {status: 400} );
        }

        const file = formData.get("image") as File;

        if (!file) return NextResponse.json({ message: "Image is required"}, {status: 400} );
        
        let tags: string[] = [];
        let agenda: string[] = [];
        try {
            const rawTags = formData.get("tags") as string;
            if (rawTags) tags = rawTags.startsWith('[') ? JSON.parse(rawTags) : rawTags.split(',').map(t => t.trim());
            
            const rawAgenda = formData.get("agenda") as string;
            if (rawAgenda) agenda = rawAgenda.startsWith('[') ? JSON.parse(rawAgenda) : rawAgenda.split(',').map(a => a.trim());
        } catch (e) {
            console.error("Error parsing tags or agenda", e);
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: "DevEvent", resource_type: "image" },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) return reject(new Error("Cloudinary upload returned no result"));
                    return resolve(result);
                }
            ).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const allowedFields = ['title', 'slug', 'description', 'overview', 'venue', 'location', 'date', 'time', 'mode', 'audience', 'agenda', 'organizer', 'tags'];
        const allowedEvent: any = {};
        for(const field of allowedFields) {
            if((event as any)[field]) {
               if (field === 'agenda' || field === 'tags') {
                   // Ensure it's treated as string from form data to be in compliance with expected array if needed, but the model handles array if string[] is passed, form data comes as strings. The prompt just asks to validate/allowlist.
                   allowedEvent[field] = (event as any)[field];
               } else {
                   allowedEvent[field] = (event as any)[field];
               }
            }
        }
        allowedEvent.image = (uploadResult as { secure_url: string }).secure_url;

        const createEvent = await Event.create({...allowedEvent, tags, agenda});

        return NextResponse.json({ message: "Event created successfully", event: createEvent }, {status: 201} );
    } catch (error) {
        console.error("Failed to create event:", error);
        return NextResponse.json({ 
            message: "An unexpected error occurred while creating the event.", 
            error: error instanceof Error ? error.message : "Unknown error" 
        }, {status: 500} );
    }
}

export async function GET() {
    try {
        
        await connectToDatabase();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: "Events fetched successfully", events } );
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Failed to fetch events", error: error instanceof Error ? error.message : "Unknown error"}, {status: 500} );
    }
}

