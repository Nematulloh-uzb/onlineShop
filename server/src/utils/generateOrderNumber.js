import { Counter } from '../models/Counter.js';

export const generateOrderNumber = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'order' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `AU-${counter.seq}`;
};
