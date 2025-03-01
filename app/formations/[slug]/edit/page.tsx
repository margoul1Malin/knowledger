import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import FormationForm from "@/app/components/formations/FormationForm";

export default async function EditFormationPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const formation = await prisma.formation.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      category: true,
      videos: true
    }
  });

  if (!formation) {
    redirect("/404");
  }

  if (formation.authorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Modifier la formation</h1>
      <FormationForm initialData={formation} isEditing={true} />
    </div>
  );
} 