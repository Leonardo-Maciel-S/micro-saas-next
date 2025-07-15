import { Users, DollarSign, Wallet } from "lucide-react";
import { StatCard } from "./stats-card";
import { getStatus } from "../_data-access/get-status-creator";
import { formatCurrent } from "@/utils/format";

export async function Stats({
  userId,
  stripeAccountId,
}: {
  userId: string;
  stripeAccountId: string;
}) {
  const { balance, totalAmountResult, totalQtdDonation, error } =
    await getStatus(userId, stripeAccountId);

  if (error) {
    return null;
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-6">
      <StatCard
        title="Apoiadores"
        description="Total de apoiadores"
        icon={<Users className="w-8 h-8 text-blue-400" />}
        value={totalQtdDonation ?? 0}
      />

      <StatCard
        title="Total recebido"
        description="Quantidade total recebida"
        icon={<DollarSign className="w-8 h-8 text-amber-500" />}
        value={formatCurrent((totalAmountResult ?? 0) / 100)}
      />

      <StatCard
        title="Saldo em conta"
        description="Saldo pendente"
        icon={<Wallet className="w-8 h-8 text-green-500" />}
        value={formatCurrent((balance ?? 0) / 100)}
      />
    </div>
  );
}
