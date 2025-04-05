"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  FlatList,
  Animated,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import {
  Clock,
  Filter,
  ChevronDown,
  ChevronRight,
  MapPin,
  Coffee,
  DollarSign,
  ShoppingCart,
  Package,
  BarChart2,
  List,
  Grid,
  X,
  ArrowLeft,
} from "react-native-feather"
import { database as db } from "@/config/FirebaseConfig"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getCountFromServer, getDocs, Timestamp, query, where } from "firebase/firestore"
import { set } from "firebase/database"
import { getLocalStorage } from "@/service/Storage"

const { width } = Dimensions.get("window")

interface DonationItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const THEME = {
  primary: "#1f6969",
  primaryLight: "#2a8a8a",
  primaryDark: "#184f4f",
  secondary: "#f8b400",
  accent: "#ff6b6b",
  background: "#f7f9fc",
  card: "#ffffff",
  text: "#333333",
  textLight: "#ffffff",
  textMuted: "#7c8a97",
  food: "#FF9800",
  clothes: "#2196F3",
  money: "#4CAF50",
  other: "#9C27B0",
}

// Dummy data for donation history
const dummyDonations = [
  {
    id: "1",
    type: "Food",
    items: ["Rice (5kg)", "Pasta (2 packs)", "Canned Beans (4)"],
    date: "2023-04-15",
    time: "10:30 AM",
    location: "Old Age Home, Green Street",
    status: "Completed",
    amount: 35.75,
  },
  {
    id: "2",
    type: "Clothes",
    items: ["Shirts (3)", "Pants (2)", "Jackets (1)"],
    date: "2023-04-02",
    time: "2:15 PM",
    location: "Orphanage, Sunshine Road",
    status: "Completed",
    amount: 0,
  },
  {
    id: "3",
    type: "Money",
    items: ["Direct Donation"],
    date: "2023-03-28",
    time: "11:45 AM",
    location: "NGO Foundation",
    status: "Completed",
    amount: 100.0,
  },
  {
    id: "4",
    type: "Other",
    items: ["Books (10)", "Toys (5)", "Stationery Set (2)"],
    date: "2023-03-15",
    time: "4:30 PM",
    location: "Community Center",
    status: "Completed",
    amount: 45.5,
  },
  // {
  //   id: "5",
  //   type: "Food",
  //   items: ["Vegetables (2kg)", "Fruits (3kg)", "Bread (2 loaves)"],
  //   date: "2023-03-10",
  //   time: "9:00 AM",
  //   location: "Shelter Home",
  //   status: "Completed",
  //   amount: 28.9,
  // },
  {
    id: "6",
    type: "Clothes",
    items: ["Winter Coats (2)", "Sweaters (3)", "Gloves (5 pairs)"],
    date: "2023-02-25",
    time: "1:00 PM",
    location: "Homeless Shelter",
    status: "Completed",
    amount: 0,
  },
  {
    id: "7",
    type: "Money",
    items: ["Monthly Contribution"],
    date: "2023-02-15",
    time: "10:00 AM",
    location: "Children's Foundation",
    status: "Completed",
    amount: 50.0,
  },
  {
    id: "8",
    type: "Other",
    items: ["Medical Supplies", "First Aid Kits (2)"],
    date: "2023-02-05",
    time: "3:30 PM",
    location: "Rural Health Center",
    status: "Completed",
    amount: 75.25,
  },
  {
    id: "9",
    type: "Food",
    items: ["Milk Packets (10)", "Cereal Boxes (5)"],
    date: "2023-01-28",
    time: "8:45 AM",
    location: "Children's Home",
    status: "Completed",
    amount: 42.3,
  },
]

// Get icon for donation type
const getDonationIcon = (type: string) => {
  switch (type) {
    case "Food":
      return Coffee
    case "Clothes":
      return ShoppingCart
    case "Money":
      return DollarSign
    case "Others":
      return Package
    default:
      return Package
  }
}

// Get color for donation type
const getDonationColor = (type: string) => {
  switch (type) {
    case "Food":
      return THEME.food
    case "Clothes":
      return THEME.clothes
    case "Money":
      return THEME.money
    case "Others":
      return THEME.other
    default:
      return THEME.primary
  }
}

const fetchDonationCount = async (collectionName: string, donorId: string): Promise<number> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, where("donorId", "==", donorId)); // Filter by donorId
    const snapshot = await getCountFromServer(q); // Get filtered count
    console.log("Filtered Donation Count:", snapshot.data());
    return snapshot.data().count;
  } catch (error) {
    console.error("Error getting filtered donation count:", error);
    return 0;
  }
};

const fetchTotalMonetaryDonations = async (donorId : string): Promise<number> => {
  try {
    const monetaryCollection = collection(db, "Monetary Donations");
    const q = query(monetaryCollection, where("donorId", "==", donorId)); // Filter by donorId
    const snapshot = await getDocs(q);
    
    let totalAmount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Only add successful payments
      // if (data.status === "Success" && typeof data.amount === "number") { // for later when payment is working
      if (typeof data.amount === "number") {
        totalAmount += data.amount;
      }
    });

    return totalAmount;
  } catch (error) {
    console.error("Error fetching monetary donations:", error);
    return 0;
  }
};

const fetchDonationHistory = async (collectionName: string) => {
  try {
    const collectionRef = collection(db, collectionName)
    const snapshot = await getDocs(collectionRef)
    const donations = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    return donations
  } catch (error) {
    console.error("Error fetching donation history:", error)
    return []
  }
}


const fetchAllDonations = async (donorId : string) => {
  try {
    const collections = ["Food Donations", "Clothing Donations", "Monetary Donations", "Other donations"];
    
    let allDonations: any[] = [];

    // Fetch all donations from each collection
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, where("donorId", "==", donorId));
      const snapshot = await getDocs(q);
      
      const donations = snapshot.docs.map(doc => ({
        id: doc.id,
        type: collectionName, // Store collection name for reference
        ...doc.data(),
      }));

      allDonations = [...allDonations, ...donations];
    }

     // Sort by timestamp (descending)
     allDonations.sort((a, b) => {
      const timeA = a.timestamp?.toMillis?.() || 0;
      const timeB = b.timestamp?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return allDonations;
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
};

// Format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
  return new Date(dateString).toLocaleDateString("en-US", options)
}

// Calculate statistics
// const calculateStatistics = (donations: any[]) => {
//   const totalDonations = donations.length
//   const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0)

//   const categoryCounts = donations.reduce((acc: any, donation) => {
//     acc[donation.type] = (acc[donation.type] || 0) + 1
//     return acc
//   }, {})

//   const categoryAmounts = donations.reduce((acc: any, donation) => {
//     acc[donation.type] = (acc[donation.type] || 0) + donation.amount
//     return acc
//   }, {})

//   return {
//     totalDonations,
//     totalAmount,
//     categoryCounts,
//     categoryAmounts,
//   }
// }

const extractTime = (timestamp: Timestamp | string) => {
  let date;

  // If it's a Firestore Timestamp object, convert to Date
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  }
  // If it's a string, convert it directly
  else if (typeof timestamp === "string") {
    date = new Date(timestamp);
  } else {
    return "Invalid Timestamp";
  }

  // Format the time (HH:MM:SS AM/PM)
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit", 
    // second: "2-digit", 
    hour12: true 
  });
};

const DonationHistory = () => {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedDonation, setSelectedDonation] = useState<string | null>(null)
  const [donationCounts, setDonationCounts] = useState({
    Food: 0,
    Clothes: 0,
    Money: 0,
    Other: 0,
  });
  const [totalDonations, setTotalDonations] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [donationHistory, setDonationHistory] = useState<any[]>([])
  const [filteredDonations, setFilteredDonations] = useState(donationHistory)

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const userInfo = await getLocalStorage("userDetail");
      setUserId(userInfo?.uid || userInfo?.id || null);

      const allDonations = await fetchAllDonations(userInfo?.uid || userInfo?.id || null);
      setDonationHistory(allDonations);
    };

    fetchData();
  }, [userId, selectedCategory, viewMode, selectedDonation, donationCounts, totalDonations, totalAmount]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const userInfo = await getLocalStorage("userDetail");
      const uid = userInfo?.uid || userInfo?.id || null;
      setUserId(uid);
  
      const allDonations = await fetchAllDonations(userInfo?.uid || userInfo?.id || null);
      setDonationHistory(allDonations);
  
      // Initial filter
      if (selectedCategory) {
        setFilteredDonations(allDonations.filter((donation) => (donation.category || donation.Category) === selectedCategory));
      } else {
        setFilteredDonations(allDonations);
      }
  
      if (uid) {
        const foodCount = await fetchDonationCount("Food Donations", uid);
        const clothesCount = await fetchDonationCount("Clothing Donations", uid);
        const moneyCount = await fetchDonationCount("Monetary Donations", uid);
        const otherCount = await fetchDonationCount("Other donations", uid);
        const total = await fetchTotalMonetaryDonations(uid);
        setTotalAmount(total);
        setDonationCounts({
          Food: foodCount,
          Clothes: clothesCount,
          Money: moneyCount,
          Other: otherCount,
        });
        setTotalDonations(foodCount + clothesCount + moneyCount + otherCount);
      }
    };
  
    fetchInitialData();
  }, [userId, selectedCategory, selectedDonation,totalDonations]);
  

  const filterAnimation = new Animated.Value(0)

  // Statistics
  // const stats = calculateStatistics(dummyDonations)

  useEffect(() => {
      const fetchAndFilterDonations = async () => {
        const allDonations = await fetchAllDonations(userId || "");
        setDonationHistory(allDonations);
        
        if (selectedCategory) {
          setFilteredDonations(allDonations.filter((donation) => (donation.category || donation.Category) === selectedCategory));
        } else {
          setFilteredDonations(allDonations);
        }
      };
  
      fetchAndFilterDonations();
    }, [selectedCategory, selectedDonation, totalDonations, totalAmount, userId]);

  // Fix the filter panel animation and toggle
  // Replace the toggleFilters function with this improved version:
  const toggleFilters = () => {
    const newValue = !showFilters
    setShowFilters(newValue)
    Animated.timing(filterAnimation, {
      toValue: newValue ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }

  const filterHeight = filterAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  })

  const handleGoBack = () => {
    router.replace("/(tabs)")
  }

  const renderDonationCard = ({ item }: { item: any }) => {
    const isExpanded = selectedDonation === item.id
    const DonationIcon = getDonationIcon(item.category || item.Category)
    const donationColor = getDonationColor(item.category || item.Category)

    return (
      <TouchableOpacity
        style={[styles.donationCard, isExpanded && styles.donationCardExpanded]}
        activeOpacity={0.9}
        onPress={() => setSelectedDonation(isExpanded ? null : item.id)}
      >
        <View style={styles.donationCardHeader}>
          <View style={styles.donationTypeContainer}>
            <View style={[styles.donationIconContainer, { backgroundColor: `${donationColor}20` }]}>
              <DonationIcon width={20} height={20} color={donationColor} />
            </View>
            <View>
              <Text style={styles.donationType}>{item.category || item.Category} Donation</Text>
              <Text style={styles.donationDate}>{formatDate(item.timestamp)}</Text>
            </View>
          </View>

          {(item.amount || item.totalAmount || item.totalItems) && <View style={styles.donationStatusContainer}>
            {(item.amount > 0 || item.totalAmount > 0 ) && <Text style={styles.donationAmount}>₹{item.amount?.toFixed(2)  || item.totalAmount?.toFixed(2)}</Text>}
            {item.totalItems > 0 && <Text style={styles.donationAmount}>{item.totalItems}</Text>}
              {item.status && <View style={[styles.statusBadge, { backgroundColor: `${THEME.primary}20` }]}>
                <Text style={[styles.statusText, { color: THEME.primary }]}>{item.status}</Text>
              </View>}
          </View>}
        </View>

        <View style={styles.donationCardBody}>
          <View style={styles.donationDetail}>
            <Clock width={16} height={16} color={THEME.textMuted} />
            <Text style={styles.donationDetailText}>{item.selectedTimeSlot || extractTime(item.timestamp)}</Text>
          </View>

          {item.pickupAddress && <View style={styles.donationDetail}>
            <MapPin width={16} height={16} color={THEME.textMuted} />
            <Text style={styles.donationDetailText}>{item.pickupAddress}</Text>
          </View>}

          {item.items && isExpanded && (
            <View style={styles.expandedContent}>
              <Text style={styles.expandedTitle}>Donated Items:</Text>
              {item.items.map((itemName : DonationItem , index: number) => (
                <View key={index} style={styles.donatedItem}>
                  <View style={styles.donatedItemBullet} />
                  <Text style={styles.donatedItemText}>{itemName.name} ({itemName.quantity})</Text>
                </View>
              ))} 

              <TouchableOpacity style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Full Details</Text>
                <ChevronRight width={16} height={16} color={THEME.primary} />
              </TouchableOpacity>
            </View>
          ) }
          {
            item.selectedItems && isExpanded && (
              <View style={styles.expandedContent}>
                <Text style={styles.expandedTitle}>Donated Items:</Text>
                {Object.entries(item.selectedItems)
                  .filter(([key, value]) => value > 0) // Only include items with value > 0
                  .map(([itemName, _], index) => (
                    <View key={index} style={styles.donatedItem}>
                      <View style={styles.donatedItemBullet} />
                      <Text style={styles.donatedItemText}>{itemName}</Text>
                    </View>
                  ))}
  
                <TouchableOpacity style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Full Details</Text>
                  <ChevronRight width={16} height={16} color={THEME.primary} />
                </TouchableOpacity>
              </View>
            )
          }
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setSelectedDonation(isExpanded ? null : item.id)}
          >
            <Text style={styles.expandButtonText}>{isExpanded ? "Show Less" : "Show More"}</Text>
            {isExpanded ? (
              <ChevronDown width={16} height={16} color={THEME.textMuted} />
            ) : (
              <ChevronRight width={16} height={16} color={THEME.textMuted} />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  const renderGridItem = ({ item }: { item: any }) => {
    const DonationIcon = getDonationIcon(item.category || item.Category)
    const donationColor = getDonationColor(item.category || item.Category)

    return (
      <TouchableOpacity
        style={styles.gridCard}
        activeOpacity={0.8}
        onPress={() => setSelectedDonation(selectedDonation === item.id ? null : item.id)}
      >
        <View style={[styles.gridIconContainer, { backgroundColor: `${donationColor}20` }]}>
          <DonationIcon width={24} height={24} color={donationColor} />
        </View>

        <Text style={styles.gridCardType}>{item.category || item.Category}</Text>
        <Text style={styles.gridCardDate}>{formatDate(item.timestamp)}</Text>

        {item.amount > 0 && <Text style={styles.gridCardAmount}>₹{item.amount.toFixed(2)}</Text>}
        {item.totalAmount > 0 && <Text style={styles.gridCardAmount}>₹{item.totalAmount.toFixed(2)}</Text>}
        {item.totalItems > 0 && <Text style={styles.gridCardAmount}>{item.totalItems} Items</Text>}

        {item.status && <View style={[styles.gridStatusBadge, { backgroundColor: `${THEME.primary}20` }]}>
          <Text style={[styles.gridStatusText, { color: THEME.primary }]}>{item.status}</Text>
        </View>}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0B5351", "#092327"]} style={styles.headerGradient}>
        <View style={styles.header}>
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack} activeOpacity={0.7}>
            <ArrowLeft width={20} height={20} color={THEME.textLight} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <BarChart2 width={28} height={28} color={THEME.textLight} />
            <Text style={styles.headerTitle}>Donation History</Text>
          </View>
          <Text style={styles.headerSubtitle}>Track your contributions and impact</Text>
        </View>

        {/* Statistics Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalDonations}</Text>
            <Text style={styles.statLabel}>Total Donations</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalAmount.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total Amount</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationCounts.Food || 0}</Text>
            <Text style={styles.statLabel}>Food Donations</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationCounts.Clothes || 0}</Text>
            <Text style={styles.statLabel}>Clothes Donations</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donationCounts.Other || 0}</Text>
            <Text style={styles.statLabel}>Other Donations</Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <View style={styles.contentContainer}>
        {/* Filter and View Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
            <Filter width={18} height={18} color={THEME.primary} />
            <Text style={styles.filterButtonText}>{selectedCategory ? selectedCategory : "All Categories"}</Text>
            <ChevronDown width={16} height={16} color={THEME.primary} />
          </TouchableOpacity>

          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === "list" && styles.viewToggleButtonActive]}
              onPress={() => setViewMode("list")}
            >
              <List width={18} height={18} color={viewMode === "list" ? THEME.textLight : THEME.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.viewToggleButton, viewMode === "grid" && styles.viewToggleButtonActive]}
              onPress={() => setViewMode("grid")}
            >
              <Grid width={18} height={18} color={viewMode === "grid" ? THEME.textLight : THEME.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Panel */}
        <Animated.View
          style={[
            styles.filterPanel,
            {
              height: filterHeight,
              overflow: showFilters ? "visible" : "hidden",
              zIndex: showFilters ? 10 : 0,
            },
          ]}
        >
          <View style={styles.filterContent}>
            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === null && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.categoryFilterText, selectedCategory === null && styles.categoryFilterTextActive]}>
                All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Food" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Food")}
            >
              <Coffee width={16} height={16} color={selectedCategory === "Food" ? THEME.textLight : THEME.food} />
              <Text style={[styles.categoryFilterText, selectedCategory === "Food" && styles.categoryFilterTextActive]}>
                Food
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Clothes" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Clothes")}
            >
              <ShoppingCart
                width={16}
                height={16}
                color={selectedCategory === "Clothes" ? THEME.textLight : THEME.clothes}
              />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Clothes" && styles.categoryFilterTextActive]}
              >
                Clothes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Money" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Money")}
            >
              <DollarSign width={16} height={16} color={selectedCategory === "Money" ? THEME.textLight : THEME.money} />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Money" && styles.categoryFilterTextActive]}
              >
                Money
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.categoryFilter, selectedCategory === "Others" && styles.categoryFilterActive]}
              onPress={() => setSelectedCategory("Others")}
            >
              <Package width={16} height={16} color={selectedCategory === "Others" ? THEME.textLight : THEME.other} />
              <Text
                style={[styles.categoryFilterText, selectedCategory === "Others" && styles.categoryFilterTextActive]}
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeFiltersButton} onPress={toggleFilters}>
            <X width={20} height={20} color={THEME.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        {/* Donations List/Grid */}
        {viewMode === "list" ? (
          <FlatList
            key="list"
            data={filteredDonations}
            renderItem={renderDonationCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.donationsList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Package width={50} height={50} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>No donations found</Text>
                <Text style={styles.emptyStateSubtext}>You haven't made any donations in this category yet</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key="grid"
            data={filteredDonations}
            renderItem={renderGridItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridColumnWrapper}
            contentContainerStyle={styles.donationsGrid}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Package width={50} height={50} color={THEME.textMuted} />
                <Text style={styles.emptyStateText}>No donations found</Text>
                <Text style={styles.emptyStateSubtext}>You haven't made any donations in this category yet</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 0,
    zIndex: 10,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingLeft: 40, // Make space for the back button
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.textLight,
    marginLeft: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 2,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 120,
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 16,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
    marginHorizontal: 8,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: THEME.card,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  viewToggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  viewToggleButtonActive: {
    backgroundColor: THEME.primary,
  },
  filterPanel: {
    backgroundColor: THEME.card,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "absolute", // Make it absolute positioned
    top: 63, // Position it below the controls
    left: 0,
    right: 0,
    zIndex: 10, // Ensure it's above other content
  },
  filterContent: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 10,
    height: 110,
    borderRadius: 16,
    backgroundColor: "#092327", // Ensure background is solid
  },
  categoryFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryFilterActive: {
    backgroundColor: THEME.primary,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
    marginLeft: 6,
  },
  categoryFilterTextActive: {
    color: THEME.textLight,
  },
  closeFiltersButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 8,
  },
  donationsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  donationsGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  gridColumnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  donationCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  donationCardExpanded: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  donationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  donationTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  donationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  donationType: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
  },
  donationDate: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  donationStatusContainer: {
    alignItems: "flex-end",
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  donationCardBody: {
    padding: 16,
  },
  donationDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  donationDetailText: {
    fontSize: 14,
    color: THEME.textMuted,
    marginLeft: 8,
  },
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  expandedTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  donatedItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  donatedItemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.primary,
    marginRight: 8,
  },
  donatedItemText: {
    fontSize: 14,
    color: THEME.text,
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    borderRadius: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "500",
    color: THEME.primary,
    marginRight: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    padding: 12,
    alignItems: "center",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandButtonText: {
    fontSize: 14,
    color: THEME.textMuted,
    marginRight: 4,
  },
  gridCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: (width - 48) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  gridIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridCardType: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 4,
  },
  gridCardDate: {
    fontSize: 13,
    color: THEME.textMuted,
    marginBottom: 8,
  },
  gridCardAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 8,
  },
  gridStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gridStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: THEME.textMuted,
    textAlign: "center",
    marginTop: 8,
  },
})

export default DonationHistory

