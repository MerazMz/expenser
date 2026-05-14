import { getSettings } from "@/actions/settings";
import { redirect } from "next/navigation";

export default async function Home() {
  const settings = await getSettings();

  if (!settings) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
