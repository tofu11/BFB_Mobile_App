import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
  createdAt: any;
  published: boolean;
}

export const getNews = async (): Promise<NewsItem[]> => {
  try {
    const q = query(
      collection(db, 'news'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsItem));
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};