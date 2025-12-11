import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import {
  SundaySchoolClass,
  AgeGroup,
  AGE_GROUP_LABELS,
  getAgeGroupFromDOB,
} from '../../types/sundaySchool';
import { getAllClasses, registerChild } from '../../services/sundaySchool';

export const ChildRegistrationScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const user = auth.currentUser;

  const [classes, setClasses] = useState<SundaySchoolClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [allergies, setAllergies] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classData = await getAllClasses();
      setClasses(classData);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter the child\'s first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Missing Information', 'Please enter the child\'s last name');
      return false;
    }
    if (!dateOfBirth.trim()) {
      Alert.alert('Missing Information', 'Please enter the child\'s date of birth');
      return false;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format (e.g., 2015-06-15)');
      return false;
    }

    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      Alert.alert('Missing Information', 'Please provide emergency contact information');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const ageGroup = getAgeGroupFromDOB(dateOfBirth);
      const selectedClass = classes.find((c) => c.id === selectedClassId);

      await registerChild({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth,
        ageGroup,
        classId: selectedClassId || undefined,
        className: selectedClass?.name,
        parentIds: user ? [user.uid] : [],
        parentNames: user ? [user.displayName || 'Unknown'] : [],
        parentPhones: [],
        allergies: allergies.trim() || undefined,
        medicalNotes: medicalNotes.trim() || undefined,
        emergencyContact: {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relationship: emergencyRelationship.trim() || 'Parent/Guardian',
        },
        isActive: true,
      });

      Alert.alert('Success', 'Child registered successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error registering child:', error);
      Alert.alert('Error', 'Failed to register child. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <ScreenHeader title="Register Child" showBackButton />

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Child Information */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Child Information
          </Text>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>First Name *</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Last Name *</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
              Date of Birth * (YYYY-MM-DD)
            </Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              placeholder="e.g., 2015-06-15"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="numbers-and-punctuation"
            />
            {dateOfBirth && /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) && (
              <Text style={[styles.ageGroupHint, { color: theme.colors.primary }]}>
                Age Group: {AGE_GROUP_LABELS[getAgeGroupFromDOB(dateOfBirth)]}
              </Text>
            )}
          </View>

          {/* Class Selection */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Class Assignment (Optional)
          </Text>

          {loadingClasses ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
              <TouchableOpacity
                style={[
                  styles.classChip,
                  !selectedClassId && styles.classChipSelected,
                  { borderColor: theme.colors.primary },
                ]}
                onPress={() => setSelectedClassId(null)}
              >
                <Text
                  style={[
                    styles.classChipText,
                    { color: !selectedClassId ? '#FFF' : theme.colors.primary },
                  ]}
                >
                  No Class
                </Text>
              </TouchableOpacity>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls.id}
                  style={[
                    styles.classChip,
                    selectedClassId === cls.id && styles.classChipSelected,
                    { borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setSelectedClassId(cls.id)}
                >
                  <Text
                    style={[
                      styles.classChipText,
                      { color: selectedClassId === cls.id ? '#FFF' : theme.colors.primary },
                    ]}
                  >
                    {cls.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Medical Information */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Medical Information
          </Text>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Allergies</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.colors.text.primary }]}
              value={allergies}
              onChangeText={setAllergies}
              placeholder="List any allergies"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Medical Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.colors.text.primary }]}
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              placeholder="Any medical conditions or special needs"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={2}
            />
          </View>

          {/* Emergency Contact */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Emergency Contact *
          </Text>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Contact Name *</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              value={emergencyName}
              onChangeText={setEmergencyName}
              placeholder="Enter contact name"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Phone Number *</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              placeholder="Enter phone number"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={[styles.inputGroup, { backgroundColor: theme.colors.background.secondary }]}>
            <Text style={[styles.label, { color: theme.colors.text.secondary }]}>Relationship</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.text.primary }]}
              value={emergencyRelationship}
              onChangeText={setEmergencyRelationship}
              placeholder="e.g., Mother, Father, Grandparent"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="person-add" size={20} color="#FFF" />
                <Text style={styles.submitButtonText}>Register Child</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  inputGroup: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  ageGroupHint: {
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  classScroll: {
    marginBottom: 8,
  },
  classChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  classChipSelected: {
    backgroundColor: '#8B0000',
  },
  classChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
