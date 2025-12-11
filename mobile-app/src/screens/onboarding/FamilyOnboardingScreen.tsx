import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '../../components';
import { theme } from '../../theme';
import {
  MaritalStatus,
  MARITAL_STATUS_LABELS,
  FamilyOnboardingData,
  OnboardingChild,
  SpouseSuggestion,
  DEFAULT_ONBOARDING_DATA,
} from '../../types/family';
import {
  findPotentialSpouses,
  searchUsers,
  completeFamilyOnboarding,
  skipOnboarding,
} from '../../services/family';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FamilyOnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [data, setData] = useState<FamilyOnboardingData>(DEFAULT_ONBOARDING_DATA);

  // Spouse suggestions
  const [spouseSuggestions, setSpouseSuggestions] = useState<SpouseSuggestion[]>([]);
  const [spouseSearch, setSpouseSearch] = useState('');
  const [searchResults, setSearchResults] = useState<SpouseSuggestion[]>([]);
  const [selectedSpouse, setSelectedSpouse] = useState<SpouseSuggestion | null>(null);

  // Children
  const [numberOfChildren, setNumberOfChildren] = useState('');

  useEffect(() => {
    loadSpouseSuggestions();
  }, []);

  const loadSpouseSuggestions = async () => {
    setLoading(true);
    try {
      const suggestions = await findPotentialSpouses();
      setSpouseSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading spouse suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpouseSearch = async (text: string) => {
    setSpouseSearch(text);
    if (text.length >= 2) {
      const results = await searchUsers(text);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectSpouse = (spouse: SpouseSuggestion) => {
    setSelectedSpouse(spouse);
    setData({ ...data, spouseId: spouse.userId, spouseName: null });
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    scrollRef.current?.scrollTo({ x: step * SCREEN_WIDTH, animated: true });
  };

  const nextStep = () => {
    // Validation & conditional logic
    if (currentStep === 0) {
      // After marital status, go to spouse if married, else children
      if (data.maritalStatus === 'married') {
        goToStep(1);
      } else {
        goToStep(2);
      }
    } else if (currentStep === 1) {
      goToStep(2);
    } else if (currentStep === 2) {
      if (data.hasChildren && data.children.length === 0) {
        // Initialize children array
        const count = parseInt(numberOfChildren) || 1;
        const children: OnboardingChild[] = Array(count)
          .fill(null)
          .map(() => ({ name: '', age: 0, registerForSundaySchool: true }));
        setData({ ...data, children });
      }
      if (data.hasChildren) {
        goToStep(3);
      } else {
        handleComplete();
      }
    }
  };

  const handleSkip = async () => {
    try {
      await skipOnboarding();
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      await completeFamilyOnboarding(data);
      Alert.alert('Welcome!', 'Your family profile has been set up.', [
        { text: 'OK', onPress: () => navigation.replace('MainTabs') },
      ]);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save family information. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateChild = (index: number, field: keyof OnboardingChild, value: any) => {
    const updatedChildren = [...data.children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    setData({ ...data, children: updatedChildren });
  };

  const addChild = () => {
    setData({
      ...data,
      children: [...data.children, { name: '', age: 0, registerForSundaySchool: true }],
    });
  };

  const removeChild = (index: number) => {
    const updatedChildren = data.children.filter((_, i) => i !== index);
    setData({ ...data, children: updatedChildren });
  };

  // Step 1: Marital Status
  const renderMaritalStatusStep = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Let's get to know your family</Text>
        <Text style={styles.stepSubtitle}>What's your marital status?</Text>
      </View>

      <View style={styles.optionsContainer}>
        {(Object.keys(MARITAL_STATUS_LABELS) as MaritalStatus[]).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.optionCard,
              data.maritalStatus === status && styles.optionCardSelected,
            ]}
            onPress={() => setData({ ...data, maritalStatus: status })}
          >
            <Ionicons
              name={
                status === 'married'
                  ? 'heart'
                  : status === 'single'
                  ? 'person'
                  : status === 'widowed'
                  ? 'flower'
                  : 'heart-dislike'
              }
              size={28}
              color={data.maritalStatus === status ? '#FFF' : theme.colors.primary}
            />
            <Text
              style={[
                styles.optionText,
                data.maritalStatus === status && styles.optionTextSelected,
              ]}
            >
              {MARITAL_STATUS_LABELS[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Step 2: Spouse Linking
  const renderSpouseStep = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Link your spouse</Text>
        <Text style={styles.stepSubtitle}>Is your spouse on the app?</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} />
      ) : (
        <>
          {/* Suggestions */}
          {spouseSuggestions.length > 0 && !selectedSpouse && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionLabel}>
                💡 We found a possible match:
              </Text>
              {spouseSuggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.userId}
                  style={styles.suggestionCard}
                  onPress={() => selectSpouse(suggestion)}
                >
                  <Avatar
                    imageUrl={suggestion.photoURL}
                    name={suggestion.displayName}
                    size="medium"
                  />
                  <View style={styles.suggestionInfo}>
                    <Text style={styles.suggestionName}>{suggestion.displayName}</Text>
                    <Text style={styles.suggestionEmail}>{suggestion.email}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => selectSpouse(suggestion)}
                  >
                    <Text style={styles.selectButtonText}>That's them!</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Selected spouse */}
          {selectedSpouse && (
            <View style={styles.selectedSpouseCard}>
              <Ionicons name="checkmark-circle" size={24} color="#2E7D32" />
              <Avatar
                imageUrl={selectedSpouse.photoURL}
                name={selectedSpouse.displayName}
                size="small"
              />
              <Text style={styles.selectedSpouseName}>{selectedSpouse.displayName}</Text>
              <TouchableOpacity onPress={() => setSelectedSpouse(null)}>
                <Ionicons name="close-circle" size={24} color="#999" />
              </TouchableOpacity>
            </View>
          )}

          {/* Manual search */}
          {!selectedSpouse && (
            <View style={styles.searchSection}>
              <Text style={styles.searchLabel}>Not listed? Search by name or email:</Text>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor="#999"
                  value={spouseSearch}
                  onChangeText={handleSpouseSearch}
                />
              </View>

              {searchResults.map((result) => (
                <TouchableOpacity
                  key={result.userId}
                  style={styles.searchResultCard}
                  onPress={() => selectSpouse(result)}
                >
                  <Avatar
                    imageUrl={result.photoURL}
                    name={result.displayName}
                    size="small"
                  />
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{result.displayName}</Text>
                    <Text style={styles.searchResultEmail}>{result.email}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Manual name entry */}
          {!selectedSpouse && spouseSuggestions.length === 0 && (
            <View style={styles.manualEntrySection}>
              <Text style={styles.manualEntryLabel}>
                Or enter their name (if not on app):
              </Text>
              <TextInput
                style={styles.manualEntryInput}
                placeholder="Spouse's name"
                placeholderTextColor="#999"
                value={data.spouseName || ''}
                onChangeText={(text) => setData({ ...data, spouseName: text, spouseId: null })}
              />
            </View>
          )}
        </>
      )}
    </View>
  );

  // Step 3: Children
  const renderChildrenStep = () => (
    <View style={styles.step}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Do you have children?</Text>
        <Text style={styles.stepSubtitle}>We'll help you register them for Sunday School</Text>
      </View>

      <View style={styles.childrenOptions}>
        <TouchableOpacity
          style={[
            styles.childOptionCard,
            data.hasChildren === false && styles.childOptionCardSelected,
          ]}
          onPress={() => setData({ ...data, hasChildren: false, children: [] })}
        >
          <Ionicons
            name="close-circle-outline"
            size={32}
            color={data.hasChildren === false ? '#FFF' : theme.colors.primary}
          />
          <Text
            style={[
              styles.childOptionText,
              data.hasChildren === false && styles.childOptionTextSelected,
            ]}
          >
            No children
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.childOptionCard,
            data.hasChildren === true && styles.childOptionCardSelected,
          ]}
          onPress={() => setData({ ...data, hasChildren: true })}
        >
          <Ionicons
            name="people"
            size={32}
            color={data.hasChildren === true ? '#FFF' : theme.colors.primary}
          />
          <Text
            style={[
              styles.childOptionText,
              data.hasChildren === true && styles.childOptionTextSelected,
            ]}
          >
            Yes
          </Text>
        </TouchableOpacity>
      </View>

      {data.hasChildren && (
        <View style={styles.childCountSection}>
          <Text style={styles.childCountLabel}>How many children?</Text>
          <TextInput
            style={styles.childCountInput}
            placeholder="e.g., 2"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={numberOfChildren}
            onChangeText={setNumberOfChildren}
            maxLength={2}
          />
        </View>
      )}
    </View>
  );

  // Step 4: Child Details
  const renderChildDetailsStep = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.step}
    >
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Quick child info</Text>
        <Text style={styles.stepSubtitle}>Add basic details for each child</Text>
      </View>

      <ScrollView style={styles.childrenList} nestedScrollEnabled>
        {data.children.map((child, index) => (
          <View key={index} style={styles.childCard}>
            <View style={styles.childCardHeader}>
              <Text style={styles.childCardTitle}>Child {index + 1}</Text>
              {data.children.length > 1 && (
                <TouchableOpacity onPress={() => removeChild(index)}>
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              )}
            </View>

            <TextInput
              style={styles.childInput}
              placeholder="Name"
              placeholderTextColor="#999"
              value={child.name}
              onChangeText={(text) => updateChild(index, 'name', text)}
            />

            <TextInput
              style={styles.childInput}
              placeholder="Age"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={child.age ? child.age.toString() : ''}
              onChangeText={(text) => updateChild(index, 'age', parseInt(text) || 0)}
              maxLength={2}
            />

            <TouchableOpacity
              style={styles.sundaySchoolToggle}
              onPress={() =>
                updateChild(index, 'registerForSundaySchool', !child.registerForSundaySchool)
              }
            >
              <Ionicons
                name={child.registerForSundaySchool ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.sundaySchoolToggleText}>Register for Sunday School</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addChildButton} onPress={addChild}>
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.addChildText}>Add another child</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const steps = [
    renderMaritalStatusStep,
    renderSpouseStep,
    renderChildrenStep,
    renderChildDetailsStep,
  ];

  const totalSteps = data.maritalStatus === 'married' ? 4 : 3;
  const isLastStep = currentStep === (data.hasChildren ? 3 : 2);

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <View style={styles.progressDots}>
          {Array(totalSteps)
            .fill(null)
            .map((_, i) => (
              <View
                key={i}
                style={[styles.progressDot, currentStep >= i && styles.progressDotActive]}
              />
            ))}
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* Steps */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
      >
        {steps.map((StepComponent, index) => (
          <View key={index} style={{ width: SCREEN_WIDTH }}>
            {StepComponent()}
          </View>
        ))}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => goToStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.continueButton, submitting && styles.continueButtonDisabled]}
          onPress={isLastStep ? handleComplete : nextStep}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {isLastStep ? 'Done' : 'Continue'}
              </Text>
              <Ionicons
                name={isLastStep ? 'checkmark' : 'arrow-forward'}
                size={20}
                color="#FFF"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  skipButton: {
    width: 50,
  },
  skipText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  progressDotActive: {
    backgroundColor: theme.colors.primary,
    width: 24,
  },
  step: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepHeader: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 16,
  },
  optionCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 18,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FFF',
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    gap: 12,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  suggestionEmail: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  selectButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  selectedSpouseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    gap: 12,
    marginBottom: 24,
  },
  selectedSpouseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  searchSection: {
    marginTop: 16,
  },
  searchLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginTop: 8,
    gap: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  searchResultEmail: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  manualEntrySection: {
    marginTop: 24,
  },
  manualEntryLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  manualEntryInput: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: theme.colors.text.primary,
  },
  childrenOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  childOptionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  childOptionCardSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  childOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  childOptionTextSelected: {
    color: '#FFF',
  },
  childCountSection: {
    marginTop: 32,
  },
  childCountLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  childCountInput: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    color: theme.colors.text.primary,
    textAlign: 'center',
    width: 100,
  },
  childrenList: {
    flex: 1,
  },
  childCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  childCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  childCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  childInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    color: theme.colors.text.primary,
  },
  sundaySchoolToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  sundaySchoolToggleText: {
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  addChildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  addChildText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginLeft: 16,
    gap: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
