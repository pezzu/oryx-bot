import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    date: Date,
    category: String,
    total: Number,
    types: [
      {
        type: String,
        amount: Number,
      },
    ],
  },
  {
    timeseries: {
      timeField: "date",
      metaField: "category",
      granularity: "day",
    },
  }
);

export function diff({ previous, current }) {
    const changes = [];
    return changes;
  }

export const Metric = mongoose.model("Metric", metricSchema);

