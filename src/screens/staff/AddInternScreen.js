import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Snackbar, Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

import { GradientButton, GradientHeader } from '../../components/Gradients';
import {
  FormField,
  FormSelect,
  FormDatePicker,
  useFormState,
  validators,
} from '../../components/Form';
import { PIAColors, PIAGradients } from '../../theme/theme';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { createInternThunk } from '../../store/slices/staffDataSlice';

// ASSUMPTION, still open: selectCurrentUser's real field names. authSlice.js
// doesn't show what `result.user` (from services/auth.js's loginApi)
// actually contains — role/departmentId/departmentName/userId/fullName
// below are the fields this screen needs to exist on that object. Confirm
// against services/auth.js or the real .NET login response shape.
//
// ASSUMPTION, still open: departmentOptions/employeeOptions sourcing.
// staffDataSlice.js has no department or employee-list domain yet (only
// interns/attendance/tasks/signatures/auditLogs) — this screen needs a
// source for FormSelect's option lists. Simplest fix once the real
// employee/department domains exist: add fetchDepartmentsThunk /
// fetchEmployeesThunk following the exact same domainReducers() pattern
// already in staffDataSlice.js, then select from those. Stubbed as a
// local hardcoded array below so the screen is demonstrable now — replace
// the two arrays immediately once a real source exists, don't build
// anything else on top of these placeholders.
const STUB_DEPARTMENT_OPTIONS = [
  { label: 'IT', value: 1 },
  { label: 'HR', value: 2 },
  { label: 'Finance', value: 3 },
  { label: 'Marketing', value: 4 },
];

const STUB_EMPLOYEE_OPTIONS = [
  { label: 'S. Ahmed', value: 101 },
  { label: 'F. Khan', value: 102 },
];

export default function AddInternScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'admin';

  const departmentOptions = STUB_DEPARTMENT_OPTIONS;
  const employeeOptions = STUB_EMPLOYEE_OPTIONS;

  const initialValues = useMemo(
    () => ({
      fullName: '',
      email: '',
      departmentId: isAdmin ? null : currentUser?.department_id ?? null,
      mentorId: isAdmin ? null : currentUser?.user_id ?? null,
      startDate: null,
      endDate: null,
    }),
    [isAdmin, currentUser],
  );

  const schema = useMemo(
    () => ({
      fullName: validators.required('Full name is required'),
      email: validators.combine(validators.required(), validators.email()),
      departmentId: validators.required('Select a department'),
      mentorId: validators.required('Select a mentor'),
      startDate: validators.required('Select a start date'),
      endDate: validators.combine(
        validators.required('Select an end date'),
        (value, allValues) => {
          if (!value || !allValues.startDate) return null;
          const start = new Date(allValues.startDate);
          const end = new Date(value);
          return end >= start ? null : 'End date must be on or after start date';
        },
      ),
    }),
    [],
  );

  const form = useFormState(initialValues, schema);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.validate()) return;

    setSubmitting(true);
    try {
      await dispatch(
        createInternThunk({
          fullName: form.values.fullName.trim(),
          email: form.values.email.trim(),
          departmentId: form.values.departmentId,
          mentorId: form.values.mentorId,
          startDate: form.values.startDate,
          endDate: form.values.endDate,
          // Passed through only so the mock store can render a display
          // string without changing InternsScreen.js's existing column
          // shape — the real .NET endpoint only needs the IDs above; it
          // resolves display names server-side. See staffData.js note.
          departmentLabel: departmentOptions.find((o) => o.value === form.values.departmentId)?.label,
          mentorLabel: employeeOptions.find((o) => o.value === form.values.mentorId)?.label,
        }),
      ).unwrap();

      setSnackbar({ visible: true, message: 'Intern added successfully' });
      setTimeout(() => navigation.goBack(), 900);
    } catch (err) {
      setSnackbar({
        visible: true,
        message: err || 'Could not add intern. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <GradientHeader gradient={PIAGradients.primaryDark}>
        <Appbar.BackAction color={PIAColors.white} onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Intern" titleStyle={styles.headerTitle} />
      </GradientHeader>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="bodyMedium" style={styles.subtitle}>
          {isAdmin
            ? 'Create an intern account and assign their department and mentor.'
            : 'This intern will be assigned to your department, under your mentorship.'}
        </Text>

        <FormField
          label="Full Name"
          required
          value={form.values.fullName}
          onChangeText={(v) => form.handleChange('fullName', v)}
          onBlur={() => form.handleBlur('fullName')}
          error={form.getFieldError('fullName')}
        />

        <FormField
          label="Email"
          required
          value={form.values.email}
          onChangeText={(v) => form.handleChange('email', v)}
          onBlur={() => form.handleBlur('email')}
          error={form.getFieldError('email')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />

        {isAdmin ? (
          <FormSelect
            label="Department"
            required
            value={form.values.departmentId}
            onSelect={(v) => {
              form.handleChange('departmentId', v);
              form.handleBlur('departmentId');
            }}
            options={departmentOptions}
            error={form.getFieldError('departmentId')}
          />
        ) : (
          <FormField
            label="Department"
            required
            value={currentUser?.department_id ?? ''}  // ASSUMPTION — shows raw id, not name, until resolved
            editable={false}
          />
        )}

        {isAdmin ? (
          <FormSelect
            label="Mentor"
            required
            value={form.values.mentorId}
            onSelect={(v) => {
              form.handleChange('mentorId', v);
              form.handleBlur('mentorId');
            }}
            options={employeeOptions}
            error={form.getFieldError('mentorId')}
          />
        ) : (
          <FormField
            label="Mentor"
            required
            value={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : ''}
            editable={false}
          />
        )}

        <FormDatePicker
          label="Start Date"
          required
          value={form.values.startDate}
          onChange={(date) => {
            form.handleChange('startDate', date);
            form.handleBlur('startDate');
          }}
          error={form.getFieldError('startDate')}
        />

        <FormDatePicker
          label="End Date"
          required
          value={form.values.endDate}
          onChange={(date) => {
            form.handleChange('endDate', date);
            form.handleBlur('endDate');
          }}
          error={form.getFieldError('endDate')}
          minimumDate={form.values.startDate || undefined}
        />

        <View style={styles.submitWrapper}>
          <GradientButton
            icon="account-plus-outline"
            label={submitting ? 'Adding…' : 'Add Intern'}
            gradient={PIAGradients.primary}
            disabled={submitting}
            loading={submitting}
            onPress={handleSubmit}
          />
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
        duration={2500}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PIAColors.offWhite },
  headerTitle: { color: PIAColors.white, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  subtitle: { marginBottom: 20, opacity: 0.7 },
  submitWrapper: { marginTop: 12 },
});