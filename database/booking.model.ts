import mongoose, { Model, Schema, Types } from "mongoose"
import { Event } from "./event.model"

export interface IBooking {
  eventId: Types.ObjectId
  email: string
  createdAt: Date
  updatedAt: Date
}

type BookingModel = Model<IBooking>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "eventId is required"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailPattern.test(value),
        message: "email must be a valid email address",
      },
    },
  },
  {
    timestamps: true,
  }
)

// Supports common lookups such as fetching all bookings for a specific event.
bookingSchema.index({ eventId: 1 })

bookingSchema.pre("save", async function (next) {
  try {
    // Ensure each booking references a real event document before persisting.
    if (this.isNew || this.isModified("eventId")) {
      const eventExists = await Event.exists({ _id: this.eventId })
      if (!eventExists) {
        throw new Error("Referenced event does not exist")
      }
    }

    next()
  } catch (error) {
    next(error as Error)
  }
})

const existingBookingModel = mongoose.models.Booking as BookingModel | undefined

export const Booking =
  existingBookingModel ?? mongoose.model<IBooking>("Booking", bookingSchema)

export default Booking
