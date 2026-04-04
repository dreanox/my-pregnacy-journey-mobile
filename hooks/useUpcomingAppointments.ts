import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/queryKeys';
import { fetchUpcomingAppointments } from '@/lib/services/appointmentsApi';

export function useUpcomingAppointments() {
  return useQuery({
    queryKey: queryKeys.appointments.upcoming,
    queryFn: fetchUpcomingAppointments,
  });
}
