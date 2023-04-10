import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    date: Date,
    list: String,
    total: Number,
    destroyed: Number,
    damaged: Number,
    abandoned: Number,
    captured: Number,
    categories: [
      {
        name: String,
        total: Number,
        destroyed: Number,
        damaged: Number,
        abandoned: Number,
        captured: Number,
        types: [
          {
            name: String,
            amount: Number,
          },
        ],
      },
    ],
  },
  {
    timeseries: {
      timeField: "date",
      metaField: "list",
      granularity: "day",
    },
  }
);

const Metric = mongoose.model("Metric", metricSchema);

export async function save(data) {
  const metric = new Metric(data);
  return metric.save();
}
