import AsyncStorage from '@react-native-async-storage/async-storage';

interface VerseResponse {
  reference: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface VerseOfTheDay {
  text: string;
  reference: string;
  translation?: string;
}

const VERSE_STORAGE_KEY = '@verse_of_the_day';
const VERSE_DATE_KEY = '@verse_date';

// Fallback verse in case API fails
const FALLBACK_VERSE: VerseOfTheDay = {
  text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.",
  reference: "Jeremiah 29:11",
  translation: "NIV",
};

/**
 * Checks if the stored verse is from today
 */
const isVerseFromToday = async (): Promise<boolean> => {
  try {
    const storedDate = await AsyncStorage.getItem(VERSE_DATE_KEY);
    if (!storedDate) return false;

    const today = new Date().toDateString();
    return storedDate === today;
  } catch (error) {
    console.error('Error checking verse date:', error);
    return false;
  }
};

/**
 * Gets a cached verse from storage
 */
const getCachedVerse = async (): Promise<VerseOfTheDay | null> => {
  try {
    const cachedVerse = await AsyncStorage.getItem(VERSE_STORAGE_KEY);
    if (!cachedVerse) return null;

    return JSON.parse(cachedVerse);
  } catch (error) {
    console.error('Error getting cached verse:', error);
    return null;
  }
};

/**
 * Saves verse to cache with today's date
 */
const cacheVerse = async (verse: VerseOfTheDay): Promise<void> => {
  try {
    const today = new Date().toDateString();
    await AsyncStorage.setItem(VERSE_STORAGE_KEY, JSON.stringify(verse));
    await AsyncStorage.setItem(VERSE_DATE_KEY, today);
  } catch (error) {
    console.error('Error caching verse:', error);
  }
};

/**
 * Fetches a random verse from a curated list
 * Uses predefined inspirational verses to ensure reliability
 */
const fetchVerseFromAPI = async (): Promise<VerseOfTheDay> => {
  try {
    // Curated list of inspirational verses
    const inspirationalVerses = [
      'john 3:16',
      'philippians 4:13',
      'jeremiah 29:11',
      'romans 8:28',
      'proverbs 3:5-6',
      'psalm 23:1-4',
      'matthew 11:28-30',
      'isaiah 40:31',
      'joshua 1:9',
      'philippians 4:6-7',
      'romans 12:2',
      'psalm 46:1',
      'john 14:6',
      'matthew 6:33',
      '2 corinthians 5:17',
      'ephesians 2:8-9',
      'psalm 119:105',
      'proverbs 16:3',
      'isaiah 41:10',
      'romans 15:13',
    ];

    // Pick a random verse from the list
    const randomVerse = inspirationalVerses[Math.floor(Math.random() * inspirationalVerses.length)];
    const apiUrl = `https://bible-api.com/${encodeURIComponent(randomVerse)}`;

    console.log('Fetching verse:', randomVerse);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('API returned status:', response.status);
      throw new Error(`API returned status ${response.status}`);
    }

    const data: any = await response.json();
    console.log('API Response received');

    // Validate response data
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format');
    }

    // Get text from the response
    let verseText = '';
    if (data.text) {
      verseText = data.text;
    } else if (data.verses && data.verses.length > 0) {
      // Fallback: construct text from verses array
      verseText = data.verses.map((v: any) => v.text || '').filter(Boolean).join(' ');
    }

    if (!verseText) {
      console.error('No verse text in response');
      throw new Error('No verse text in API response');
    }

    // Clean up the text (remove extra whitespace and newlines)
    const cleanText = verseText
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\n/g, ' ');

    // Get reference
    const reference = data.reference || randomVerse;

    const verse: VerseOfTheDay = {
      text: cleanText,
      reference: reference,
      translation: data.translation_name || data.translation_id || 'WEB',
    };

    console.log('Successfully fetched verse:', reference);
    return verse;
  } catch (error: any) {
    console.error('Error fetching verse from API:', error?.message || error);
    throw error;
  }
};

/**
 * Gets the verse of the day
 * - Returns cached verse if it's from today
 * - Fetches new verse from API if cache is old or missing
 * - Falls back to hardcoded verse if API fails
 */
export const getVerseOfTheDay = async (): Promise<VerseOfTheDay> => {
  try {
    // Check if we have a verse from today
    const isToday = await isVerseFromToday();

    if (isToday) {
      const cachedVerse = await getCachedVerse();
      if (cachedVerse) {
        console.log('Using cached verse from today');
        return cachedVerse;
      }
    }

    // Fetch new verse from API
    console.log('Fetching new verse from API');
    const verse = await fetchVerseFromAPI();

    // Cache the new verse
    await cacheVerse(verse);

    return verse;
  } catch (error) {
    console.error('Error in getVerseOfTheDay:', error);

    // Try to return cached verse even if old
    const cachedVerse = await getCachedVerse();
    if (cachedVerse) {
      console.log('API failed, using old cached verse');
      return cachedVerse;
    }

    // Final fallback
    console.log('Using fallback verse');
    return FALLBACK_VERSE;
  }
};

/**
 * Forces a refresh of the verse (useful for testing or manual refresh)
 */
export const refreshVerseOfTheDay = async (): Promise<VerseOfTheDay> => {
  try {
    const verse = await fetchVerseFromAPI();
    await cacheVerse(verse);
    return verse;
  } catch (error) {
    console.error('Error refreshing verse:', error);
    return FALLBACK_VERSE;
  }
};
