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

import { useAuth } from '@/lib/auth';
import { AUTH_LIMITS } from '@/lib/constants/auth';
import { showError } from '@/lib/errorHelper';
import { colors } from '@/lib/theme';
import { isValidAuthEmail } from '@/lib/validators/auth';

export default function RegisterScreen() {
  const { register } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState.match(/inactive|background/)) {
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  const emailTouched = email.length > 0;
  const emailValid = isValidAuthEmail(email);
  const passwordLongEnough = password.length >= AUTH_LIMITS.passwordMinLength;
  const passwordsMatch = password === confirmPassword;
  const passwordTouched = password.length > 0;
  const confirmTouched = confirmPassword.length > 0;

  const canSubmit =
    name.trim().length > 0 &&
    emailValid &&
    passwordLongEnough &&
    passwordsMatch;

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }
    if (!emailValid) {
      Alert.alert(t('common.error'), t('auth.invalidEmail'));
      return;
    }
    if (!passwordLongEnough) {
      Alert.alert(t('common.error'), t('auth.passwordTooShort'));
      return;
    }
    if (!passwordsMatch) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (e: unknown) {
      showError(t('common.error'), e, t('auth.registrationFailed'));
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
        <Text className="text-[28px] font-bold text-center text-text-primary mb-[4px]">{t('auth.createAccount')}</Text>
        <Text className="text-[16px] text-center text-text-secondary mb-[32px]">{t('auth.startTracking')}</Text>

        <TextInput
          className="bg-white rounded-[12px] px-[16px] py-[14px] text-[16px] mb-3 border border-border text-text-primary"
          placeholder={t('auth.yourName')}
          placeholderTextColor={colors.textPlaceholder}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        <View
          className="flex-row items-center bg-white rounded-[12px] border border-border"
          style={{ marginBottom: passwordTouched && !passwordLongEnough ? 4 : 12 }}
        >
          <TextInput
            className="flex-1 px-[16px] py-[14px] text-[16px] text-text-primary"
            placeholder={t('auth.passwordMin')}
            placeholderTextColor={colors.textPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          {passwordTouched && passwordLongEnough && (
            <FontAwesome name="check-circle" size={18} color={colors.success} style={{ paddingRight: 14 }} />
          )}
          <Pressable className="px-[14px] py-[14px]" onPress={() => setShowPassword((v) => !v)}>
            <FontAwesome name={showPassword ? 'eye' : 'eye-slash'} size={18} color={colors.textPlaceholder} />
          </Pressable>
        </View>
        {passwordTouched && !passwordLongEnough && (
          <View className="flex-row items-center gap-[6px] mb-[10px] px-[4px]">
            <FontAwesome name="times-circle" size={14} color={colors.primary} />
            <Text className="text-[13px] text-primary">{t('auth.passwordTooShort')}</Text>
          </View>
        )}

        <View
          className="flex-row items-center bg-white rounded-[12px] border border-border"
          style={{ marginBottom: confirmTouched && !passwordsMatch ? 4 : 12 }}
        >
          <TextInput
            className="flex-1 px-[16px] py-[14px] text-[16px] text-text-primary"
            placeholder={t('auth.confirmPassword')}
            placeholderTextColor={colors.textPlaceholder}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          {confirmTouched && passwordsMatch && (
            <FontAwesome name="check-circle" size={18} color={colors.success} style={{ paddingRight: 14 }} />
          )}
          <Pressable className="px-[14px] py-[14px]" onPress={() => setShowConfirmPassword((v) => !v)}>
            <FontAwesome name={showConfirmPassword ? 'eye' : 'eye-slash'} size={18} color={colors.textPlaceholder} />
          </Pressable>
        </View>
        {confirmTouched && !passwordsMatch && (
          <View className="flex-row items-center gap-[6px] mb-[10px] px-[4px]">
            <FontAwesome name="times-circle" size={14} color={colors.primary} />
            <Text className="text-[13px] text-primary">{t('auth.passwordsDoNotMatch')}</Text>
          </View>
        )}

        <Pressable
          className={`bg-primary rounded-[12px] py-[16px] items-center mt-[8px] ${!canSubmit || loading ? 'opacity-70' : ''}`}
          onPress={handleRegister}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text className="text-white text-[17px] font-semibold">{t('auth.createAccount')}</Text>
          )}
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-[24px] items-center">
            <Text className="text-text-secondary text-[14px]">
              {t('auth.hasAccount')} <Text className="text-primary font-semibold">{t('auth.signIn')}</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
