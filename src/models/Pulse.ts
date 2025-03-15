import mongoose, { Model, Schema, Types } from "mongoose";

const PulseSchema = new Schema<Pulse>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Pulse: Model<Pulse> =
  mongoose.models.Pulse || mongoose.model("Pulse", PulseSchema);

export default Pulse;
