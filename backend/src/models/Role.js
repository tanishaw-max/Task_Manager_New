import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleTitle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);

