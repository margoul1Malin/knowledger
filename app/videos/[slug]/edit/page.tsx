import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import VideoForm from "@/app/components/videos/VideoForm";

export default async function EditVideoPage({ params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const video = await prisma.video.findUnique({
    where: { slug: params.slug },
    include: {
      author: true,
      category: true
    }
  });

  if (!video) {
    redirect("/404");
  }

  if (video.authorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Modifier la vidéo</h1>
      <VideoForm initialData={video} isEditing={true} />
    </div>
  );
} 