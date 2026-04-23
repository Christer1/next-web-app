import { NextResponse } from "next/server"
import type { Types } from "mongoose"

import Event, { IEvent } from "@/database/event.model"
import { connectToDatabase } from "@/lib/mongodb"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

type EventRouteContext = {
  params: Promise<{
    slug?: string
  }>
}

type EventRecord = IEvent & {
  _id: Types.ObjectId
}

interface ErrorResponse {
  message: string
}

interface SuccessResponse {
  message: string
  event: EventRecord
}

const validateSlugParam = (
  slugParam: string | undefined
): { slug?: string; error?: string } => {
  if (!slugParam) {
    return { error: "Missing required slug route parameter." }
  }

  let decodedSlug: string
  try {
    decodedSlug = decodeURIComponent(slugParam)
  } catch {
    return { error: "Slug route parameter must be a valid URL segment." }
  }

  const normalizedSlug = decodedSlug.trim().toLowerCase()

  if (!normalizedSlug) {
    return { error: "Slug route parameter cannot be empty." }
  }

  if (!SLUG_PATTERN.test(normalizedSlug)) {
    return {
      error:
        "Invalid slug format. Use lowercase letters, numbers, and single hyphens between words.",
    }
  }

  return { slug: normalizedSlug }
}

export async function GET(
  _request: Request,
  context: EventRouteContext
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  try {
    const { slug: rawSlug } = await context.params

    // Validate and normalize slug before querying the database.
    const { slug, error } = validateSlugParam(rawSlug)
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 })
    }

    await connectToDatabase()

    const event = await Event.findOne({ slug }).lean<EventRecord>().exec()

    if (!event) {
      return NextResponse.json(
        { message: `Event with slug "${slug}" was not found.` },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: "Event fetched successfully.", event },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("Failed to fetch event by slug:", error)

    // Return a generic message to avoid leaking internal server details.
    return NextResponse.json(
      { message: "An unexpected error occurred while fetching the event." },
      { status: 500 }
    )
  }
}
