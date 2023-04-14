import mongoose from "mongoose";

const lossesSchema = new mongoose.Schema(
  {
    timestamp: Date,
    list: String,
    losses: {
      total: Number,
      destroyed: Number,
      damaged: Number,
      abandoned: Number,
      captured: Number,
    },
    types: [
      {
        type: {
          type: String,
          required: true,
        },
        losses: {
          total: Number,
          destroyed: Number,
          damaged: Number,
          abandoned: Number,
          captured: Number,
        },
        models: [
          {
            model: String,
            amount: Number,
          },
        ],
      },
    ],
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "list",
      granularity: "hours",
    },
  }
);

const Losses = mongoose.model("Losses", lossesSchema);

export async function save(data) {
  const losses = new Losses(data);
  return losses.save();
}
