import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { StatusBarComponent } from '@/components/StatusBarComponent';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
}

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      console.log('📰 Fetching news articles...');
      const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const newsData: NewsItem[] = [];
      querySnapshot.forEach((doc) => {
        newsData.push({
          id: doc.id,
          ...doc.data()
        } as NewsItem);
      });

      console.log('✅ Fetched news articles:', newsData.length);
      setNews(newsData);
    } catch (error) {
      console.error('❌ Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity style={styles.newsItem}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      )}
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsText} numberOfLines={3}>
          {item.content}
        </Text>
        <Text style={styles.newsDate}>
          {item.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="News" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Latest News</Text>
        
        {loading ? (
          <Text style={styles.loadingText}>Loading news...</Text>
        ) : news.length === 0 ? (
          <Text style={styles.emptyText}>No news articles yet.</Text>
        ) : (
          <FlatList
            data={news}
            renderItem={renderNewsItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.newsList}
          />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: '#FFB703',
  },
  whiteBackground: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    marginTop: 120,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  newsList: {
    paddingBottom: 20,
  },
  newsItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  newsContent: {
    padding: 15,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  newsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
  },
});