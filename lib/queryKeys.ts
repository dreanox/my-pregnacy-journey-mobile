export const queryKeys = {
  pregnancies: {
    all: ['pregnancies'] as const,
  },
  weekEntries: {
    all: ['weekEntries'] as const,
    byPregnancy: (pregnancyId: number) => ['weekEntries', pregnancyId] as const,
  },
  weekEntry: {
    all: ['weekEntry'] as const,
    detail: (id: string) => ['weekEntry', id] as const,
  },
  gallery: {
    all: ['gallery'] as const,
  },
  appointments: {
    upcoming: ['appointments-upcoming'] as const,
  },
} as const;
