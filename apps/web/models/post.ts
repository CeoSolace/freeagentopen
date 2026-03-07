import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  userId: mongoose.Types.ObjectId;
  sector?: string;
  content: string;
  images?: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sector: { type: String },
    content: { type: String, required: true },
    images: { type: [String], default: [] },
    likes: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const PostModel = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
