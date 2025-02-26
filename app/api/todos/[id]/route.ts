import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const body = await request.json()
    const todo = await prisma.todo.update({
      where: {
        id: params.id
      },
      data: {
        status: body.status
      }
    })
    
    return NextResponse.json(todo)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    await prisma.todo.delete({
      where: {
        id: params.id
      }
    })
    
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
