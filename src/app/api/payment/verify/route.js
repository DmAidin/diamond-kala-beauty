import { NextResponse } from "next/server";
import { connectToDB } from "../../../../utils/database";
import Order from "../../../../models/order";
import Product from "../../../../models/product";
import { verifyPayment } from "../../../../utils/zarinpal";

// GET: ZarinPal redirects the customer's browser back here after they pay
// (or cancel) at the gateway, with ?Authority=...&Status=OK|NOK
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const authority = searchParams.get("Authority");
  const status = searchParams.get("Status");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;

  try {
    await connectToDB();
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/payment/result?status=failed&reason=notfound`);
    }

    if (status !== "OK") {
      order.status = "failed";
      await order.save();
      return NextResponse.redirect(`${baseUrl}/payment/result?status=failed&orderId=${order._id}`);
    }

    // never re-verify (and never re-deduct stock for) an order already marked paid
    if (order.status === "paid") {
      return NextResponse.redirect(
        `${baseUrl}/payment/result?status=paid&orderId=${order._id}&orderNumber=${order.orderNumber}&refId=${order.payment.refId}`
      );
    }

    const result = await verifyPayment({ amountToman: order.totalPrice, authority });

    if (result.ok) {
      order.status = "paid";
      order.payment.refId = String(result.refId);
      await order.save();

      // deduct stock now that payment is actually confirmed — not at order
      // creation, so abandoned/unpaid orders never lock up inventory
      await Promise.all(
        order.items.map((item) =>
          Product.updateOne({ _id: item.productId }, { $inc: { stock: -item.quantity } })
        )
      );
      // safety net: never let a race condition push stock negative
      await Product.updateMany({ stock: { $lt: 0 } }, { $set: { stock: 0 } });

      return NextResponse.redirect(
        `${baseUrl}/payment/result?status=paid&orderId=${order._id}&orderNumber=${order.orderNumber}&refId=${result.refId}`
      );
    }

    order.status = "failed";
    await order.save();
    return NextResponse.redirect(`${baseUrl}/payment/result?status=failed&orderId=${order._id}`);
  } catch (error) {
    console.error("GET /api/payment/verify error:", error);
    return NextResponse.redirect(`${baseUrl}/payment/result?status=failed&reason=error`);
  }
}
