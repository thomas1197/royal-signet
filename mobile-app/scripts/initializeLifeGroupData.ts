/**
 * Script to initialize Life Group data in Firebase
 *
 * This script creates sample Friday Prayer events and Life Group materials
 * Run this once to populate the database with initial data
 *
 * Usage:
 * 1. Make sure you're authenticated as an admin
 * 2. Run: npx ts-node scripts/initializeLifeGroupData.ts
 */

import { db as firestore } from '../src/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const initializeFridayPrayer = async () => {
  console.log('Creating Friday Prayer event...');

  // Get next Friday
  const getNextFriday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // If today is Friday, get next Friday
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday;
  };

  const nextFriday = getNextFriday();
  const dateString = nextFriday.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const fridayPrayerData = {
    date: dateString,
    time: '7:00 PM - 9:00 PM',
    location: "Clement's House, Watford",
    address: 'WD25 9AP, Watford, Hertfordshire',
    host: 'Clement',
    hostAvatar: 'https://i.pravatar.cc/150?img=15',
    hostId: 'admin', // Replace with actual user ID
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(
      collection(firestore, 'fridayPrayers'),
      fridayPrayerData
    );
    console.log('✅ Friday Prayer created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating Friday Prayer:', error);
    throw error;
  }
};

const initializeLifeGroupMaterials = async () => {
  console.log('Creating Life Group materials...');

  const materials = [
    {
      week: 'Week 12',
      weekNumber: 12,
      date: '2024-12-20',
      year: 2024,
      title: 'Living in the Light',
      topic: 'Walking in Truth and Love',
      bibleReading: '1 John 1:5-10',
      keyVerse:
        'If we walk in the light, as he is in the light, we have fellowship with one another, and the blood of Jesus, his Son, purifies us from all sin.',
      keyVerseReference: '1 John 1:7',
      discussionQuestions: [
        'What does it mean to walk in the light?',
        'How can we have authentic fellowship with one another?',
        'What barriers prevent us from confessing our sins?',
        'How does walking in truth impact our relationships?',
      ],
      prayerPoints: [
        'For courage to live transparently',
        'For deeper fellowship in our church community',
        'For healing and restoration in broken relationships',
        'For wisdom to walk in truth daily',
      ],
      isCurrent: true,
      isPublished: true,
      author: 'Pastor John',
      authorId: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      week: 'Week 11',
      weekNumber: 11,
      date: '2024-12-13',
      year: 2024,
      title: 'The Gift of Grace',
      topic: "Understanding God's Unmerited Favor",
      bibleReading: 'Ephesians 2:1-10',
      keyVerse:
        'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.',
      keyVerseReference: 'Ephesians 2:8',
      discussionQuestions: [
        'What does grace mean to you personally?',
        "How has God's grace transformed your life?",
        'Why is it important that salvation is a gift, not earned?',
        'How can we extend grace to others?',
      ],
      prayerPoints: [
        "Thankfulness for God's grace",
        "For those struggling to accept God's love",
        'For opportunities to show grace to others',
        "For growth in understanding God's mercy",
      ],
      isCurrent: false,
      isPublished: true,
      author: 'Pastor John',
      authorId: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    {
      week: 'Week 10',
      weekNumber: 10,
      date: '2024-12-06',
      year: 2024,
      title: 'Prayer and Persistence',
      topic: 'Developing a Consistent Prayer Life',
      bibleReading: 'Luke 18:1-8',
      keyVerse:
        'Then Jesus told his disciples a parable to show them that they should always pray and not give up.',
      keyVerseReference: 'Luke 18:1',
      discussionQuestions: [
        'What obstacles do you face in maintaining a prayer life?',
        'How does persistence in prayer strengthen our faith?',
        "What does this parable teach about God's character?",
        'How can we encourage one another to pray consistently?',
      ],
      prayerPoints: [
        'For discipline in daily prayer',
        "For answered prayers we're waiting on",
        "For increased faith in God's timing",
        'For our church prayer ministry',
      ],
      isCurrent: false,
      isPublished: true,
      author: 'Pastor John',
      authorId: 'admin',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
  ];

  try {
    const promises = materials.map((material) =>
      addDoc(collection(firestore, 'lifeGroupMaterials'), material)
    );

    const results = await Promise.all(promises);
    console.log('✅ Created', results.length, 'Life Group materials');
    results.forEach((docRef, index) => {
      console.log(`   - ${materials[index].title} (ID: ${docRef.id})`);
    });
    return results.map((r) => r.id);
  } catch (error) {
    console.error('❌ Error creating Life Group materials:', error);
    throw error;
  }
};

const main = async () => {
  console.log('🚀 Starting Life Group data initialization...\n');

  try {
    // Initialize Friday Prayer
    await initializeFridayPrayer();
    console.log('');

    // Initialize Life Group Materials
    await initializeLifeGroupMaterials();
    console.log('');

    console.log('✅ All data initialized successfully!');
    console.log('\n📱 You can now use the Life Groups screen in the app');
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
