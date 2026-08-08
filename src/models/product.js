import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name can't be more than 120 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price can't be negative"],
    },
    image: {
      type: String,
      required: [true, "Product image URL is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1500, "Description can't be more than 1500 characters"],
      default: "",
    },
    // Free-text category so the store can carry any kind of product, not
    // just a fixed list — admins type a category and it becomes filterable
    // automatically once at least one product uses it.
    category: {
      type: String,
      trim: true,
      default: "متفرقه",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    stock: {
      type: Number,
      min: [0, "Stock can't be negative"],
      default: 0,
    },
    specs: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
