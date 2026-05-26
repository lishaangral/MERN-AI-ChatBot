import mongoose, {
  Schema,
  Document,
} from "mongoose";

export interface IGeminiProject
  extends Document {
  name: string;
  description?: string;
  ownerId?: string;
  projectType:
    | "native"
    | "plugged";
  createdAt: Date;
  updatedAt: Date;
  pluggedRagProjectId?: string;
  sourceRagProjectId?: string;
  sourceRagChatId?: string;
  snapshotTimestamp?: Date;
  memorySummary?: string;
}

const GeminiProjectSchema =
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },

      description: {
        type: String,
      },

      ownerId: {
        type: String,
      },

      projectType: {
        type: String,
        enum: ["native", "plugged"],
        default: "native",
     },

      pluggedRagProjectId: {
        type: String,
        default: null,
      },

      sourceRagProjectId: {
        type: String,
        default: null,
      },

      sourceRagChatId: {
        type: String,
        default: null,
      },

      snapshotTimestamp: {
        type: Date,
        default: null,
      },

      memorySummary: {
        type: String,
        default: "",
      },
    },

    {
      timestamps: true,
    }
  );

export const GeminiProject =
  mongoose.model<IGeminiProject>(
    "GeminiProject",
    GeminiProjectSchema
  );