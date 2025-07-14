"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const createPaymentSchema = z.object({
  slug: z.string().min(1, "Username é obrigatório"),
  name: z.string().min(1, "Nome de usuário é obrigatório"),
  message: z.string().min(1, "Mensagem é obrigatório"),
  price: z.number().min(1500, "Selecione um valor maior que R$15"),
  creatorId: z.string(),
});

type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;

export async function createPayment(data: CreatePaymentSchema) {
  const schema = createPaymentSchema.safeParse(data);

  if (!schema.success) {
    return {
      error: schema.error.issues[0].message,
    };
  }

  if (!data.creatorId) {
    return {
      error: "Criador não encontrado",
    };
  }

  try {
    const creator = await prisma.user.findFirst({
      where: {
        connectedStripeAccountId: data.creatorId,
      },
    });

    if (!creator) {
      return {
        error: "Falha ao criar pagamento, tente novamente mais tarde. 1",
      };
    }

    const applicationFeeAmount = Math.floor(data.price * 0.1);

    const donation = await prisma.donation.create({
      data: {
        donorName: data.name,
        donorMessage: data.message,
        userId: creator.id,
        status: "PENDING",
        amount: data.price - applicationFeeAmount,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.HOST_URL}/creator/${data.slug}`,
      cancel_url: `${process.env.HOST_URL}/creator/${data.slug}`,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "Apoiar " + creator.name,
            },
            unit_amount: data.price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: creator.connectedStripeAccountId as string,
        },
        metadata: {
          donorName: data.name,
          donorMessage: data.message,
          donationId: donation.id,
        },
      },
    });

    return {
      sessionId: session.id,
    };
  } catch (error) {
    return {
      error: "Falha ao criar pagamento, tente novamente mais tarde. 2",
    };
  }
}
