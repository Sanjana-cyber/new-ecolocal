const mongoose = require("mongoose");

/* Size options for each color */
const sizeSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
      uppercase: true, // M, L, XL
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false }
);

/* Each color has its own gallery + sizes */
const colorVariantSchema = new mongoose.Schema(
  {
    color: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // black, red
    },

    images: {
      type: [String],
      default: [],
    },

    sizes: {
      type: [sizeSchema],
      default: [],
    },
  },
  { _id: false }
);

/* Main product schema */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    category: {
      type: String,
      enum: [
        "farmers",
        "artisans",
        "eco",
        "local-shop",
      ],
      required: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    /* Homepage card image */
    mainImage: {
      type: String,
      required: true,
    },

    /* Color based variants */
    colorVariants: {
      type: [colorVariantSchema],
      default: [],
    },

    /* Auto calculated */
    totalStock: {
      type: Number,
      default: 0,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

/* Auto stock calculation */
productSchema.pre("save", async function () {
  let total = 0;

  if (this.colorVariants && Array.isArray(this.colorVariants)) {
    this.colorVariants.forEach((color) => {
      if (color.sizes && Array.isArray(color.sizes)) {
        color.sizes.forEach((size) => {
          total += Number(size.stock || 0);
        });
      }
    });
  }

  this.totalStock = total;
});

/* Search index */
productSchema.index({
  name: "text",
  description: "text",
  brand: "text",
});

module.exports = mongoose.model("Product", productSchema);