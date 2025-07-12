"use server";

import { prisma } from "@/lib/prisma";
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
      data: null,
      error: schema.error.issues[0].message,
    };
  }

  try {
    console.log(data);
  } catch (error) {
    return {
      data: null,
      error: "Falha ao criar pagamento, tente novamente mais tarde.",
    };
  }
}
