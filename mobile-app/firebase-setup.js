/**
 * Firebase Database Setup Script
 * Run this script once to create collections and add sample data
 *
 * Usage: node firebase-setup.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, setDoc, doc, Timestamp } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEoLhzlGLrPdt03RrxqULJfEu6DCKW5d4",
  authDomain: "royal-signet.firebaseapp.com",
  projectId: "royal-signet",
  storageBucket: "royal-signet.firebasestorage.app",
  messagingSenderId: "656388512652",
  appId: "1:656388512652:web:76a4137b16b41f8c61d4a9",
  measurementId: "G-EC5CVF0FKB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('🔥 Firebase Database Setup Starting...\n');

async function setupDatabase() {
  try {
    // 1. Create Sermons Collection
    console.log('📖 Creating Sermons...');
    const sermons = [
      {
        title: 'Walking in Faith',
        pastor: 'Pastor John Smith',
        category: 'faith',
        date: Timestamp.fromDate(new Date('2024-01-15')),
        duration: '45:30',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://picsum.photos/400/300?random=1',
        description: 'Understanding what it means to walk by faith and not by sight. Learn how to trust God in uncertain times.',
        views: 1250,
        createdAt: Timestamp.now()
      },
      {
        title: 'Hope in Difficult Times',
        pastor: 'Pastor Sarah Johnson',
        category: 'hope',
        date: Timestamp.fromDate(new Date('2024-01-22')),
        duration: '38:15',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://picsum.photos/400/300?random=2',
        description: 'Finding hope when life gets tough. God\'s promises for those who are struggling.',
        views: 980,
        createdAt: Timestamp.now()
      },
      {
        title: 'The Power of Prayer',
        pastor: 'Elder Michael Davis',
        category: 'life',
        date: Timestamp.fromDate(new Date('2024-01-29')),
        duration: '42:00',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://picsum.photos/400/300?random=3',
        description: 'Discover the transformative power of prayer in your daily life.',
        views: 1100,
        createdAt: Timestamp.now()
      },
      {
        title: 'Understanding Grace',
        pastor: 'Pastor John Smith',
        category: 'bible',
        date: Timestamp.fromDate(new Date('2024-02-05')),
        duration: '50:20',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnailUrl: 'https://picsum.photos/400/300?random=4',
        description: 'A deep dive into God\'s amazing grace and what it means for believers.',
        views: 1450,
        createdAt: Timestamp.now()
      }
    ];

    for (const sermon of sermons) {
      await addDoc(collection(db, 'sermons'), sermon);
    }
    console.log('✅ Added', sermons.length, 'sermons\n');

    // 2. Create Events Collection
    console.log('📅 Creating Events...');
    const events = [
      {
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly worship service with powerful praise, worship, and the Word of God.',
        date: Timestamp.fromDate(new Date('2024-02-18')),
        time: '10:00 AM',
        location: 'Main Sanctuary',
        address: '123 Church Street, City, State 12345',
        imageUrl: 'https://picsum.photos/800/400?random=10',
        category: 'worship',
        attendees: 250,
        capacity: 500,
        registrationRequired: false,
        createdAt: Timestamp.now()
      },
      {
        title: 'Youth Group Meeting',
        description: 'Our weekly youth gathering with games, worship, and relevant Bible teaching for teenagers.',
        date: Timestamp.fromDate(new Date('2024-02-16')),
        time: '6:00 PM',
        location: 'Youth Hall',
        address: '123 Church Street, City, State 12345',
        imageUrl: 'https://picsum.photos/800/400?random=11',
        category: 'youth',
        attendees: 45,
        capacity: 80,
        registrationRequired: true,
        createdAt: Timestamp.now()
      },
      {
        title: 'Community Outreach Day',
        description: 'Join us as we serve our local community with food, clothing, and the love of Christ.',
        date: Timestamp.fromDate(new Date('2024-02-24')),
        time: '9:00 AM',
        location: 'Community Center',
        address: '456 Community Ave, City, State 12345',
        imageUrl: 'https://picsum.photos/800/400?random=12',
        category: 'outreach',
        attendees: 75,
        capacity: 150,
        registrationRequired: true,
        createdAt: Timestamp.now()
      },
      {
        title: 'Bible Study: Book of Romans',
        description: 'Deep dive into Paul\'s letter to the Romans. All are welcome!',
        date: Timestamp.fromDate(new Date('2024-02-21')),
        time: '7:00 PM',
        location: 'Fellowship Hall',
        address: '123 Church Street, City, State 12345',
        imageUrl: 'https://picsum.photos/800/400?random=13',
        category: 'study',
        attendees: 30,
        capacity: 60,
        registrationRequired: false,
        createdAt: Timestamp.now()
      }
    ];

    for (const event of events) {
      await addDoc(collection(db, 'events'), event);
    }
    console.log('✅ Added', events.length, 'events\n');

    // 3. Create Prayer Requests Collection
    console.log('🙏 Creating Prayer Requests...');
    const prayers = [
      {
        userId: 'sample-user-1',
        userName: 'Sarah Johnson',
        userAvatar: 'https://i.pravatar.cc/150?img=1',
        request: 'Please pray for my mother who is recovering from surgery. We trust in God\'s healing power.',
        prayerCount: 23,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)), // 2 hours ago
        isAnonymous: false,
        status: 'active'
      },
      {
        userId: 'sample-user-2',
        userName: 'Michael Chen',
        userAvatar: 'https://i.pravatar.cc/150?img=2',
        request: 'Seeking guidance for a major career decision. Praying for wisdom and clarity.',
        prayerCount: 18,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 60 * 1000)), // 5 hours ago
        isAnonymous: false,
        status: 'active'
      },
      {
        userId: 'sample-user-3',
        userName: 'Emily Rodriguez',
        userAvatar: 'https://i.pravatar.cc/150?img=3',
        request: 'Please pray for unity and restoration in my family. We need God\'s grace and love.',
        prayerCount: 45,
        createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // 1 day ago
        isAnonymous: false,
        status: 'active'
      }
    ];

    for (const prayer of prayers) {
      await addDoc(collection(db, 'prayers'), prayer);
    }
    console.log('✅ Added', prayers.length, 'prayer requests\n');

    // 4. Create Updates/News Collection
    console.log('📰 Creating Updates...');
    const updates = [
      {
        title: 'Christmas Service Schedule',
        content: 'Join us for our special Christmas services! We have multiple services planned throughout the week to celebrate the birth of our Savior. December 24th at 6PM - Christmas Eve Service. December 25th at 10AM - Christmas Morning Celebration.',
        category: 'announcement',
        author: 'Pastor John',
        authorAvatar: 'https://i.pravatar.cc/150?img=10',
        imageUrl: 'https://picsum.photos/800/400?random=20',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 60 * 60 * 1000)),
        published: true
      },
      {
        title: 'Youth Group Mission Trip',
        content: 'Our youth group is preparing for an amazing mission trip this summer! We will be serving communities in need and sharing God\'s love. Registration is now open for students grades 6-12.',
        category: 'event',
        author: 'Sarah Miller',
        authorAvatar: 'https://i.pravatar.cc/150?img=11',
        imageUrl: 'https://picsum.photos/800/400?random=21',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        published: true
      },
      {
        title: 'New Bible Study Starting',
        content: 'Starting next Wednesday, we are launching a new Bible study on the Book of Romans. All are welcome to join us as we dive deep into Paul\'s letter and discover the power of the Gospel.',
        category: 'news',
        author: 'Elder Mike',
        authorAvatar: 'https://i.pravatar.cc/150?img=12',
        createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        published: true
      }
    ];

    for (const update of updates) {
      await addDoc(collection(db, 'updates'), update);
    }
    console.log('✅ Added', updates.length, 'updates\n');

    // 5. Create App Settings Collection
    console.log('⚙️  Creating App Settings...');
    await setDoc(doc(db, 'settings', 'app'), {
      dailyVerse: {
        text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
        reference: 'John 3:16',
        updatedAt: Timestamp.now()
      },
      announcement: {
        title: 'Welcome to Royal Signet!',
        message: 'Join us every Sunday at 10 AM for worship service',
        isActive: true,
        backgroundColor: '#8B0101'
      },
      contact: {
        phone: '+1 (555) 123-4567',
        email: 'info@royalsignet.church',
        address: '123 Church Street, City, State 12345'
      },
      socialMedia: {
        facebook: 'https://facebook.com/royalsignet',
        instagram: 'https://instagram.com/royalsignet',
        twitter: 'https://twitter.com/royalsignet',
        youtube: 'https://youtube.com/royalsignet'
      }
    });
    console.log('✅ App settings configured\n');

    console.log('🎉 Database setup complete!\n');
    console.log('📊 Summary:');
    console.log('   - Sermons:', sermons.length);
    console.log('   - Events:', events.length);
    console.log('   - Prayer Requests:', prayers.length);
    console.log('   - Updates:', updates.length);
    console.log('   - App Settings: Configured');
    console.log('\n✨ Your Royal Signet app is ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
