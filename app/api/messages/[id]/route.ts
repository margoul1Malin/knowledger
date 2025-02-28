import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Non autorisé", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Non autorisé", { status: 403 })
    }

    const { status } = await req.json()

    if (!status || !["UNREAD", "READ", "ARCHIVED"].includes(status)) {
      return new NextResponse("Statut invalide", { status: 400 })
    }

    const message = await prisma.message.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("[MESSAGE_PATCH]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Non autorisé", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || user.role !== "ADMIN") {
      return new NextResponse("Non autorisé", { status: 403 })
    }

    await prisma.message.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[MESSAGE_DELETE]", error)
    return new NextResponse("Erreur interne", { status: 500 })
  }
} 