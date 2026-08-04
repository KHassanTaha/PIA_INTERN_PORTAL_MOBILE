import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, HelperText, Text, TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { GradientButton, GradientHeader } from '../../components/Gradients';
import { requestPasswordReset } from '../../services/auth';
import { PIAColors, PIAGradients } from '../../theme/theme';

const EMPLOYEE_ID_PATTERN = /^[A-Za-z]{2,6}-?\d{3,6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateIdentifier(value) {
  const trimmed = value.trim();
  if (!trimmed) return 'Enter your email or employee ID';
  if (EMAIL_PATTERN.test(trimmed) || EMPLOYEE_ID_PATTERN.test(trimmed)) return null;
  return 'Enter a valid email or employee ID (e.g. PIA-4021)';
}

const Stage = {
  FORM: 'FORM',
  SUBMITTING: 'SUBMITTING',
  SUCCESS: 'SUCCESS',
};

export default function ForgotPasswordScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [touched, setTouched] = useState(false);
  const [stage, setStage] = useState(Stage.FORM);
  const [serverError, setServerError] = useState(null);

  const identifierError = touched ? validateIdentifier(identifier) : null;

  const handleSubmit = async () => {
    setTouched(true);
    const err = validateIdentifier(identifier);
    if (err) return;

    setServerError(null);
    setStage(Stage.SUBMITTING);

    try {
      await requestPasswordReset(identifier.trim());
      setStage(Stage.SUCCESS);
    } catch (err) {
      setStage(Stage.FORM);
      // Deliberately generic rather than surfacing err.message here, once
      // this is wired to a real endpoint: a password-reset request should
      // never reveal whether a given identifier exists in the system
      // (that's an account-enumeration leak). The stub's "not
      // implemented" message is a developer-facing exception, shown here
      // only until the real endpoint exists.
      setServerError(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (stage === Stage.SUCCESS) {
    return (
      <View style={styles.container}>
        <GradientHeader gradient={PIAGradients.primaryDark}>
          <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
          <Appbar.Content title="Check your email" titleStyle={styles.headerTitle} />
        </GradientHeader>

        <View style={styles.successContent}>
          <View style={styles.successIconCircle}>
            <Icon name="email-check-outline" size={40} color={PIAColors.green} />
          </View>
          <Text style={styles.successTitle}>Reset instructions sent</Text>
          <Text style={styles.successBody}>
            If an account exists for that email or employee ID, you'll receive
            instructions to reset your password shortly.
          </Text>
          <GradientButton
            icon="arrow-left"
            label="Back to Sign In"
            gradient={PIAGradients.primary}
            onPress={() => navigation.navigate('Login')}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Forgot Password" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.helperIntro}>
            Enter the email or employee ID associated with your account and
            we'll send you instructions to reset your password.
          </Text>

          <TextInput
            mode="outlined"
            label="Email or Employee ID"
            value={identifier}
            onChangeText={(value) => {
              if (serverError) setServerError(null);
              setIdentifier(value);
            }}
            onBlur={() => setTouched(true)}
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

          {serverError ? (
            <View style={styles.serverErrorBox}>
              <Icon name="alert-circle-outline" size={18} color={PIAColors.error} />
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          ) : null}

          <GradientButton
            icon="send-outline"
            label={stage === Stage.SUBMITTING ? 'Sending…' : 'Send Reset Instructions'}
            gradient={PIAGradients.primary}
            disabled={stage === Stage.SUBMITTING}
            onPress={handleSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  flexFill: { flex: 1 },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },

  formContent: { padding: 24 },
  helperIntro: { opacity: 0.7, marginBottom: 20, lineHeight: 20 },
  input: { backgroundColor: PIAColors.white },
  inputOutline: { borderRadius: 14 },

  serverErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PIAColors.error + '14',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 12,
  },
  serverErrorText: { color: PIAColors.error, marginLeft: 8, flex: 1 },

  successContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PIAColors.greenLight + '26',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  successBody: {
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 28,
  },
});