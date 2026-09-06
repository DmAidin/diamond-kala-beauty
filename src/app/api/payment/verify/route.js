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
      if (order.status === "pending") {
        order.status = "failed";
        await order.save();
        // release the stock that was reserved when the order was created —
        // the customer never completed payment, so it shouldn't stay locked
        await Promise.all(
          order.items.map((item) =>
            Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
          )
        );
      }
      return NextResponse.redirect(`${baseUrl}/payment/result?status=failed&orderId=${order._id}`);
    }

    // never re-verify (and never re-release/re-deduct stock for) an order already resolved
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
      // stock was already reserved atomically when the order was created —
      // nothing to deduct here, which is what avoids the double-deduction
      // (and the overselling gap) a second decrement at this step would reopen

      return NextResponse.redirect(
        `${baseUrl}/payment/result?status=paid&orderId=${order._id}&orderNumber=${order.orderNumber}&refId=${result.refId}`
      );
    }

    if (order.status === "pending") {
      order.status = "failed";
      await order.save();
      await Promise.all(
        order.items.map((item) =>
          Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
        )
      );
    }
    return NextResponse.redirect(`${baseUrl}/payment/result?status=failed&orderId=${order._id}`);
  } catch (error) {
    console.error("GET /api/payment/verify error:", error);
    return NextResponse.redirect(`${baseUrl}/payment/result?status=failed&reason=error`);
  }
}
