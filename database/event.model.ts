import mongoose, { Model, Schema } from "mongoose"

export interface IEvent {
  title: string
  slug: string
  description: string
  overview: string
  image: string
  venue: string
  location: string
  date: string
  time: string
  mode: string
  audience: string
  agenda: string[]
  organizer: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

type EventModel = Model<IEvent>

const requiredStringField = (fieldName: string) => ({
  type: String,
  required: [true, `${fieldName} is required`],
  trim: true,
  validate: {
    validator: (value: string): boolean => value.trim().length > 0,
    message: `${fieldName} cannot be empty`,
  },
})

const normalizeDate = (value: string): string => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("date must be a valid date value")
  }

  return parsedDate.toISOString()
}

const normalizeTime = (value: string): string => {
  const trimmedValue = value.trim().toLowerCase()
  const twelveHourMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})\s*([ap]m)$/)

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1])
    const minutes = Number(twelveHourMatch[2])
    const meridiem = twelveHourMatch[3]

    if (hours < 1 || hours > 12 || minutes > 59) {
      throw new Error("time must be a valid clock time")
    }

    if (meridiem === "pm" && hours !== 12) {
      hours += 12
    } else if (meridiem === "am" && hours === 12) {
      hours = 0
    }

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  const twentyFourHourMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})$/)

  if (!twentyFourHourMatch) {
    throw new Error("time must use HH:mm or h:mm AM/PM format")
  }

  const hours = Number(twentyFourHourMatch[1])
  const minutes = Number(twentyFourHourMatch[2])

  if (hours > 23 || minutes > 59) {
    throw new Error("time must be a valid clock time")
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")

const eventSchema = new Schema<IEvent>(
  {
    title: requiredStringField("title"),
    slug: {
      type: String,
      trim: true,
    },
    description: requiredStringField("description"),
    overview: requiredStringField("overview"),
    image: requiredStringField("image"),
    venue: requiredStringField("venue"),
    location: requiredStringField("location"),
    date: requiredStringField("date"),
    time: requiredStringField("time"),
    mode: requiredStringField("mode"),
    audience: requiredStringField("audience"),
    agenda: {
      type: [String],
      required: [true, "agenda is required"],
      validate: [
        {
          validator: (items: string[]): boolean => items.length > 0,
          message: "agenda must contain at least one item",
        },
        {
          validator: (items: string[]): boolean =>
            items.every((item) => item.trim().length > 0),
          message: "agenda cannot contain empty items",
        },
      ],
    },
    organizer: requiredStringField("organizer"),
    tags: {
      type: [String],
      required: [true, "tags is required"],
      validate: [
        {
          validator: (items: string[]): boolean => items.length > 0,
          message: "tags must contain at least one item",
        },
        {
          validator: (items: string[]): boolean =>
            items.every((item) => item.trim().length > 0),
          message: "tags cannot contain empty items",
        },
      ],
    },
  },
  {
    timestamps: true,
  }
)

// Enforce a globally unique URL slug for stable event routes.
eventSchema.index({ slug: 1 }, { unique: true })

eventSchema.pre("save", function (next) {
  try {
    // Regenerate slug only when the event title changes.
    if (this.isModified("title")) {
      const slug = toSlug(this.title)
      if (!slug) {
        throw new Error("title must contain valid slug characters")
      }
      this.slug = slug
    }

    // Normalize date/time values into predictable storage formats.
    this.date = normalizeDate(this.date)
    this.time = normalizeTime(this.time)

    next()
  } catch (error) {
    next(error as Error)
  }
})

const existingEventModel = mongoose.models.Event as EventModel | undefined

export const Event = existingEventModel ?? mongoose.model<IEvent>("Event", eventSchema)

export default Event
