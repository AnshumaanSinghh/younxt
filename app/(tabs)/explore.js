/**
 * Explore Screen — Immersive Wisdom Feed
 * Full-screen vertical paging with parallax, double-tap like, and "Quote of the Day" spotlight
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Dimensions, ImageBackground, Animated, Share, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { motivations, CATEGORIES } from '../../src/utils/motivations';
import { toggleLike, getLikeCounts, toggleFavorite, getFavorites } from '../../src/utils/favorites';
import { Colors, Spacing, Typography, BorderRadius } from '../../src/theme';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height * 0.72;

// ──────────────────────────────────────────────
// Quote of the Day Spotlight
// ──────────────────────────────────────────────
const QuoteOfTheDay = React.memo(({ quote, onShare }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  if (!quote) return null;

  return (
    <Animated.View style={[styles.qotdContainer, { transform: [{ scale: pulseAnim }] }]}>
      <LinearGradient
        colors={['rgba(108,99,255,0.2)', 'rgba(0,217,255,0.1)', 'rgba(108,99,255,0.05)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.qotdGradient}
      >
        <View style={styles.qotdBadge}>
          <Ionicons name="sunny" size={14} color={Colors.warning} />
          <Text style={styles.qotdBadgeText}>QUOTE OF THE DAY</Text>
        </View>
        <Text style={styles.qotdText}>"{quote.text}"</Text>
        {quote.author && <Text style={styles.qotdAuthor}>— {quote.author}</Text>}
        <TouchableOpacity style={styles.qotdShareBtn} onPress={() => onShare(quote)} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={16} color={Colors.primary} />
          <Text style={styles.qotdShareText}>Share this wisdom</Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
});

// ──────────────────────────────────────────────
// Category Filter Bar
// ──────────────────────────────────────────────
const CategoryFilter = React.memo(({ selected, onSelect, counts }) => {
  return (
    <View style={styles.filterContainer}>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => {
          const isActive = selected === item.key;
          const count = counts[item.key] || 0;
          return (
            <TouchableOpacity
              onPress={() => onSelect(item.key)}
              activeOpacity={0.7}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
            >
              <Ionicons name={item.icon} size={14}
                color={isActive ? Colors.textPrimary : Colors.textMuted} />
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {item.label}
              </Text>
              {item.key !== 'all' && (
                <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                  <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
});

// ──────────────────────────────────────────────
// Quote Card (Full-Screen with Double-Tap Like)
// ──────────────────────────────────────────────
const QuoteCard = React.memo(({ item, index, isLiked, isFaved, onLike, onFav, onShare }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const heartScale = useRef(new Animated.Value(1)).current;
  const doubleTapHeart = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);

  useEffect(() => {
    const delay = Math.min(index * 80, 240);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  const getGradient = (category) => {
    const gradients = {
      'Stoic': ['rgba(15,32,39,0.92)', 'rgba(32,58,67,0.92)', 'rgba(44,83,100,0.88)'],
      'Dark Philosophy': ['rgba(0,0,0,0.92)', 'rgba(30,20,50,0.88)'],
      'Comeback': ['rgba(20,30,48,0.92)', 'rgba(36,59,85,0.88)'],
      'Struggle': ['rgba(35,37,38,0.92)', 'rgba(65,67,69,0.88)'],
      'Warrior Mindset': ['rgba(50,15,15,0.92)', 'rgba(70,30,20,0.88)'],
      'Silent Power': ['rgba(10,10,35,0.92)', 'rgba(25,20,55,0.88)'],
    };
    return gradients[category] || ['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.85)'];
  };

  const getBackgroundImage = (category) => {
    const images = {
      'Stoic': require('../../assets/images/stoic_bg.png'),
      'Dark Philosophy': require('../../assets/images/dark_philosophy_bg.png'),
      'Comeback': require('../../assets/images/comeback_bg.png'),
      'Struggle': require('../../assets/images/struggle_bg.png'),
      'Warrior Mindset': require('../../assets/images/warrior_bg.png'),
      'Silent Power': require('../../assets/images/silent_power_bg.png'),
    };
    return images[category] || images['Stoic'];
  };

  const getCategoryEmoji = (category) => {
    const emojis = { 'Stoic': '🏛️', 'Dark Philosophy': '🌑', 'Comeback': '🔥', 'Struggle': '⚡', 'Warrior Mindset': '⚔️', 'Silent Power': '🧘' };
    return emojis[category] || '💡';
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap detected — like with animation
      if (!isLiked) {
        onLike(item.id);
      }
      // Show floating heart
      doubleTapHeart.setValue(1);
      Animated.sequence([
        Animated.timing(doubleTapHeart, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(doubleTapHeart, { toValue: 0, duration: 800, delay: 400, useNativeDriver: true }),
      ]).start();
    }
    lastTap.current = now;
  };

  const animateLike = () => {
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.5, duration: 120, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
    onLike(item.id);
  };

  return (
    <Animated.View style={[styles.cardContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} style={{ flex: 1 }}>
        <ImageBackground
          source={getBackgroundImage(item.category)}
          style={styles.cardImageBg}
          imageStyle={{ borderRadius: BorderRadius.xl }}
          resizeMode="cover"
        >
          <LinearGradient colors={getGradient(item.category)} style={styles.card}>
            {/* Top Row */}
            <View style={styles.topRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
                <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
              </View>
              <View style={styles.quoteNumberBadge}>
                <Text style={styles.quoteNumber}>#{item.id}</Text>
              </View>
            </View>

            {/* Decorative Quote Icon */}
            <Ionicons name="quote" size={56} color="rgba(255,255,255,0.04)" style={styles.quoteIconBg} />

            {/* Quote Content */}
            <View style={styles.quoteBody}>
              <Text style={styles.quoteText}>"{item.text}"</Text>
              {item.author && (
                <View style={styles.authorRow}>
                  <View style={styles.authorLine} />
                  <Text style={styles.authorText}>{item.author}</Text>
                </View>
              )}
            </View>

            {/* Floating Double-Tap Heart */}
            <Animated.View style={[styles.floatingHeart, { opacity: doubleTapHeart, transform: [{ scale: doubleTapHeart.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }] }]} pointerEvents="none">
              <Ionicons name="heart" size={80} color="#FF6B6B" />
            </Animated.View>

            {/* Action Bar */}
            <View style={styles.actionBar}>
              <View style={styles.actionLeft}>
                <Text style={styles.tapHint}>Double-tap to like</Text>
              </View>
              <View style={styles.actionRight}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <TouchableOpacity style={styles.actionBtn} onPress={animateLike} activeOpacity={0.7}>
                    <Ionicons name={isLiked ? "heart" : "heart-outline"} size={26}
                      color={isLiked ? '#FF6B6B' : Colors.textPrimary} />
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity style={styles.actionBtn} onPress={() => onFav(item.id)} activeOpacity={0.7}>
                  <Ionicons name={isFaved ? "bookmark" : "bookmark-outline"} size={24}
                    color={isFaved ? Colors.accent : Colors.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionBtn} onPress={() => onShare(item)} activeOpacity={0.7}>
                  <Ionicons name="share-social-outline" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );
});

// ──────────────────────────────────────────────
// Main Screen
// ──────────────────────────────────────────────
export default function ExploreScreen() {
  const [category, setCategory] = useState('all');
  const [likes, setLikes] = useState({});
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadInteractions();
  }, []);

  const loadInteractions = async () => {
    try {
      const [likeData, favData] = await Promise.all([getLikeCounts(), getFavorites()]);
      setLikes(likeData || {});
      setFavorites(favData || []);
    } catch (e) {
      console.error('Failed to load interactions:', e);
    }
  };

  // Category counts for filter badges
  const categoryCounts = {};
  CATEGORIES.forEach(cat => {
    if (cat.key === 'all') return;
    categoryCounts[cat.key] = motivations.filter(q => q.category === cat.label).length;
  });

  const filteredQuotes = category === 'all'
    ? motivations
    : motivations.filter((q) => q.category === category);

  // Quote of the Day — deterministic selection
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const qotd = motivations[dayOfYear % motivations.length];

  const handleLike = useCallback(async (id) => {
    const newState = await toggleLike(id);
    setLikes((prev) => {
      const next = { ...prev };
      if (newState) next[id] = true;
      else delete next[id];
      return next;
    });
  }, []);

  const handleFavorite = useCallback(async (id) => {
    const newState = await toggleFavorite(id);
    setFavorites((prev) =>
      newState ? [...prev, id] : prev.filter((f) => f !== id)
    );
  }, []);

  const handleShare = useCallback(async (item) => {
    try {
      await Share.share({
        message: `"${item.text}"\n\n— ${item.author || 'Unknown'}\n\n🔮 Shared via YouNxt — Your Future Self Engine`,
      });
    } catch (e) {
      console.error('Share failed:', e);
    }
  }, []);

  const renderItem = useCallback(({ item, index }) => (
    <QuoteCard
      item={item}
      index={index}
      isLiked={!!likes[item.id]}
      isFaved={favorites.includes(item.id)}
      onLike={handleLike}
      onFav={handleFavorite}
      onShare={handleShare}
    />
  ), [likes, favorites, handleLike, handleFavorite, handleShare]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Explore Wisdom</Text>
          <Text style={styles.headerSubtitle}>{filteredQuotes.length} quotes · {Object.keys(likes).length} liked</Text>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.statBadge}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={styles.statText}>{Object.keys(likes).length}</Text>
          </View>
          <View style={styles.statBadge}>
            <Ionicons name="bookmark" size={14} color={Colors.accent} />
            <Text style={styles.statText}>{favorites.length}</Text>
          </View>
        </View>
      </View>

      {/* Category Filters */}
      <CategoryFilter selected={category} onSelect={setCategory} counts={categoryCounts} />

      {/* Quote Feed */}
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT + Spacing.lg}
        decelerationRate="fast"
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        initialNumToRender={3}
        ListHeaderComponent={
          category === 'all' ? <QuoteOfTheDay quote={qotd} onShare={handleShare} /> : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No quotes in this category</Text>
            <Text style={styles.emptySubtext}>Try selecting a different category above</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'android' ? 48 : 56,
    paddingBottom: Spacing.sm,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  headerStats: { flexDirection: 'row', gap: 8 },
  statBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.border,
  },
  statText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  // Quote of the Day
  qotdContainer: { marginHorizontal: 0, marginBottom: Spacing.lg },
  qotdGradient: { borderRadius: BorderRadius.xl, padding: Spacing.xl, borderWidth: 1, borderColor: 'rgba(108,99,255,0.2)' },
  qotdBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md },
  qotdBadgeText: { fontSize: 11, fontWeight: '800', color: Colors.warning, letterSpacing: 1.5 },
  qotdText: { fontSize: 20, fontWeight: '600', color: Colors.textPrimary, fontStyle: 'italic', lineHeight: 32 },
  qotdAuthor: { fontSize: 14, color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'right' },
  qotdShareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: Spacing.lg, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.primary },
  qotdShareText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Filters
  filterContainer: { paddingVertical: Spacing.sm },
  filterList: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  filterPillActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textMuted },
  filterTextActive: { color: Colors.textPrimary },
  filterCount: { backgroundColor: Colors.border, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, marginLeft: 2 },
  filterCountActive: { backgroundColor: Colors.primary },
  filterCountText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  filterCountTextActive: { color: '#fff' },

  // Cards
  listContent: { padding: Spacing.lg, paddingBottom: Spacing.xxxl },
  cardContainer: {
    marginBottom: Spacing.lg, height: CARD_HEIGHT,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5, shadowRadius: 24, elevation: 15,
  },
  cardImageBg: { flex: 1, borderRadius: BorderRadius.xl },
  card: {
    flex: 1, borderRadius: BorderRadius.xl, padding: Spacing.xl,
    justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: BorderRadius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  categoryEmoji: { fontSize: 14 },
  categoryBadgeText: { color: Colors.textPrimary, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  quoteNumberBadge: { backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.full },
  quoteNumber: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  quoteIconBg: { position: 'absolute', top: Spacing.xl + 50, right: Spacing.xl },
  quoteBody: { flex: 1, justifyContent: 'center', paddingVertical: Spacing.lg },
  quoteText: {
    fontSize: 22, fontWeight: '600', color: Colors.textPrimary,
    fontStyle: 'italic', lineHeight: 36,
    textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md, justifyContent: 'flex-end' },
  authorLine: { width: 24, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  authorText: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },

  // Floating heart for double-tap
  floatingHeart: { position: 'absolute', top: '40%', left: '40%', zIndex: 10 },

  // Action bar
  actionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLeft: {},
  tapHint: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' },
  actionRight: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  actionBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },

  // Empty state
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxxl },
  emptyText: { fontSize: 16, color: Colors.textMuted, marginTop: Spacing.md, fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: Colors.textMuted, marginTop: 4 },
});
