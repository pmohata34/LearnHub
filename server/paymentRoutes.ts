import Razorpay from "razorpay";
import crypto from "crypto";
import express, { Request, Response } from "express";

const router = express.Router();

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Create Order
router.post("/create-order", async (req: Request, res: Response) => {
  const { amount, currency = "INR" } = req.body;

  try {
    const options = {
      amount: amount * 100, // amount in paise
      currency,
      receipt: `rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

//Verify Payment
router.post("/verify-payment", async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // You can now save this payment to DB
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});

export default router;
