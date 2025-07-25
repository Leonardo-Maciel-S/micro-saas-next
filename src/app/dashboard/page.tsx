import { DonationTable } from "./_components/donates";
import { Stats } from "./_components/analytics";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getLoginOnboardAccount } from "./_data-access/create-onboard-account";
import { CreateAccountButton } from "./_components/create-account-button";
import { getAllDonates } from "./_data-access/get-donations";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const accountUrl = await getLoginOnboardAccount(
    session.user.connectedStripeAccountId
  );

  const donates = await getAllDonates(session.user.id);

  return (
    <div className="p-4">
      <section className="flex items-center justify-between mb-4">
        <div className="w-full flex items-center gap-2 justify-between">
          <h1 className="text-2xl font-semibold">Minha conta</h1>
          {accountUrl && (
            <a
              href={accountUrl}
              className="bg-zinc-900 text-white px-4 py-1 rounded-md cursor-pointer"
            >
              Ajustar conta
            </a>
          )}
        </div>
      </section>

      {!session.user.connectedStripeAccountId && <CreateAccountButton />}

      <Stats
        userId={session.user.id}
        stripeAccountId={session.user.connectedStripeAccountId ?? ""}
      />

      <h2 className="text-2xl font-semibold mb-2">Últimas doações</h2>

      {session.user.connectedStripeAccountId && (
        <DonationTable donations={donates.data} />
      )}
    </div>
  );
}
