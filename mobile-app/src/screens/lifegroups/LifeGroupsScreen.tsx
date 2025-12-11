import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button, Avatar, ScreenHeader } from '../../components';
import { useTheme } from '../../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../../services/firebase';
import {
  FridayPrayer,
  RSVP,
  getCurrentFridayPrayer,
  subscribeFridayPrayerRSVPs,
  getUserRSVP,
  createRSVP as createRSVPService,
  cancelRSVP as cancelRSVPService,
} from '../../services/fridayPrayer';
import {
  LifeGroupMaterial,
  getAllMaterials,
  subscribeMaterials,
} from '../../services/lifeGroupMaterials';
import { ensureFridayPrayerExists } from '../../services/weeklyFridayPrayer';

export const LifeGroupsScreen = () => {
  const { theme } = useTheme();
  const user = auth.currentUser;
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState('1');
  const [selectedMaterial, setSelectedMaterial] = useState<LifeGroupMaterial | null>(null);

  // Firebase state
  const [fridayPrayer, setFridayPrayer] = useState<FridayPrayer | null>(null);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [userRSVP, setUserRSVP] = useState<RSVP | null>(null);
  const [lifeGroupMaterials, setLifeGroupMaterials] = useState<LifeGroupMaterial[]>([]);

  // Loading states
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  const [loadingMaterials, setLoadingMaterials] = useState(true);
  const [submittingRSVP, setSubmittingRSVP] = useState(false);

  // Load Friday Prayer and RSVPs
  useEffect(() => {
    loadFridayPrayer();
  }, []);

  // Subscribe to RSVP changes when we have a prayer
  useEffect(() => {
    if (!fridayPrayer?.id) return;

    const unsubscribe = subscribeFridayPrayerRSVPs(
      fridayPrayer.id,
      (updatedRsvps) => {
        setRsvps(updatedRsvps);
        // Update user's RSVP status
        const myRsvp = updatedRsvps.find((r) => r.userId === user?.uid);
        setUserRSVP(myRsvp || null);
      },
      (error) => {
        console.error('Error subscribing to RSVPs:', error);
      }
    );

    return () => unsubscribe();
  }, [fridayPrayer?.id, user?.uid]);

  // Subscribe to materials changes
  useEffect(() => {
    const unsubscribe = subscribeMaterials(
      (materials) => {
        setLifeGroupMaterials(materials);
        setLoadingMaterials(false);
      },
      (error) => {
        console.error('Error subscribing to materials:', error);
        setLoadingMaterials(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loadFridayPrayer = async () => {
    try {
      setLoadingPrayer(true);

      // Auto-create Friday Prayer if it doesn't exist
      await ensureFridayPrayerExists();

      const prayer = await getCurrentFridayPrayer();
      setFridayPrayer(prayer);

      if (prayer && user?.uid) {
        const myRsvp = await getUserRSVP(prayer.id, user.uid);
        setUserRSVP(myRsvp);
      }
    } catch (error) {
      console.error('Error loading Friday Prayer:', error);
      Alert.alert('Error', 'Failed to load Friday Prayer information');
    } finally {
      setLoadingPrayer(false);
    }
  };

  const totalAttendees = rsvps.reduce((sum, rsvp) => sum + rsvp.numberOfPeople, 0);
  const userHasRSVPd = userRSVP !== null;

  const handleRSVP = async () => {
    if (!fridayPrayer) {
      Alert.alert('Error', 'No Friday Prayer event available');
      return;
    }

    const numPeople = parseInt(numberOfPeople);
    if (isNaN(numPeople) || numPeople < 1) {
      Alert.alert('Invalid Number', 'Please enter a valid number of people');
      return;
    }

    try {
      setSubmittingRSVP(true);
      await createRSVPService({
        prayerId: fridayPrayer.id,
        numberOfPeople: numPeople,
      });

      setShowRSVPModal(false);
      setNumberOfPeople('1');
      Alert.alert(
        'RSVP Confirmed!',
        `You've confirmed ${numPeople} ${numPeople === 1 ? 'person' : 'people'} for Friday Prayer`
      );
    } catch (error: any) {
      console.error('Error creating RSVP:', error);
      Alert.alert('Error', error.message || 'Failed to create RSVP');
    } finally {
      setSubmittingRSVP(false);
    }
  };

  const handleCancelRSVP = async () => {
    if (!userRSVP) return;

    Alert.alert(
      'Cancel RSVP',
      'Are you sure you want to cancel your RSVP?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRSVPService(userRSVP.id);
              Alert.alert('RSVP Cancelled', 'Your RSVP has been removed');
            } catch (error) {
              console.error('Error cancelling RSVP:', error);
              Alert.alert('Error', 'Failed to cancel RSVP');
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader
        title="Life Groups"
        subtitle="Iron sharpens iron"
        showLogo={true}
        theme={theme}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Friday Prayer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="hand-right" size={24} color={theme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Friday Prayer</Text>
          </View>

          {loadingPrayer ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading Friday Prayer...</Text>
            </View>
          ) : !fridayPrayer ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.text.tertiary} style={{ marginBottom: theme.spacing[3] }} />
              <Text style={styles.emptyTitle}>No Friday Prayer Scheduled</Text>
              <Text style={styles.emptyText}>
                Check back soon for the next prayer gathering
              </Text>
            </View>
          ) : (
          <View style={styles.prayerCard}>
            {/* Host Info */}
            <View style={styles.hostSection}>
              <Avatar
                imageUrl={fridayPrayer.hostAvatar}
                name={fridayPrayer.host}
                size="medium"
              />
              <View style={styles.hostInfo}>
                <Text style={styles.hostLabel}>Hosted by</Text>
                <Text style={styles.hostName}>{fridayPrayer.host}</Text>
              </View>
            </View>

            {/* Prayer Details */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar" size={20} color={theme.colors.primary} style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>When</Text>
                  <Text style={styles.detailValue}>{fridayPrayer.date}</Text>
                  <Text style={styles.detailSubvalue}>{fridayPrayer.time}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Ionicons name="location" size={20} color={theme.colors.primary} style={styles.detailIcon} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Where</Text>
                  <Text style={styles.detailValue}>{fridayPrayer.location}</Text>
                  <Text style={styles.detailSubvalue}>{fridayPrayer.address}</Text>
                </View>
              </View>
            </View>

            {/* Attendees Summary */}
            <View style={styles.attendeesSection}>
              <View style={styles.avatarGroup}>
                {rsvps.slice(0, 5).map((rsvp, index) => (
                  <View
                    key={rsvp.userId}
                    style={[styles.avatarWrapper, { marginLeft: index === 0 ? 0 : -10 }]}
                  >
                    <Avatar
                      imageUrl={rsvp.userAvatar}
                      name={rsvp.userName}
                      size="small"
                    />
                  </View>
                ))}
                {rsvps.length > 5 && (
                  <View style={[styles.avatarWrapper, { marginLeft: -10 }]}>
                    <View style={styles.moreAvatars}>
                      <Text style={styles.moreAvatarsText}>+{rsvps.length - 5}</Text>
                    </View>
                  </View>
                )}
              </View>
              <Text style={styles.attendeesText}>
                {totalAttendees} {totalAttendees === 1 ? 'person' : 'people'} confirmed
              </Text>
            </View>

            {/* RSVP Button */}
            {userHasRSVPd ? (
              <View style={styles.rsvpActions}>
                <View style={styles.rsvpConfirmed}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} style={{ marginRight: theme.spacing[2] }} />
                  <Text style={styles.rsvpConfirmedText}>You're confirmed!</Text>
                </View>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelRSVP}
                >
                  <Text style={styles.cancelButtonText}>Cancel RSVP</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Button
                title="RSVP for Friday Prayer"
                onPress={() => setShowRSVPModal(true)}
                variant="primary"
              />
            )}
          </View>
          )}
        </View>

        {/* Life Group Materials Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={24} color={theme.colors.primary} style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Life Group Materials</Text>
          </View>

          <Text style={styles.sectionDescription}>
            Your word is a lamp unto my feet
          </Text>

          {loadingMaterials ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading materials...</Text>
            </View>
          ) : lifeGroupMaterials.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="book-outline" size={48} color={theme.colors.text.tertiary} style={{ marginBottom: theme.spacing[3] }} />
              <Text style={styles.emptyTitle}>No Materials Available</Text>
              <Text style={styles.emptyText}>
                Check back soon for new study materials
              </Text>
            </View>
          ) : (
            <>
            {lifeGroupMaterials.map((material, index) => (
            <TouchableOpacity
              key={material.id}
              style={[
                styles.materialCard,
                index === 0 && styles.materialCardCurrent,
              ]}
              onPress={() => setSelectedMaterial(material)}
              activeOpacity={0.9}
            >
              {index === 0 && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>CURRENT WEEK</Text>
                </View>
              )}

              <View style={styles.materialHeader}>
                <View>
                  <Text style={styles.materialWeek}>{material.week}</Text>
                  <Text style={styles.materialDate}>{material.date}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </View>

              <Text style={styles.materialTitle}>{material.title}</Text>
              <Text style={styles.materialTopic}>{material.topic}</Text>

              <View style={styles.materialFooter}>
                <View style={styles.materialTag}>
                  <Text style={styles.materialTagText}>
                    {material.discussionQuestions.length} Questions
                  </Text>
                </View>
                <View style={styles.materialTag}>
                  <Text style={styles.materialTagText}>
                    {material.prayerPoints.length} Prayer Points
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* RSVP Modal */}
      <Modal
        visible={showRSVPModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRSVPModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setShowRSVPModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>RSVP for Friday Prayer</Text>
              <TouchableOpacity onPress={() => setShowRSVPModal(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              How many people will be attending?
            </Text>

            <TextInput
              style={styles.numberInput}
              placeholder="Number of people"
              placeholderTextColor={theme.colors.text.placeholder}
              value={numberOfPeople}
              onChangeText={setNumberOfPeople}
              keyboardType="number-pad"
              maxLength={2}
              autoFocus
            />

            <Button
              title="Confirm RSVP"
              onPress={handleRSVP}
              loading={submittingRSVP}
              disabled={submittingRSVP}
              style={styles.confirmButton}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Material Detail Modal */}
      <Modal
        visible={selectedMaterial !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedMaterial(null)}
      >
        {selectedMaterial && (
          <View style={styles.materialDetailContainer}>
            {/* Header */}
            <View style={styles.materialDetailHeader}>
              <TouchableOpacity
                onPress={() => setSelectedMaterial(null)}
                style={styles.backButton}
              >
                <Ionicons name="arrow-back" size={28} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.materialDetailTitle}>Life Group Material</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView
              style={styles.materialDetailScroll}
              contentContainerStyle={styles.materialDetailContent}
            >
              {/* Week Info */}
              <View style={styles.materialDetailBadge}>
                <Text style={styles.materialDetailBadgeText}>
                  {selectedMaterial.week}
                </Text>
              </View>
              <Text style={styles.materialDetailDate}>{selectedMaterial.date}</Text>
              <Text style={styles.materialDetailTitleText}>
                {selectedMaterial.title}
              </Text>
              <Text style={styles.materialDetailTopic}>{selectedMaterial.topic}</Text>

              {/* Bible Reading */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}><Ionicons name="book" size={20} color={theme.colors.primary} /> Bible Reading</Text>
                <View style={styles.detailSectionCard}>
                  <Text style={styles.detailSectionText}>
                    {selectedMaterial.bibleReading}
                  </Text>
                </View>
              </View>

              {/* Key Verse */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}><Ionicons name="star" size={20} color={theme.colors.primary} /> Key Verse</Text>
                <View style={styles.detailSectionCard}>
                  <Text style={styles.keyVerseText}>{selectedMaterial.keyVerse}</Text>
                </View>
              </View>

              {/* Discussion Questions */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}><Ionicons name="chatbubbles" size={20} color={theme.colors.primary} /> Discussion Questions</Text>
                {selectedMaterial.discussionQuestions.map((question, index) => (
                  <View key={index} style={styles.questionItem}>
                    <Text style={styles.questionNumber}>{index + 1}.</Text>
                    <Text style={styles.questionText}>{question}</Text>
                  </View>
                ))}
              </View>

              {/* Prayer Points */}
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}><Ionicons name="hand-right" size={20} color={theme.colors.primary} /> Prayer Points</Text>
                {selectedMaterial.prayerPoints.map((point, index) => (
                  <View key={index} style={styles.prayerPointItem}>
                    <Text style={styles.prayerPointBullet}>•</Text>
                    <Text style={styles.prayerPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[24],
  },
  section: {
    marginBottom: theme.spacing[10],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  sectionIcon: {
    marginRight: theme.spacing[2],
  },
  sectionTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  sectionDescription: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[4],
  },
  loadingCard: {
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[10],
    alignItems: 'center',
    ...theme.shadows.card,
  },
  loadingText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing[3],
  },
  emptyCard: {
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[10],
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  emptyTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  emptyText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  prayerCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[6],
    borderWidth: 1,
    borderColor: theme.colors.ui.borderLight,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[5],
    paddingBottom: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[100],
  },
  hostInfo: {
    marginLeft: theme.spacing[3],
  },
  hostLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
  },
  hostName: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  detailsSection: {
    marginBottom: theme.spacing[5],
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing[4],
  },
  detailIcon: {
    marginRight: theme.spacing[3],
    marginTop: 2,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  detailSubvalue: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  attendeesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[5],
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[100],
  },
  avatarGroup: {
    flexDirection: 'row',
    marginRight: theme.spacing[3],
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: theme.colors.background.white,
    borderRadius: theme.layout.avatar.small / 2,
  },
  moreAvatars: {
    width: theme.layout.avatar.small,
    height: theme.layout.avatar.small,
    borderRadius: theme.layout.avatar.small / 2,
    backgroundColor: theme.colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreAvatarsText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  attendeesText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
  },
  rsvpActions: {
    gap: theme.spacing[3],
  },
  rsvpConfirmed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success + '20',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
  },
  rsvpConfirmedText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.success,
  },
  cancelButton: {
    padding: theme.spacing[3],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.medium,
  },
  materialCard: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.ui.borderLight,
  },
  materialCardCurrent: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  currentBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing[3],
  },
  currentBadgeText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.background.white,
  },
  materialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[3],
  },
  materialWeek: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  materialDate: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
  },
  materialTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  materialTopic: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[3],
  },
  materialFooter: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  materialTag: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.sm,
  },
  materialTagText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius['2xl'],
    borderTopRightRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  modalTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  modalDescription: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  numberInput: {
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  confirmButton: {
    width: '100%',
  },
  materialDetailContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  materialDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
    paddingTop: theme.spacing[12],
    paddingBottom: theme.spacing[4],
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialDetailTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  materialDetailScroll: {
    flex: 1,
  },
  materialDetailContent: {
    padding: theme.spacing[6],
    paddingBottom: theme.spacing[10],
  },
  materialDetailBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing[2],
  },
  materialDetailBadgeText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.background.white,
  },
  materialDetailDate: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[3],
  },
  materialDetailTitleText: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes['3xl'],
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  materialDetailTopic: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[6],
  },
  detailSection: {
    marginBottom: theme.spacing[6],
  },
  detailSectionTitle: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
  },
  detailSectionCard: {
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    ...theme.shadows.soft,
  },
  detailSectionText: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semiBold,
    color: theme.colors.primary,
  },
  keyVerseText: {
    fontFamily: theme.typography.fonts.lora,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  questionItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[2],
    ...theme.shadows.soft,
  },
  questionNumber: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginRight: theme.spacing[3],
  },
  questionText: {
    flex: 1,
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
  prayerPointItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[2],
    ...theme.shadows.soft,
  },
  prayerPointBullet: {
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
    marginRight: theme.spacing[3],
  },
  prayerPointText: {
    flex: 1,
    fontFamily: theme.typography.fonts.satoshi,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.primary,
    lineHeight: 22,
  },
});
