import { Schema, model, Document, Types } from 'mongoose';

export type TransactionType = 'income' | 'expense';

export interface ITransaction extends Document {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    note: String,
    occurredAt: { type: Date, required: true }
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, occurredAt: -1 });

export default model<ITransaction>('Transaction', transactionSchema);
