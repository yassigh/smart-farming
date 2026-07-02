// app/dashboard/predictions/page.tsx
import PredictionsPage from "@/components/PredictionsPage";
import { getConnectedUser } from "@/actions/auth";
import { FermeModel } from "@/models/ferme";
import { PredictionModel } from "@/models/prediction";

export default async function PredictionsPageWrapper() {
  const user = await getConnectedUser();

  if (!user) {
    return <div>Veuillez vous connecter</div>;
  }

  const fermes = await FermeModel.getByAgriculteur(user.id);
  const predictions = await PredictionModel.getByUser(user.id);

  return (
    <PredictionsPage
      user={user}
      fermes={fermes}
      predictions={predictions}
    />
  );
}