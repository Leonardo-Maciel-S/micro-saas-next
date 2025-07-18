import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature")!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    const payload = await req.text();
    event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
  } catch (error) {
    console.log("Falha ao autenticar a assinatura, ", error);
    return new NextResponse("Webhook Error", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentIntentId = session.payment_intent as string;

      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      const donorName = paymentIntent.metadata.donorName;
      const donorMessage = paymentIntent.metadata.donorMessage;
      const donationId = paymentIntent.metadata.donationId;

      try {
        const updateDonation = await prisma.donation.update({
          where: {
            id: donationId,
          },
          data: {
            status: "PAID",
          },
        });
      } catch (error) {
        console.log(error);
      }

      break;

    default:
      console.log("Evento não tratado.");
  }

  return NextResponse.json({ ok: true });
}
