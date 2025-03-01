import HistorySection from '@/app/components/profile/HistorySection'
import FormationsProgress from '@/app/components/profile/FormationsProgress'

export default function HistoriquePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold mb-6">Historique de visionnage</h1>
      <FormationsProgress />
      <HistorySection />
    </div>
  )
} 