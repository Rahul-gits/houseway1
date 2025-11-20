import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius } from '../../styles/theme';

const { width } = Dimensions.get('window');

const AdvancedSearchBar = ({
  onSearch,
  onFilterChange,
  filters = [],
  placeholder = 'Search clients, projects, timelines...',
  suggestions = [],
}) => {
  const [searchText, setSearchText] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchText.trim()) {
        onSearch(searchText, selectedFilters);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, selectedFilters, onSearch]);

  // Toggle filters panel
  const toggleFilters = () => {
    const shouldShow = !showFilters;
    setShowFilters(shouldShow);

    Animated.timing(animatedHeight, {
      toValue: shouldShow ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Handle filter selection
  const handleFilterChange = useCallback((filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === value ? null : value
    }));
    onFilterChange(selectedFilters);
  }, [onFilterChange]);

  // Clear search
  const clearSearch = () => {
    setSearchText('');
    setSelectedFilters({});
    setShowSuggestions(false);
    onSearch('', {});
  };

  // Handle suggestion selection
  const handleSuggestionPress = (suggestion) => {
    setSearchText(suggestion.text);
    setShowSuggestions(false);
    onSearch(suggestion.text, selectedFilters);
  };

  // Render filter chips
  const renderFilterChips = () => {
    return filters.map((filter) => (
      <ScrollView
        key={filter.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChipsContainer}
      >
        {filter.options.map((option) => {
          const isSelected = selectedFilters[filter.key] === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterChip,
                isSelected && styles.filterChipSelected
              ]}
              onPress={() => handleFilterChange(filter.key, option.value)}
            >
              <Text style={[
                styles.filterChipText,
                isSelected && styles.filterChipTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    ));
  };

  // Render active filters
  const renderActiveFilters = () => {
    const activeFilters = Object.entries(selectedFilters).filter(([_, value]) => value);

    if (activeFilters.length === 0) return null;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
        {activeFilters.map(([key, value]) => {
          const filter = filters.find(f => f.key === key);
          const option = filter?.options.find(o => o.value === value);

          return (
            <View key={key} style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>{option?.label}</Text>
              <TouchableOpacity
                onPress={() => handleFilterChange(key, null)}
                style={styles.activeFilterRemove}
              >
                <Ionicons name="close" size={12} color={colors.beige[100]} />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  // Render suggestions
  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null;

    return (
      <Animated.View style={[
        styles.suggestionsContainer,
        {
          height: animatedHeight.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200],
          }),
        }
      ]}>
        <LinearGradient
          colors={[colors.blue[50], colors.beige[100]]}
          style={styles.suggestionsGradient}
        >
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              <Ionicons
                name={getSuggestionIcon(suggestion.type)}
                size={16}
                color={colors.blue[500]}
                style={styles.suggestionIcon}
              />
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
                <Text style={styles.suggestionSubtext}>{suggestion.subtext}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </LinearGradient>
      </Animated.View>
    );
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'client': return 'person-outline';
      case 'project': return 'folder-outline';
      case 'timeline': return 'time-outline';
      case 'invoice': return 'document-text-outline';
      default: return 'search-outline';
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <LinearGradient
          colors={[colors.beige[100], colors.beige[200]]}
          style={styles.searchGradient}
        >
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.blue[500]} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor={colors.neutral[400]}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                setShowSuggestions(text.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchText.length > 0)}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={18} color={colors.neutral[400]} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={toggleFilters}
          >
            <Ionicons name="funnel" size={18} color={colors.blue[500]} />
            <Text style={styles.filterButtonText}>Filters</Text>
            {Object.values(selectedFilters).filter(Boolean).length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {Object.values(selectedFilters).filter(Boolean).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Active Filters */}
        {renderActiveFilters()}
      </View>

      {/* Suggestions */}
      {renderSuggestions()}

      {/* Filters Panel */}
      {showFilters && (
        <Animated.View style={[
          styles.filtersPanel,
          {
            height: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 'auto'],
            }),
          }
        ]}>
          <LinearGradient
            colors={[colors.beige[200], colors.beige[300]]}
            style={styles.filtersGradient}
          >
            <Text style={styles.filtersTitle}>Filter Results</Text>
            {renderFilterChips()}
          </LinearGradient>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    zIndex: 1000,
  },
  searchBarContainer: {
    marginBottom: spacing.sm,
  },
  searchGradient: {
    borderRadius: borderRadius.xl,
    padding: spacing.sm,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: colors.neutral[800],
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.blue[500],
    borderRadius: borderRadius.lg,
  },
  filterButtonText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.beige[100],
  },
  filterBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.danger[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: colors.beige[100],
  },
  suggestionsContainer: {
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  suggestionsGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  suggestionIcon: {
    marginRight: spacing.md,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: colors.neutral[800],
  },
  suggestionSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: colors.neutral[500],
    marginTop: 2,
  },
  activeFilters: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.blue[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  activeFilterText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.beige[100],
    marginRight: spacing.xs,
  },
  activeFilterRemove: {
    marginLeft: spacing.xs,
  },
  filtersPanel: {
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  filtersGradient: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  filtersTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  filterChipsContainer: {
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.beige[100],
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.beige[300],
  },
  filterChipSelected: {
    backgroundColor: colors.blue[500],
    borderColor: colors.blue[500],
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: colors.neutral[600],
  },
  filterChipTextSelected: {
    color: colors.beige[100],
  },
});

export default AdvancedSearchBar;