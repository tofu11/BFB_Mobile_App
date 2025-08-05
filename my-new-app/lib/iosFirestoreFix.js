import { Platform } from 'react-native';

const FIREBASE_PROJECT_ID = "one-world-chair";
const FIREBASE_API_KEY = "AIzaSyBTHKe9GCiHS6kZKNsNF4N_oMNHD34v4CQ";
const FIRESTORE_REST_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export class IOSFirestoreService {
  static async addDocument(collectionName, data) {
    if (Platform.OS === 'ios') {
      return await this.addDocumentREST(collectionName, data);
    } else {
      // Use regular Firestore SDK for web
      const { collection, addDoc } = await import('firebase/firestore');
      const { db } = await import('./firebase');
      return await addDoc(collection(db, collectionName), data);
    }
  }

  static async addDocumentREST(collectionName, data) {
    console.log('iOS: Using Firestore REST API');
    
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`iOS: Firestore attempt ${attempt}/${maxRetries}`);

        // Convert data to Firestore REST format
        const firestoreData = this.convertToFirestoreFormat(data);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${FIRESTORE_REST_URL}/${collectionName}?key=${FIREBASE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            fields: firestoreData
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Firestore REST API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('iOS: Firestore REST API success');
        
        return {
          id: result.name.split('/').pop(),
          ...data
        };

      } catch (error) {
        lastError = error;
        console.log(`iOS: Firestore attempt ${attempt} failed:`, error.message);

        const isNetworkError = error.name === 'AbortError' ||
                              error.message.includes('Network request failed') ||
                              error.message.includes('fetch');

        if (isNetworkError && attempt < maxRetries) {
          const delay = attempt * 2000;
          console.log(`iOS: Retrying Firestore in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        break;
      }
    }

    console.error('iOS: All Firestore attempts failed:', lastError.message);
    throw lastError;
  }

  static convertToFirestoreFormat(data) {
    const converted = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        converted[key] = { nullValue: null };
      } else if (typeof value === 'string') {
        converted[key] = { stringValue: value };
      } else if (typeof value === 'number') {
        converted[key] = { doubleValue: value };
      } else if (typeof value === 'boolean') {
        converted[key] = { booleanValue: value };
      } else if (value instanceof Date) {
        converted[key] = { timestampValue: value.toISOString() };
      } else {
        // For other types, convert to string
        converted[key] = { stringValue: String(value) };
      }
    }
    
    return converted;
  }
}