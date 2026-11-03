import { DashboardSkeleton } from "@/components/shared/skeletons"

export default function StudentDashboardLoading() {
  return (
    <DashboardSkeleton
      hasHeroBanner={true}
      hasPageHeader={false}
      kpiCount={4}
      kpiColumns={4}
      chartCount={1}
      hasTable={true}
    />
  )
}

