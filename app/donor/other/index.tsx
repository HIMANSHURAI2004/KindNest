import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  StatusBar,
  Platform,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  ArrowLeft, 
  Minus, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Navigation,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'react-native-feather';
import { useRouter } from 'expo-router';
import { collection, addDoc } from "firebase/firestore";
import { database } from "../../../config/FirebaseConfig";

// Theme colors
const THEME = {
  primary: '#1f6969',
  primaryLight: '#2a8a8a',
  primaryDark: '#184f4f',
  secondary: '#f8b400',
  accent: '#ff6b6b',
  background: '#f7f9fc',
  card: '#ffffff',
  text: '#333333',
  textLight: '#ffffff',
  textMuted: '#7c8a97',
};

// Donation categories and items
const donationCategories = [
  {
    id: 'books',
    name: 'Books & Stationery',
    icon: "https://cdn-icons-png.flaticon.com/128/207/207114.png",
    items: [
      { id: 'textbooks', name: 'School textbooks', unit: 'book' },
      { id: 'notebooks', name: 'Notebooks & Diaries', unit: 'piece' },
      { id: 'pens', name: 'Pens, Pencils, Erasers', unit: 'set' },
      { id: 'art', name: 'Art Supplies', unit: 'set' },
    ]
  },
  {
    id: 'toys',
    name: 'Toys & Games',
    icon: "https://cdn-icons-png.flaticon.com/128/3082/3082060.png",
    items: [
      { id: 'stuffed', name: 'Stuffed animals', unit: 'piece' },
      { id: 'boardgames', name: 'Board games', unit: 'piece' },
      { id: 'edutoys', name: 'Educational toys', unit: 'piece' },
      { id: 'puzzles', name: 'Puzzles', unit: 'piece' },
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics & Gadgets',
    icon: "https://cdn-icons-png.flaticon.com/128/2278/2278984.png",
    items: [
      { id: 'phones', name: 'Mobile phones', unit: 'piece' },
      { id: 'laptops', name: 'Laptops/Tablets', unit: 'piece' },
    ]
  },
  {
    id: 'household',
    name: 'Household Items',
    icon: "https://cdn-icons-png.flaticon.com/128/5508/5508967.png",
    items: [
      { id: 'utensils', name: 'Utensils & Cookware', unit: 'set' },
      { id: 'bedsheets', name: 'Bedsheets & Blankets', unit: 'piece' },
      { id: 'towels', name: 'Towels', unit: 'piece' },
      { id: 'curtains', name: 'Curtains', unit: 'pair' },
    ]
  },
  {
    id: 'hygiene',
    name: 'Hygiene & Personal Care',
    icon: "https://cdn-icons-png.flaticon.com/128/11365/11365017.png",
    items: [
      { id: 'toiletries', name: 'Soap, Shampoo, Toothpaste', unit: 'pack' },
      { id: 'sanitary', name: 'Sanitary pads & Diapers', unit: 'pack' },
      { id: 'sanitizers', name: 'Hand sanitizers', unit: 'bottle' },
    ]
  },
  {
    id: 'medical',
    name: 'Medical Supplies',
    icon: "https://cdn-icons-png.flaticon.com/128/2968/2968946.png",
    items: [
      { id: 'firstaid', name: 'First aid kits', unit: 'kit' },
      { id: 'mobility', name: 'Wheelchairs, Walkers, Crutches', unit: 'piece' },
      { id: 'spectacles', name: 'Spectacles', unit: 'piece' },
      { id: 'hearingaids', name: 'Hearing aids', unit: 'piece' },
    ]
  },
];

// Time slots
const timeSlots = [
  '9:00 AM - 11:00 AM',
  '11:00 AM - 1:00 PM',
  '3:00 PM - 5:00 PM',
  '5:00 PM - 7:00 PM',
];

export default function Other() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [totalItems, setTotalItems] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  
  // Location states
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  
  // Schedule states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Helper functions for date handling
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  interface Day {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday?: boolean;
    isPast?: boolean;
    date: Date;
  }

  const isPastDay = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  interface ChangeMonthParams {
    increment: number;
  }

  const changeMonth = (increment: ChangeMonthParams['increment']): void => {
    const newDate = new Date(currentYear, currentMonth + increment, 1);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
    setCalendarDays(generateCalendarDays(newDate));
  };

  interface FormatMonthYearParams {
    month: number;
    year: number;
  }

  const formatMonthYear = (month: FormatMonthYearParams['month'], year: FormatMonthYearParams['year']): string => {
    const monthNames: string[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[month]} ${year}`;
  };

  // Generate calendar days
  interface CalendarDay {
    day: number;
    month: number;
    year: number;
    isCurrentMonth: boolean;
    isToday?: boolean;
    isPast?: boolean;
    date: Date;
  }

  const generateCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days: CalendarDay[] = [];
    
    // Add previous month days to fill the first week
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        month: month - 1,
        year,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i)
      });
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        day: i,
        month,
        year,
        isCurrentMonth: true,
        isToday: isToday(date),
        isPast: isPastDay(date),
        date
      });
    }
    
    // Add next month days to complete the last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          month: month + 1,
          year,
          isCurrentMonth: false,
          date: new Date(year, month + 1, i)
        });
      }
    }
    
    return days;
  };

  const [calendarDays, setCalendarDays] = useState(generateCalendarDays(selectedDate));
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  

  useEffect(() => {
    // Initialize selected items with 0 quantity
    const initialItems: { [key: string]: number } = {};
    donationCategories.forEach(category => {
      category.items.forEach(item => {
        initialItems[item.id] = 0;
      });
    });
    setSelectedItems(initialItems);
    
    // Initialize expanded categories
    const initialExpandedState: { [key: string]: boolean } = {};
    donationCategories.forEach(category => {
      initialExpandedState[category.id] = false;
    });
    setExpandedCategories(initialExpandedState);
  }, []);

  useEffect(() => {
    // Calculate total items whenever selected items change
    let total = 0;
    Object.keys(selectedItems).forEach(itemId => {
      total += selectedItems[itemId];
    });
    setTotalItems(total);
  }, [selectedItems]);

  interface QuantityChangeParams {
    itemId: string;
    change: number;
  }

  const handleQuantityChange = (itemId: QuantityChangeParams['itemId'], change: QuantityChangeParams['change']): void => {
    setSelectedItems((prev: { [key: string]: number }) => {
      const newQuantity: number = Math.max(0, (prev[itemId] || 0) + change);
      return {
        ...prev,
        [itemId]: newQuantity
      };
    });
  };

  interface ToggleCategoryParams {
    categoryId: string;
  }

  const toggleCategory = (categoryId: ToggleCategoryParams['categoryId']): void => {
    setExpandedCategories((prev: { [key: string]: boolean }) => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleDateSelect = (day: CalendarDay) => {
    if (day.isPast) return;
    setSelectedDate(day.date);
    setShowDatePicker(false);
  };

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const validateForm = () => {
    // Check if any items are selected
    if (totalItems === 0) {
      Alert.alert('No items selected', 'Please select at least one item to donate.');
      return false;
    }
    
    // Check if pickup address is provided
    if (!pickupAddress.trim()) {
      Alert.alert('Missing information', 'Please provide a pickup address.');
      return false;
    }
    
    // Check if time slot is selected
    if (!selectedTimeSlot) {
      Alert.alert('Missing information', 'Please select a time slot for pickup.');
      return false;
    }
    
    return true;
  };
  
  const handleScheduleDonation = async () => {
    if (!validateForm()) return
  
    Alert.alert(
      "Confirm Donation",
      `You're about to schedule a donation of ${totalItems} items for ${formatDate(selectedDate)} at ${selectedTimeSlot}. Proceed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              // Prepare donation data
              const donationData = {
                Category : "Others",
                selectedItems,
                totalItems,
                pickupAddress,
                dropAddress,
                selectedDate: selectedDate.toISOString(),
                selectedTimeSlot,
                timestamp: new Date().toISOString(),
              }
  
              // Store donation in Firestore
              await addDoc(collection(database, "Other donations"), donationData)
  
              Alert.alert("Thank you!", "Your donation has been scheduled successfully.")
            } catch (error) {
              console.error("Error scheduling donation:", error)
              Alert.alert("Error", "Something went wrong. Please try again.")
            }
          },
        },
      ]
    )
  }
  

  // Get count of items selected in a category
  interface CategoryItem {
    id: string;
    name: string;
    unit: string;
  }

  interface DonationCategory {
    id: string;
    name: string;
    icon: string;
    items: CategoryItem[];
  }

  const getCategoryItemCount = (categoryId: string): number => {
    const category: DonationCategory | undefined = donationCategories.find(cat => cat.id === categoryId);
    if (!category) return 0;
    
    return category.items.reduce((count: number, item: CategoryItem) => {
      return count + (selectedItems[item.id] || 0);
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={["#0B5351", "#092327"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.replace('/donor')}
        >
          <ArrowLeft width={24} height={24} color={THEME.textLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Other Donations</Text>
          <Text style={styles.headerSubtitle}>Select items and schedule pickup</Text>
        </View>
      </LinearGradient>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Donation Categories Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Donation Items</Text>
          
          <View style={styles.categoriesContainer}>
            {donationCategories.map(category => {
              const itemCount = getCategoryItemCount(category.id);
              const Icon = category.icon;
              
              return (
                <View key={category.id} style={styles.categorySection}>
                  <TouchableOpacity 
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <View style={styles.categoryHeaderLeft}>
                      <View style={styles.categoryIconContainer}>
                        <Image source={{ uri: Icon }} style={styles.othersItemImage} contentFit="contain" />
                      </View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    
                    <View style={styles.categoryHeaderRight}>
                      {itemCount > 0 && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{itemCount}</Text>
                        </View>
                      )}
                      {expandedCategories[category.id] ? (
                        <ChevronUp width={20} height={20} color={THEME.primary} />
                      ) : (
                        <ChevronDown width={20} height={20} color={THEME.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {expandedCategories[category.id] && (
                    <View style={styles.categoryItemsContainer}>
                      {category.items.map(item => (
                        <View key={item.id} style={styles.itemCard}>
                          <View style={styles.itemDetails}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemUnit}>Unit: {item.unit}</Text>
                          </View>
                          <View style={styles.quantityControl}>
                            <TouchableOpacity 
                              style={[styles.quantityButton, selectedItems[item.id] === 0 && styles.quantityButtonDisabled]}
                              onPress={() => handleQuantityChange(item.id, -1)}
                              disabled={selectedItems[item.id] === 0}
                            >
                              <Minus width={16} height={16} color={selectedItems[item.id] === 0 ? THEME.textMuted : THEME.primary} />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{selectedItems[item.id] || 0}</Text>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => handleQuantityChange(item.id, 1)}
                            >
                              <Plus width={16} height={16} color={THEME.primary} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
        
        {/* Location Section */}
        <View style={[styles.sectionContainer, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Pickup & Drop Locations</Text>
          
          <View style={styles.locationContainer}>
            {/* Pickup Address */}
            <View style={styles.locationInputContainer}>
              <View style={styles.locationIconContainer}>
                <MapPin width={20} height={20} color={THEME.primary} />
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter pickup address"
                value={pickupAddress}
                onChangeText={setPickupAddress}
                placeholderTextColor={THEME.textMuted}
              />
            </View>
            
            {/* Drop Address (Optional) */}
            <View style={styles.locationInputContainer}>
              <View style={styles.locationIconContainer}>
                <Navigation width={20} height={20} color={THEME.primary} />
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="Enter drop location (optional)"
                value={dropAddress}
                onChangeText={setDropAddress}
                placeholderTextColor={THEME.textMuted}
              />
            </View>
          </View>
        </View>
        
        {/* Schedule Section */}
        <View style={[styles.sectionContainer, { marginTop: 30 }]}>
          <Text style={styles.sectionTitle}>Schedule Pickup</Text>
          
          <View style={styles.scheduleContainer}>
            {/* Date Picker Button */}
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.datePickerIconContainer}>
                <Calendar width={20} height={20} color={THEME.primary} />
              </View>
              <Text style={styles.datePickerText}>
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>
            
            {/* Time Slots */}
            <Text style={styles.timeSlotLabel}>Select a time slot:</Text>
            <View style={styles.timeSlotsContainer}>
              {timeSlots.map(slot => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlotButton,
                    selectedTimeSlot === slot && styles.timeSlotButtonSelected
                  ]}
                  onPress={() => setSelectedTimeSlot(slot)}
                >
                  <View style={styles.timeSlotContent}>
                    <Clock width={16} height={16} color={selectedTimeSlot === slot ? THEME.textLight : THEME.primary} />
                    <Text 
                      style={[
                        styles.timeSlotText,
                        selectedTimeSlot === slot && styles.timeSlotTextSelected
                      ]}
                    >
                      {slot}
                    </Text>
                  </View>
                  {selectedTimeSlot === slot && (
                    <View style={styles.timeSlotCheckContainer}>
                      <Check width={14} height={14} color={THEME.textLight} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        {/* Summary Section */}
        <View style={[styles.summaryContainer, { marginTop: 30, marginBottom: 20 }]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Items:</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pickup Date:</Text>
            <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
          </View>
          {selectedTimeSlot && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pickup Time:</Text>
              <Text style={styles.summaryValue}>{selectedTimeSlot}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Custom Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <ChevronLeft width={24} height={24} color={THEME.primary} />
              </TouchableOpacity>
              <Text style={styles.datePickerMonthYear}>
                {formatMonthYear(currentMonth, currentYear)}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <ChevronRight width={24} height={24} color={THEME.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.weekdaysContainer}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Text key={day} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                const isSelected = 
                  selectedDate.getDate() === day.day && 
                  selectedDate.getMonth() === day.month && 
                  selectedDate.getFullYear() === day.year;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayOtherMonth,
                      day.isPast && styles.calendarDayPast,
                      isSelected && styles.calendarDaySelected,
                      day.isToday && styles.calendarDayToday
                    ]}
                    onPress={() => handleDateSelect(day)}
                    disabled={day.isPast}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                      day.isPast && styles.calendarDayTextPast,
                      isSelected && styles.calendarDayTextSelected,
                      day.isToday && styles.calendarDayTextToday
                    ]}>
                      {day.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            
            <View style={styles.datePickerActions}>
              <TouchableOpacity 
                style={styles.datePickerCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.datePickerConfirmButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Schedule Button */}
      <BlurView intensity={80} tint="light" style={styles.scheduleButtonContainer}>
        <TouchableOpacity
          style={styles.scheduleButton}
          onPress={handleScheduleDonation}
        >
          <LinearGradient
            colors={["#0B5351", "#092327"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.scheduleButtonGradient}
          >
            <Text style={styles.scheduleButtonText}>Schedule Donation</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'poppins-bold',
    color: THEME.textLight,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
    fontFamily: 'poppins',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Extra padding to account for the fixed button at bottom
  },
  sectionContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'poppins-bold',
    color: THEME.text,
    marginBottom: 16,
  },
  categoriesContainer: {
    gap: 16,
  },
  categorySection: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 105, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  othersItemImage: {
    width: 30,
    height: 30,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'poppins-bold',
    color: THEME.text,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: THEME.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
  },
  categoryBadgeText: {
    color: THEME.textLight,
    fontSize: 12,
    fontFamily: 'poppins-bold',
  },
  categoryItemsContainer: {
    padding: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    // fontWeight: '500',
    color: THEME.text,
    fontFamily: 'poppins-medium',
  },
  itemUnit: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
    fontFamily: 'poppins',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 105, 105, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 14,
    fontFamily: 'poppins-bold',
    color: THEME.text,
    width: 30,
    textAlign: 'center',
  },
  locationContainer: {
    gap: 12,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 105, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    height: 50,
    color: THEME.text,
    fontSize: 15,
    fontFamily: 'poppins',
  },
  scheduleContainer: {
    gap: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  datePickerIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 105, 105, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  datePickerText: {
    fontSize: 14,
    fontFamily: 'poppins-medium',
    color: THEME.text,
  },
  timeSlotLabel: {
    fontSize: 14,
    color: THEME.text,
    marginTop: 16,
    marginBottom: 4,
    fontFamily: 'poppins-medium',
  },
  timeSlotsContainer: {
    gap: 8,
  },
  timeSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeSlotButtonSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  timeSlotContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotText: {
    fontSize: 14,
    color: THEME.text,
    marginLeft: 8,
    fontFamily: 'poppins',
  },
  timeSlotTextSelected: {
    color: THEME.textLight,
    fontFamily: 'poppins-medium',
  },
  timeSlotCheckContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    marginHorizontal: 20,
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: THEME.textMuted,
    fontFamily: 'poppins',
    
  },
  summaryValue: {
    fontSize: 15,
    color: THEME.text,
    fontFamily: 'poppins-medium',
  },
  scheduleButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scheduleButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scheduleButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleButtonText: {
    fontSize: 16,
    color: THEME.textLight,
    fontFamily: 'poppins-medium',
  },
  
  // Custom Date Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerMonthYear: {
    fontSize: 18,
    color: THEME.text,
    fontFamily: 'poppins-medium',
  },
  weekdaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayText: {
    fontSize: 11,
    color: THEME.textMuted,
    width: 36,
    textAlign: 'center',
    fontFamily: 'poppins-medium',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    borderRadius: 18,
  },
  calendarDayOtherMonth: {
    opacity: 0.4,
  },
  calendarDayPast: {
    opacity: 0.3,
  },
  calendarDaySelected: {
    backgroundColor: THEME.primary,
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  calendarDayText: {
    fontSize: 14,
    color: THEME.text,
    fontFamily: 'poppins',
  },
  calendarDayTextOtherMonth: {
    color: THEME.textMuted,
  },
  calendarDayTextPast: {
    color: THEME.textMuted,
  },
  calendarDayTextSelected: {
    color: THEME.textLight,
    fontFamily: 'poppins-medium',
  },
  calendarDayTextToday: {
    color: THEME.primary,
    fontFamily: 'poppins-medium',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  datePickerCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  datePickerCancelText: {
    color: THEME.textMuted,
    fontFamily: 'poppins-medium',
  },
  datePickerConfirmButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: THEME.primary,
  },
  datePickerConfirmText: {
    color: THEME.textLight,
    fontFamily: 'poppins-medium',
  },
});
