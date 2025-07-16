"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { createPayment } from "../_actions/create-payment";
import { toast } from "sonner";
import { getStripeJs } from "@/lib/stripe-js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatório"),
  message: z.string().min(1, "A mensagem é obrigatório"),
  price: z.enum(["15", "25", "35"], {
    required_error: "O valor é obrigatório",
  }),
});

type FormSchema = z.infer<typeof formSchema>;

interface FormDonateProps {
  slug: string;
  creatorId: string;
}

export default function FormDonate({ slug, creatorId }: FormDonateProps) {
  const priceList = ["15", "25", "35"];

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      message: "",
      price: "15",
    },
  });

  const onSubmit = async (data: FormSchema) => {
    const priceInCents = Number(data.price) * 100;

    const checkout = await createPayment({
      name: data.name,
      message: data.message,
      creatorId,
      slug,
      price: priceInCents,
    });

    await handlePaymentResponse(checkout);
  };

  async function handlePaymentResponse(checkout: {
    sessionId?: string;
    error?: string;
  }) {
    if (checkout.error) {
      toast.error(checkout.error);
      return;
    }

    if (!checkout.sessionId) {
      toast.error("Falha ao criar pagamento, tente novamente mais tarde");
      return;
    }

    const stripe = await getStripeJs();

    if (!stripe) {
      toast.error("Falha ao criar pagamento, tente novamente mais tarde");
      return;
    }

    await stripe?.redirectToCheckout({
      sessionId: checkout.sessionId,
    });
  }

  return (
    <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm h-fit">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
          Apoiar Criador
        </CardTitle>

        <CardDescription>Sua doação ajuda manter o conteúdo.</CardDescription>

        <CardContent className="p-0">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8 mt-5"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu nome..."
                        {...field}
                        className="bg-white"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="digite sua mensagem..."
                        {...field}
                        className="bg-white resize-none h-32"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da doação</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex item-center gap-3"
                      >
                        {priceList.map((price) => (
                          <div key={price} className="flex items-center gap-4">
                            <RadioGroupItem value={price} id={price} />
                            <Label className="text-lg" htmlFor={price}>
                              R${price}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Carregando..." : "Fazer doação"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </CardHeader>
    </Card>
  );
}
