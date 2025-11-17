import { Schema, model, Document, Types } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  name: string;
  accountNumber: string;
  initialBalance: number;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    accountNumber: { type: String, required: true },
    initialBalance: { type: Number, required: true, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' }
  },
  { timestamps: true }
);

walletSchema.index({ userId: 1, accountNumber: 1 }, { unique: true });

export default model<IWallet>('Wallet', walletSchema);
