import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  status: 'draft' | 'final';
}

const SessionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Untitled Document' },
  content: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'final'], default: 'draft' }
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);