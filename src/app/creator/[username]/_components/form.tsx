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

    console.log(checkout);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
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
        <Button type="submit">Fazer doação</Button>
      </form>
    </Form>
  );
}
