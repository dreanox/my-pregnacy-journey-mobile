import { ActivityIndicator, View } from 'react-native';

import { colors } from '@/lib/theme';

type AppBrandedLoaderProps = {
  /** Spinner centrado (p. ej. mientras resuelve sesión tras el splash nativo). */
  showSpinner?: boolean;
};

/** Misma base que el splash nativo: solo color, sin logo (coherente con apps solo-fondo). */
export function AppBrandedLoader({ showSpinner = false }: AppBrandedLoaderProps) {
  return (
    <View
      className="flex-1 justify-center items-center"
      style={{ backgroundColor: colors.primarySoft }}
    >
      {showSpinner ? <ActivityIndicator size="large" color={colors.primary} /> : null}
    </View>
  );
}
