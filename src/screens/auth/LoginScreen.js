import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput, TouchableRipple } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GradientButton } from '../../components/Gradients';
import { clearAuthError, loginThunk, selectAuthError, selectAuthStatus } from '../../store/slices/authSlice';
import { PIAColors, PIAGradients } from '../../theme/theme';

// Accepts either an email or a bare employee ID (e.g. "PIA-4021") as the
// login identifier, per the backend's device-bound login design covering
// both interns and staff. Adjust this pattern once the real employee ID
// format is confirmed — this is a reasonable placeholder shape, not a
// confirmed spec.
const EMPLOYEE_ID_PATTERN = /^[A-Za-z]{2,6}-?\d{3,6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateIdentifier(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email or employee ID';
  if (EMAIL_PATTERN.test(trimmed) || EMPLOYEE_ID_PATTERN.test(trimmed)) return null;
  return 'Enter a valid email or employee ID (e.g. PIA-4021)';
}

function validatePassword(value) {
  if (!value) return 'Enter your password';
  if (value.length < 8) return 'Password must be at least 8 characters';
  return null;
}

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const serverError = useSelector(selectAuthError);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Field errors only show after the person has actually left/interacted
  // with a field ("touched"), not the instant the screen renders empty -
  // showing "Enter your password" before anyone's typed anything reads
  // as broken, not helpful.
  const [touched, setTouched] = useState({ identifier: false, password: false });

  const identifierError = touched.identifier ? validateIdentifier(identifier) : null;
  const passwordError = touched.password ? validatePassword(password) : null;

  const isSubmitting = status === 'loading';

  const handleSubmit = () => {
    setTouched({ identifier: true, password: true });

    const idErr = validateIdentifier(identifier);
    const pwErr = validatePassword(password);
    if (idErr || pwErr) return;

    dispatch(loginThunk({ identifier: identifier.trim(), password }));
  };

  const handleFieldChange = (setter, field) => (value) => {
    if (serverError) dispatch(clearAuthError());
    setter(value);
  };

  return (
    <LinearGradient
      colors={PIAGradients.primaryDark}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandBlock}>
            <View style={styles.logoCircle}>
              <Icon name="airplane" size={36} color={PIAColors.green} />
            </View>
            <Text style={styles.brandTitle}>PIA Intern Portal</Text>
            <Text style={styles.brandSubtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.formCard}>
            <TextInput
              mode="outlined"
              label="Email or Employee ID"
              value={identifier}
              onChangeText={handleFieldChange(setIdentifier)}
              onBlur={() => setTouched((t) => ({ ...t, identifier: true }))}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              error={Boolean(identifierError)}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="account-outline" />}
            />
            <HelperText type="error" visible={Boolean(identifierError)}>
              {identifierError}
            </HelperText>

            <TextInput
              mode="outlined"
              label="Password"
              value={password}
              onChangeText={handleFieldChange(setPassword)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              secureTextEntry={!passwordVisible}
              error={Boolean(passwordError)}
              style={styles.input}
              outlineStyle={styles.inputOutline}
              left={<TextInput.Icon icon="lock-outline" />}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                  onPress={() => setPasswordVisible((v) => !v)}
                />
              }
            />
            <HelperText type="error" visible={Boolean(passwordError)}>
              {passwordError}
            </HelperText>

            {serverError ? (
              <View style={styles.serverErrorBox}>
                <Icon name="alert-circle-outline" size={18} color={PIAColors.error} />
                <Text style={styles.serverErrorText}>{serverError}</Text>
              </View>
            ) : null}

            <TouchableRipple
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPasswordLink}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableRipple>

            <GradientButton
              icon="login"
              label={isSubmitting ? 'Signing in…' : 'Sign In'}
              gradient={PIAGradients.primary}
              disabled={isSubmitting}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  flexFill: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  brandBlock: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PIAColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: { color: PIAColors.white, fontSize: 22, fontWeight: '700' },
  brandSubtitle: { color: PIAColors.white + 'CC', marginTop: 4 },

  formCard: {
    backgroundColor: PIAColors.white,
    borderRadius: 24,
    padding: 20,
  },
  input: { backgroundColor: PIAColors.white },
  inputOutline: { borderRadius: 14 },

  serverErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PIAColors.error + '14',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  serverErrorText: { color: PIAColors.error, marginLeft: 8, flex: 1 },

  forgotPasswordLink: { alignSelf: 'flex-end', marginTop: 4, marginBottom: 8 },
  forgotPasswordText: { color: PIAColors.green, fontWeight: '600' },
});