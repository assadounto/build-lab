import { redirect } from "next/navigation";

export default async function ProfessionalWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/studio/${id}`);
}
