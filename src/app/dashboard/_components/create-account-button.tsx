"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function CreateAccountButton() {
  const [loading, setLoading] = useState(false);

  const handleCreateStripeAccount = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/stripe/create-account`,
        {
          method: "POST",
          headers: {
            "Content-Type": "Application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error("Falha ao criar conta de pagamento");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className="mb-5">
      <Button
        className="cursor-pointer"
        onClick={handleCreateStripeAccount}
        disabled={loading}
      >
        {loading ? "Carregando..." : "Ativar conta de pagamentos"}
      </Button>
    </div>
  );
}
