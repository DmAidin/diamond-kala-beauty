import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    couponCode: { type: String, default: "" },
    // pending    -> waiting for the customer to complete payment at the gateway
    // paid       -> gateway verified the payment
    // processing -> paid and being prepared by the store
    // shipped    -> handed to courier, trackingCode may be set
    // delivered  -> confirmed received
    // failed     -> gateway payment failed / was cancelled
    // cancelled  -> cancelled after payment (refund handled offline)
    status: {
      type: String,
      enum: ["pending", "paid", "processing", "shipped", "delivered", "failed", "cancelled"],
      default: "pending",
    },
    trackingCode: { type: String, default: "" },
    receiver: {
      fullName: String,
      phone: String,
      province: String,
      city: String,
      postalCode: String,
      address: String,
      notes: String,
    },
    payment: {
      authority: String, // ZarinPal Authority token for this transaction
      refId: String, // ZarinPal RefID, set once verified
    },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
