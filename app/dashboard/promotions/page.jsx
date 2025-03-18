import { redirect } from "next/navigation";
import PromotionsDashboard from "@/components/PromotionsDashboard";

export default async function PromotionsPage() {
  return <PromotionsDashboard />;
}
