import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { StatusBarComponent } from '@/components/StatusBarComponent';
import { Header } from '@/components/Header';
import { ScreenTitle } from '@/components/ScreenTitle';
import { MenuIcon } from '@/components/MenuIcon';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  priority: 'high' | 'medium' | 'low';
}

export default function NewsScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock news data - replace with actual API call
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'New Volunteer Program Launch',
      content: 'We are excited to announce the launch of our new community outreach volunteer program. Join us in making a difference in our local community.',
      date: '2024-01-15',
      author: 'Admin Team',
      priority: 'high'
    },
    {
      id: '2',
      title: 'Holiday Schedule Update',
      content: 'Please note our updated holiday schedule for the upcoming season. All programs will be adjusted accordingly.',
      date: '2024-01-10',
      author: 'Operations',
      priority: 'medium'
    },
    {
      id: '3',
      title: 'App Update Available',
      content: 'A new version of the app is now available with improved features and bug fixes. Please update to the latest version.',
      date: '2024-01-08',
      author: 'Tech Team',
      priority: 'low'
    }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    // Replace with actual API call
    setNews(mockNews);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FF8C00';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderNewsItem = (item: NewsItem) => (
    <View key={item.id} style={styles.newsItem}>
      <View style={styles.newsHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.newsTitle}>{item.title}</Text>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
            <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.newsDate}>{formatDate(item.date)}</Text>
          <Text style={styles.newsAuthor}>By {item.author}</Text>
        </View>
      </View>
      <Text style={styles.newsContent}>{item.content}</Text>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerBackground} />
      <ThemedView style={styles.whiteBackground} />
      <StatusBarComponent />
      <Header title="News" />
      <ScreenTitle title="News & Updates" />
      <MenuIcon />
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ThemedView style={styles.content}>
          {news.length > 0 ? (
            news.map(renderNewsItem)
          ) : (
            <View style={styles.emptyState}>
              <IconSymbol name="newspaper" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No news updates available</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 103,
    backgroundColor: '#88C8E4',
  },
  whiteBackground: {
    position: 'absolute',
    top: 103,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  newsItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsHeader: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsDate: {
    fontSize: 14,
    color: '#666',
  },
  newsAuthor: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  newsContent: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});




