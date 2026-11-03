import { DashboardSkeleton } from "@/components/shared/skeletons"

export default function AdminLoading() {
  return (
    <DashboardSkeleton
      hasPageHeader={true}
      kpiCount={4}
      kpiColumns={4}
      chartCount={2}
      hasTable={true}
    />
  )
}

