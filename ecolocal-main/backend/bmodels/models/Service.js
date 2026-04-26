const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    basePrice: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      enum: [
        "repair",
        "cleaning",
        "delivery",
        "consulting",
        "local-help"
      ],
      required: true
    },

    providerName: {
      type: String,
      required: true,
      trim: true
    },

    estimatedTime: {
      type: String
    },

    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "inactive"],
      default: "available"
    },

    mainImage: {
      type: String,
      default: "default-service.png"
    },

    galleryImages: {
      type: [String],
      default: []
    },

    slots: {
      type: Number,
      default: 0
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    }
  },
  { timestamps: true }
);

/* 🔍 Search index */
serviceSchema.index({
  serviceName: "text",
  description: "text",
  providerName: "text"
});

module.exports = mongoose.model("Service", serviceSchema);