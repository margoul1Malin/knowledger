import { Suspense } from 'react'
import EditParcoursForm from './EditParcoursForm'
import prisma from '@/lib/prisma'

export default async function EditParcoursPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <EditParcoursForm parcoursId={params.id} />
    </Suspense>
  )
} 