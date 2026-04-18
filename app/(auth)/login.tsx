import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';
import { useAuth } from '@/lib/auth';
import { showError } from '@/lib/errorHelper';
import { shouldShowLoginScreenApiTest } from '@/lib/featureFlags';
import { testConnection } from '@/lib/services/connectionApi';
import * as Sentry from '@sentry/react-native';
import { colors } from '@/lib/theme';
import { isValidAuthEmail } from '@/lib/validators/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState.match(/inactive|background/)) {
        setShowPassword(false);
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const emailTouched = email.length > 0;
  const emailValid = isValidAuthEmail(email);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }
    if (!emailValid) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: unknown) {
      showError(t('common.error'), e, t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-primary-soft"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-[32px]">
        <Text className="text-[64px] text-center mb-[8px]">🤰</Text>
        <Text className="text-[28px] font-bold text-center text-text-primary mb-[4px]">{t('auth.appName')}</Text>
        <Text className="text-[16px] text-center text-text-secondary mb-[32px]">{t('auth.welcomeBack')}</Text>

        <View
          className="flex-row items-center bg-white rounded-[12px] border border-border"
          style={{ marginBottom: emailTouched && !emailValid ? 4 : 12 }}
        >
          <TextInput
            className="flex-1 px-[16px] py-[14px] text-[16px] text-text-primary"
            placeholder={t('auth.email')}
            placeholderTextColor={colors.textPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {emailTouched && emailValid && (
            <FontAwesome name="check-circle" size={18} color={colors.success} style={{ paddingRight: 14 }} />
          )}
        </View>
        {emailTouched && !emailValid && (
          <View className="flex-row items-center gap-[6px] mb-[10px] px-[4px]">
            <FontAwesome name="times-circle" size={14} color={colors.primary} />
            <Text className="text-[13px] text-primary">{t('auth.invalidEmail')}</Text>
          </View>
        )}

        <View className="flex-row items-center bg-white rounded-[12px] border border-border mb-3">
          <TextInput
            className="flex-1 px-[16px] py-[14px] text-[16px] text-text-primary"
            placeholder={t('auth.password')}
            placeholderTextColor={colors.textPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable className="px-[14px] py-[14px]" onPress={() => setShowPassword((v) => !v)}>
            <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} color={colors.textPlaceholder} />
          </Pressable>
        </View>

        <Pressable
          className={`bg-primary rounded-[12px] py-[16px] items-center mt-[8px] ${loading ? 'opacity-70' : ''}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text className="text-white text-[17px] font-semibold">{t('auth.signIn')}</Text>
          )}
        </Pressable>

        <Link href="/(auth)/register" asChild>
          <Pressable className="mt-[24px] items-center">
            <Text className="text-text-secondary text-[14px]">
              {t('auth.noAccount')} <Text className="text-primary font-semibold">{t('auth.signUp')}</Text>
            </Text>
          </Pressable>
        </Link>

        <MedicalDisclaimer variant="inline" className="mt-6 px-1" />

        {shouldShowLoginScreenApiTest() && (
          <Pressable
            className={`mt-[32px] flex-row gap-[10px] justify-center border-2 border-primary rounded-[12px] py-[14px] items-center bg-transparent ${testing ? 'opacity-70' : ''}`}
            onPress={async () => {
              setTesting(true);
              const result = await testConnection();
              setTesting(false);
              const titles = { ok: 'API Connected', warning: 'API Warning', error: 'API Disconnected' };
              Alert.alert(titles[result.status], result.detail);
            }}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <>
                <FontAwesome name="plug" size={18} color={colors.primary} />
                <Text className="text-primary text-[16px] font-semibold">{t('profile.testApiConnection')}</Text>
              </>
            )}
          </Pressable>
        )}

        {shouldShowLoginScreenApiTest() && (
          <Pressable
            className="mt-[16px] flex-row gap-[10px] justify-center border-2 border-red-400 rounded-[12px] py-[14px] items-center bg-transparent"
            onPress={() => Sentry.captureException(new Error('First error'))}
          >
            <FontAwesome name="bug" size={18} color="#f87171" />
            <Text className="text-red-400 text-[16px] font-semibold">Test Sentry</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
