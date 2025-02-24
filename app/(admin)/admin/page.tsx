import { UsersIcon, NewspaperIcon, VideoCameraIcon, AcademicCapIcon } from '@heroicons/react/24/outline'
import prisma from '@/lib/prisma'

async function getStats() {
  const [users, articles, videos, formations] = await Promise.all([
    prisma.user.count(),
    prisma.article.count(),
    prisma.video.count(),
    prisma.formation.count(),
  ])

  return { users, articles, videos, formations }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Utilisateurs"
          value={stats.users}
          icon={UsersIcon}
          href="/admin/users"
        />
        <StatCard 
          title="Articles"
          value={stats.articles}
          icon={NewspaperIcon}
          href="/admin/articles"
        />
        <StatCard 
          title="Vidéos"
          value={stats.videos}
          icon={VideoCameraIcon}
          href="/admin/videos"
        />
        <StatCard 
          title="Formations"
          value={stats.formations}
          icon={AcademicCapIcon}
          href="/admin/formations"
        />
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  href 
}: { 
  title: string
  value: number
  icon: any
  href: string 
}) {
  return (
    <a 
      href={href}
      className="p-6 bg-card border border-border rounded-xl hover:border-primary transition-colors"
    >
      <div className="flex items-center gap-4">
        <Icon className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </a>
  )
} 