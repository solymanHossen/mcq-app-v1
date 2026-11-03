import { DashboardSkeleton } from "@/components/shared/skeletons"

export default function TeacherLoading() {
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

