import { useGetSettingsQuery } from '../api/adminApi'
import type { ProjectGroup } from '../api/types'
import { PROJECT_GROUPS } from '../api/types'

/** Select options for a project's group, labelled with the admin's AZ titles. */
export function useWorkGroupOptions() {
  const { data } = useGetSettingsQuery()
  const labels: Record<ProjectGroup, string> = {
    primary: data?.workGroups.primary.az || '1-ci qrup',
    secondary: data?.workGroups.secondary.az || '2-ci qrup',
  }
  return {
    enabled: data?.workGroups.enabled ?? false,
    options: PROJECT_GROUPS.map((value) => ({ value, label: labels[value] })),
  }
}
