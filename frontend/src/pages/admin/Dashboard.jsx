import DashboardOverview from '../../components/DashboardOverview'
import { PageHeader } from '../../components/ui'

export default function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of your appointments." />
      <DashboardOverview />
    </>
  )
}
