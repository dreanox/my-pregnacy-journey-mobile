/**
 * Theme-aware Text/View using app palette (single light theme; dark follows system text/background contrast).
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

import { colors } from '@/lib/theme';
import { useColorScheme } from './useColorScheme';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function useThemeColor(
  props: { light?: string; dark?: string },
  kind: 'text' | 'background'
) {
  const scheme = useColorScheme() ?? 'light';
  const colorFromProps = scheme === 'dark' ? props.dark : props.light;

  if (colorFromProps) {
    return colorFromProps;
  }

  if (kind === 'text') {
    return scheme === 'dark' ? '#f5f5f5' : colors.textPrimary;
  }

  return scheme === 'dark' ? '#121212' : colors.surface;
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
