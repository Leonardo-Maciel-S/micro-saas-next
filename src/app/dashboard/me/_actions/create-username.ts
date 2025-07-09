"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSlug } from "@/utils/create-slug";

const createUsernameSchema = z.object({
  username: z
    .string({ message: "O user name é obrigatório" })
    .min(4, "O username precisa de no mínimo 4 caracteres"),
});

type CreateUsernameFormData = z.infer<typeof createUsernameSchema>;

export async function createUsername(data: CreateUsernameFormData) {
  const session = await auth();

  if (!session?.user) {
    return {
      data: data.username,
      error: "Usuário não autenticado",
    };
  }

  const schema = createUsernameSchema.safeParse(data);

  if (!schema.success) {
    return {
      data: null,
      error: schema.error.issues[0].message,
    };
  }

  try {
    const userId = session.user.id;

    const slug = createSlug(data.username);

    const existSlug = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (existSlug) {
      return {
        data: null,
        error: "Este username já existe, tente outro!",
      };
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: slug,
      },
    });

    return {
      data: slug,
      error: null,
    };
  } catch (error) {
    return {
      data: data.username,
      error: "Falha ao atualizar o username",
    };
  }
}
