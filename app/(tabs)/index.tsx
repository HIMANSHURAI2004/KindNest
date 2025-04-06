"use client"

import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Image,
  FlatList,
  Animated,
  Easing,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import {
  Heart,
  Gift,
  Package,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Home as HomeIcon,
  Smile,
  Award,
  ChevronRight,
  Bell,
  Settings,
  Coffee,
  ShoppingBag,
  Bookmark,
  MessageCircle,
  Star,
} from "react-native-feather"
import { useRouter } from "expo-router"
import { getLocalStorage } from "@/service/Storage"

const { width, height } = Dimensions.get("window")

// Theme colors
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
  gradient: {
    primary: ["#1f6969", "#2a8a8a"],
    secondary: ["#f8b400", "#f9c846"],
    accent: ["#ff6b6b", "#ff9e9e"],
    dark: ["#184f4f", "#0d2e2e"],
    light: ["#f7f9fc", "#e9eef5"],
  },
}

// Sample data for featured donation campaigns
const featuredCampaigns = [
  {
    id: "1",
    title: "Winter Clothing Drive",
    image: "https://cdn-icons-png.flaticon.com/512/2589/2589625.png",
    description: "Help provide warm clothes to those in need this winter season",
    progress: 75,
    gradient: ["#3F51B5", "#5C6BC0"],
  },
  {
    id: "2",
    title: "Food for All",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081887.png",
    description: "Support our mission to provide nutritious meals to underprivileged communities",
    progress: 60,
    gradient: ["#FF9800", "#FFB74D"],
  },
  {
    id: "3",
    title: "Education Support",
    image: "https://cdn-icons-png.flaticon.com/512/2436/2436874.png",
    description: "Donate books and stationery to help children continue their education",
    progress: 45,
    gradient: ["#4CAF50", "#81C784"],
  },
  {
    id: "4",
    title: "Medical Aid",
    image: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
    description: "Provide essential medical supplies to rural healthcare centers",
    progress: 35,
    gradient: ["#E91E63", "#F06292"],
  },
]

// Sample data for impact statistics
const impactStats = [
  {
    id: "1",
    title: "Donations",
    value: "1,234",
    icon: Gift,
    color: "#4CAF50",
    gradient: ["#4CAF50", "#81C784"],
  },
  {
    id: "2",
    title: "Lives Impacted",
    value: "5,678",
    icon: Users,
    color: "#2196F3",
    gradient: ["#2196F3", "#64B5F6"],
  },
  {
    id: "3",
    title: "Communities",
    value: "42",
    icon: HomeIcon,
    color: "#FF9800",
    gradient: ["#FF9800", "#FFB74D"],
  },
  {
    id: "4",
    title: "Donors",
    value: "789",
    icon: Heart,
    color: "#E91E63",
    gradient: ["#E91E63", "#F06292"],
  },
]

// Sample data for recent donations
const recentDonations = [
  {
    id: "1",
    type: "Food",
    items: "Rice, Dal, Oil",
    amount: "₹1,200",
    recipient: "Sunrise Old Age Home",
    date: "2 days ago",
    icon: Coffee,
    color: "#FF9800",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081887.png",
    gradient: ["#FF9800", "#FFB74D"],
  },
  {
    id: "2",
    type: "Clothes",
    items: "Shirts, Pants, Jackets",
    amount: "₹2,500",
    recipient: "Hope Orphanage",
    date: "5 days ago",
    icon: ShoppingBag,
    color: "#2196F3",
    image: "https://cdn-icons-png.flaticon.com/512/2589/2589625.png",
    gradient: ["#2196F3", "#64B5F6"],
  },
  {
    id: "3",
    type: "Books",
    items: "Textbooks, Notebooks",
    amount: "₹800",
    recipient: "Bright Future NGO",
    date: "1 week ago",
    icon: Bookmark,
    color: "#9C27B0",
    image: "https://cdn-icons-png.flaticon.com/512/2436/2436874.png",
    gradient: ["#9C27B0", "#BA68C8"],
  },
  {
    id: "4",
    type: "Medical",
    items: "First Aid Kits, Medicines",
    amount: "₹1,800",
    recipient: "Rural Health Center",
    date: "1 week ago",
    icon: Package,
    color: "#E91E63",
    image: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
    gradient: ["#E91E63", "#F06292"],
  },
]

// Sample data for thank you messages
const thankYouMessages = [
  {
    id: "1",
    name: "Sunrise Old Age Home",
    message: "Thank you for your generous food donation. It has helped us provide nutritious meals to our residents.",
    date: "3 days ago",
    avatar: "https://cdn-icons-png.flaticon.com/512/4646/4646932.png",
  },
  {
    id: "2",
    name: "Hope Orphanage",
    message: "The clothes you donated have brought smiles to our children. Your kindness is deeply appreciated.",
    date: "1 week ago",
    avatar: "https://cdn-icons-png.flaticon.com/512/5556/5556468.png",
  },
  {
    id: "3",
    name: "Bright Future NGO",
    message: "Your book donations have helped our education program immensely. Thank you for supporting our cause.",
    date: "2 weeks ago",
    avatar: "https://cdn-icons-png.flaticon.com/512/4646/4646925.png",
  },
  {
    id: "4",
    name: "Rural Health Center",
    message: "The medical supplies you donated are saving lives every day. We are grateful for your support.",
    date: "3 weeks ago",
    avatar: "https://cdn-icons-png.flaticon.com/512/4646/4646982.png",
  },
]

// Sample data for active campaigns
const activeCampaigns = [
  {
    id: "1",
    title: "Back to School Drive",
    description: "Help students get the supplies they need for the new school year",
    image: "https://cdn-icons-png.flaticon.com/512/2436/2436874.png",
    daysLeft: 15,
    progress: 65,
    gradient: ["#3F51B5", "#5C6BC0"],
  },
  {
    id: "2",
    title: "Monsoon Relief",
    description: "Support families affected by recent floods with essential supplies",
    image: "https://cdn-icons-png.flaticon.com/512/1684/1684375.png",
    daysLeft: 7,
    progress: 80,
    gradient: ["#009688", "#4DB6AC"],
  },
  {
    id: "3",
    title: "Healthcare for All",
    description: "Provide medical assistance to underserved communities",
    image: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
    daysLeft: 21,
    progress: 40,
    gradient: ["#E91E63", "#F06292"],
  },
]

// Sample data for received donations (for recipients)
const receivedDonations = [
  {
    id: "1",
    type: "Food",
    items: "Rice, Dal, Vegetables",
    donor: "Rahul Sharma",
    date: "Yesterday",
    icon: Coffee,
    color: "#FF9800",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081887.png",
    gradient: ["#FF9800", "#FFB74D"],
  },
  {
    id: "2",
    type: "Clothes",
    items: "Winter wear, Blankets",
    donor: "Priya Patel",
    date: "3 days ago",
    icon: ShoppingBag,
    color: "#2196F3",
    image: "https://cdn-icons-png.flaticon.com/512/2589/2589625.png",
    gradient: ["#2196F3", "#64B5F6"],
  },
  {
    id: "3",
    type: "Medical Supplies",
    items: "First aid kits, Medicines",
    donor: "Amit Kumar",
    date: "1 week ago",
    icon: Package,
    color: "#F44336",
    image: "https://cdn-icons-png.flaticon.com/512/2966/2966327.png",
    gradient: ["#F44336", "#EF9A9A"],
  },
  {
    id: "4",
    type: "Educational",
    items: "Books, Stationery",
    donor: "Neha Singh",
    date: "2 weeks ago",
    icon: Bookmark,
    color: "#9C27B0",
    image: "https://cdn-icons-png.flaticon.com/512/2436/2436874.png",
    gradient: ["#9C27B0", "#BA68C8"],
  },
]

// Sample data for donor thank you messages (for recipients to see)
const donorMessages = [
  {
    id: "1",
    name: "Rahul Sharma",
    message: "Happy to contribute to your noble cause. Keep up the great work!",
    date: "2 days ago",
    avatar: "https://cdn-icons-png.flaticon.com/512/4646/4646932.png",
  },
  {
    id: "2",
    name: "Priya Patel",
    message: "It's an honor to be able to support your organization. Wishing you all the best.",
    date: "5 days ago",
    avatar: "https://cdn-icons-png.flaticon.com/512/4646/4646925.png",
  },
  {
    id: "3",
    name: "Amit Kumar",
    message: "Your organization is doing incredible work. I'm glad I could help in a small way.",
    date: "1 week ago",
    avatar: "https://cdn-icons-png.flaticon.com/512/4646/4646982.png",
  },
]

// Sample data for testimonials
const testimonials = [
  {
    id: "1",
    quote: "Giving is not just about making a donation. It's about making a difference.",
    author: "Kathy Calvin",
    role: "Former President and CEO of the UN Foundation",
  },
  {
    id: "2",
    quote: "We make a living by what we get, but we make a life by what we give.",
    author: "Winston Churchill",
    role: "Former Prime Minister of the United Kingdom",
  },
  {
    id: "3",
    quote: "No one has ever become poor by giving.",
    author: "Anne Frank",
    role: "Diarist",
  },
  {
    id: "4",
    quote: "The meaning of life is to find your gift. The purpose of life is to give it away.",
    author: "Pablo Picasso",
    role: "Artist",
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const [userType, setUserType] = useState("donor") // Default to donor, will be fetched from storage
  const [userName, setUserName] = useState("")
  const scrollX = useRef(new Animated.Value(0)).current
  const campaignScrollX = useRef(new Animated.Value(0)).current
  const messageScrollX = useRef(new Animated.Value(0)).current
  const testimonialScrollX = useRef(new Animated.Value(0)).current

  // Refs for auto-scrolling
  const featuredRef = useRef(null)
  const messagesRef = useRef(null)
  const campaignsRef = useRef(null)
  const testimonialsRef = useRef(null)

  // Current indices for auto-scrolling
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)
  const [campaignIndex, setCampaignIndex] = useState(0)
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  // Animation values for impact stats
  const impactAnimations = useRef(impactStats.map(() => new Animated.Value(0))).current

  useEffect(() => {
    // Fetch user type and name from storage
    const fetchUserData = async () => {
      try {
        const userDetail = await getLocalStorage("userDetail")
        if (userDetail) {
          setUserType(userDetail.category || "donor")
          setUserName(userDetail.displayName || "")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()

    // Animate impact stats sequentially
    const animateImpactStats = () => {
      const animations = impactAnimations.map((anim, index) => {
        return Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        })
      })

      Animated.stagger(200, animations).start()
    }

    animateImpactStats()

    // Set up auto-scrolling intervals
    const featuredInterval = setInterval(() => {
      if (featuredRef.current) {
        const nextIndex = (featuredIndex + 1) % featuredCampaigns.length
        featuredRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        })
        setFeaturedIndex(nextIndex)
      }
    }, 5000)

    const messagesInterval = setInterval(() => {
      if (messagesRef.current) {
        const messages = userType === "donor" ? thankYouMessages : donorMessages
        const nextIndex = (messageIndex + 1) % messages.length
        messagesRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        })
        setMessageIndex(nextIndex)
      }
    }, 6000)

    const campaignsInterval = setInterval(() => {
      if (campaignsRef.current) {
        const nextIndex = (campaignIndex + 1) % activeCampaigns.length
        campaignsRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        })
        setCampaignIndex(nextIndex)
      }
    }, 7000)

    const testimonialsInterval = setInterval(() => {
      if (testimonialsRef.current) {
        const nextIndex = (testimonialIndex + 1) % testimonials.length
        testimonialsRef.current.scrollToIndex({
          index: nextIndex,
          animated: true,
        })
        setTestimonialIndex(nextIndex)
      }
    }, 8000)

    // Clean up intervals
    return () => {
      clearInterval(featuredInterval)
      clearInterval(messagesInterval)
      clearInterval(campaignsInterval)
      clearInterval(testimonialsInterval)
    }
  }, [featuredIndex, messageIndex, campaignIndex, testimonialIndex, userType])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const renderFeaturedItem = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    })

    return (
      <Animated.View style={[styles.featuredItemContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featuredItem}>
          <View style={styles.featuredImageContainer}>
            <Image source={{ uri: item.image }} style={styles.featuredImage} />
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{item.progress}%</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  const renderImpactStat = ({ item, index }) => {
    const Icon = item.icon

    const translateY = impactAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    })

    const opacity = impactAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    })

    return (
      <Animated.View style={[styles.statCardContainer, { opacity, transform: [{ translateY }] }]}>
        <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Icon width={24} height={24} color={THEME.textLight} />
          </View>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statTitle}>{item.title}</Text>
        </LinearGradient>
      </Animated.View>
    )
  }

  const renderShortcut = ({ icon: Icon, title, onPress, color, gradient }) => (
    <TouchableOpacity style={styles.shortcutButtonContainer} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shortcutButton}>
        <View style={styles.shortcutIconContainer}>
          <Icon width={24} height={24} color={THEME.textLight} />
        </View>
        <Text style={styles.shortcutTitle}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )

  const renderDonationItem = ({ item }) => {
    const Icon = item.icon
    return (
      <TouchableOpacity style={styles.donationCardContainer} activeOpacity={0.9}>
        <LinearGradient
          colors={item.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.donationCardGradient}
        >
          <View style={styles.donationCardOverlay}>
            <View style={styles.donationHeader}>
              <View style={styles.donationIconContainer}>
                <Icon width={20} height={20} color={THEME.textLight} />
              </View>
              <Text style={styles.donationType}>{item.type}</Text>
            </View>

            <View style={styles.donationImageContainer}>
              <Image source={{ uri: item.image }} style={styles.donationImage} />
            </View>

            <View style={styles.donationContent}>
              <Text style={styles.donationItems} numberOfLines={1}>
                {item.items}
              </Text>
              {userType === "donor" ? (
                <Text style={styles.donationRecipient} numberOfLines={1}>
                  To: {item.recipient}
                </Text>
              ) : (
                <Text style={styles.donationRecipient} numberOfLines={1}>
                  From: {item.donor}
                </Text>
              )}
              <View style={styles.donationFooter}>
                <View style={styles.donationTimeContainer}>
                  <Clock width={12} height={12} color={THEME.textLight} />
                  <Text style={styles.donationTime}>{item.date}</Text>
                </View>
                {userType === "donor" && <Text style={styles.donationAmount}>{item.amount}</Text>}
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  const renderThankYouMessage = ({ item, index }) => {
    const inputRange = [(index - 1) * width * 0.9, index * width * 0.9, (index + 1) * width * 0.9]

    const scale = messageScrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    const opacity = messageScrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    })

    return (
      <Animated.View style={[styles.messageCardContainer, { transform: [{ scale }], opacity }]}>
        <BlurView intensity={80} tint="light" style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <Image source={{ uri: item.avatar }} style={styles.messageAvatar} />
            <View style={styles.messageHeaderContent}>
              <Text style={styles.messageSender}>{item.name}</Text>
              <Text style={styles.messageDate}>{item.date}</Text>
            </View>
          </View>
          <Text style={styles.messageText}>{item.message}</Text>
          <View style={styles.messageQuoteIcon}>
            <MessageCircle width={24} height={24} color="rgba(31, 105, 105, 0.1)" />
          </View>
        </BlurView>
      </Animated.View>
    )
  }

  const renderCampaignItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * (width * 0.85 + 20),
      index * (width * 0.85 + 20),
      (index + 1) * (width * 0.85 + 20),
    ]

    const scale = campaignScrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    const opacity = campaignScrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    })

    return (
      <Animated.View style={[styles.campaignCardContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient colors={item.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.campaignCard}>
          <View style={styles.campaignImageContainer}>
            <Image source={{ uri: item.image }} style={styles.campaignImage} />
          </View>
          <View style={styles.campaignContent}>
            <View style={styles.campaignBadge}>
              <Clock width={12} height={12} color={THEME.textLight} />
              <Text style={styles.campaignBadgeText}>{item.daysLeft} days left</Text>
            </View>
            <Text style={styles.campaignTitle}>{item.title}</Text>
            <Text style={styles.campaignDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.campaignProgressContainer}>
              <View style={styles.campaignProgressBar}>
                <View style={[styles.campaignProgressFill, { width: `${item.progress}%` }]} />
              </View>
              <Text style={styles.campaignProgressText}>{item.progress}%</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  const renderTestimonial = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width]

    const scale = testimonialScrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: "clamp",
    })

    const opacity = testimonialScrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: "clamp",
    })

    return (
      <Animated.View style={[styles.testimonialContainer, { transform: [{ scale }], opacity }]}>
        <LinearGradient
          colors={["rgba(31, 105, 105, 0.8)", "rgba(24, 79, 79, 0.9)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.testimonialCard}
        >
          <View style={styles.quoteIconTop}>
            <Text style={styles.quoteSymbol}>"</Text>
          </View>
          <Text style={styles.testimonialQuote}>{item.quote}</Text>
          <View style={styles.quoteIconBottom}>
            <Text style={styles.quoteSymbol}>"</Text>
          </View>
          <View style={styles.testimonialAuthorContainer}>
            <Text style={styles.testimonialAuthor}>{item.author}</Text>
            <Text style={styles.testimonialRole}>{item.role}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.primaryDark} />

      {/* Header with Gradient Background */}
      <LinearGradient
        colors={[THEME.primaryDark, THEME.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userName || "Friend"}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Campaigns */}
        <View style={styles.section}>
          <Animated.FlatList
            ref={featuredRef}
            data={featuredCampaigns}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
          />

          {/* Pagination dots */}
          <View style={styles.paginationContainer}>
            {featuredCampaigns.map((_, index) => {
              const inputRange = [(index - 1) * width, index * width, (index + 1) * width]
              const scale = scrollX.interpolate({
                inputRange,
                outputRange: [1, 1.5, 1],
                extrapolate: "clamp",
              })
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.5, 1, 0.5],
                extrapolate: "clamp",
              })
              return <Animated.View key={index} style={[styles.paginationDot, { transform: [{ scale }], opacity }]} />
            })}
          </View>
        </View>

        {/* Impact Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <TrendingUp width={20} height={20} color={THEME.primary} />
              <Text style={styles.sectionTitle}>Your Impact</Text>
            </View>
          </View>

          <FlatList
            data={impactStats}
            renderItem={renderImpactStat}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsContainer}
          />
        </View>

        {/* Shortcuts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.shortcutsContainer}>
            {userType === "donor" ? (
              <>
                {renderShortcut({
                  icon: Gift,
                  title: "Donate",
                  color: "#4CAF50",
                  gradient: ["#4CAF50", "#81C784"],
                  onPress: () => router.push("/donor"),
                })}
                {renderShortcut({
                  icon: Heart,
                  title: "Requests",
                  color: "#F44336",
                  gradient: ["#F44336", "#EF9A9A"],
                  onPress: () => router.push("/donor/requestedDonations"),
                })}
                {renderShortcut({
                  icon: Package,
                  title: "My Donations",
                  color: "#2196F3",
                  gradient: ["#2196F3", "#64B5F6"],
                  onPress: () => router.push("/donor/donationHistory"),
                })}
                {renderShortcut({
                  icon: Calendar,
                  title: "Chat",
                  color: "#FF9800",
                  gradient: ["#FF9800", "#FFB74D"],
                  onPress: () => router.push("/chat"),
                })}
              </>
            ) : (
              <>
                {renderShortcut({
                  icon: Package,
                  title: "Received",
                  color: "#4CAF50",
                  gradient: ["#4CAF50", "#81C784"],
                  onPress: () => router.push("/recipient/receivedDonations"),
                })}
                {renderShortcut({
                  icon: MessageCircle,
                  title: "Chat",
                  color: "#2196F3",
                  gradient: ["#2196F3", "#64B5F6"],
                  onPress: () => router.push("/chat"),
                })}
                
              </>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Clock width={20} height={20} color={THEME.primary} />
              <Text style={styles.sectionTitle}>{userType === "donor" ? "Recent Donations" : "Recently Received"}</Text>
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push(userType === "donor" ? "/donation-history" : "/received-donations")}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight width={16} height={16} color={THEME.primary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={userType === "donor" ? recentDonations : receivedDonations}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.donationsContainer}
          />
        </View>

        {/* Thank You Messages */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Smile width={20} height={20} color={THEME.primary} />
              <Text style={styles.sectionTitle}>{userType === "donor" ? "Thank You Notes" : "Donor Messages"}</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/messages")}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight width={16} height={16} color={THEME.primary} />
            </TouchableOpacity>
          </View>

          <Animated.FlatList
            ref={messagesRef}
            data={userType === "donor" ? thankYouMessages : donorMessages}
            renderItem={renderThankYouMessage}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width * 0.9}
            decelerationRate="fast"
            contentContainerStyle={styles.messagesContainer}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: messageScrollX } } }], {
              useNativeDriver: true,
            })}
          />
        </View>

        {/* Active Campaigns */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Award width={20} height={20} color={THEME.primary} />
              <Text style={styles.sectionTitle}>Active Campaigns</Text>
            </View>
            <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push("/campaigns")}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight width={16} height={16} color={THEME.primary} />
            </TouchableOpacity>
          </View>

          <Animated.FlatList
            ref={campaignsRef}
            data={activeCampaigns}
            renderItem={renderCampaignItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.campaignsContainer}
            snapToInterval={width * 0.85 + 20}
            decelerationRate="fast"
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: campaignScrollX } } }], {
              useNativeDriver: true,
            })}
          />
        </View>

        {/* Testimonials / Quotes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Star width={20} height={20} color={THEME.primary} />
              <Text style={styles.sectionTitle}>Inspiring Quotes</Text>
            </View>
          </View>

          <Animated.FlatList
            ref={testimonialsRef}
            data={testimonials}
            renderItem={renderTestimonial}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            contentContainerStyle={styles.testimonialsContainer}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: testimonialScrollX } } }], {
              useNativeDriver: true,
            })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 10 : StatusBar.currentHeight,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    zIndex:10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 10,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.textLight,
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  scrollContent: {
    paddingTop: 30,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.text,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(31, 105, 105, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: THEME.primary,
    fontWeight: "600",
    marginRight: 4,
  },
  featuredItemContainer: {
    width: width,
    paddingHorizontal: 20,
  },
  featuredItem: {
    flexDirection: "row",
    borderRadius: 24,
    overflow: "hidden",
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  featuredImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featuredImage: {
    width: 60,
    height: 60,
    tintColor: "#fff",
  },
  featuredContent: {
    flex: 1,
    justifyContent: "center",
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: THEME.secondary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.textLight,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.primary,
    marginHorizontal: 4,
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statCardContainer: {
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCard: {
    width: 130,
    height: 150,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  shortcutsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  shortcutButtonContainer: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  shortcutButton: {
    padding: 20,
    alignItems: "center",
  },
  shortcutIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  shortcutTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.textLight,
    textAlign: "center",
  },
  donationsContainer: {
    paddingHorizontal: 16,
  },
  donationCardContainer: {
    width: 200,
    height: 250,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  donationCardGradient: {
    flex: 1,
  },
  donationCardOverlay: {
    flex: 1,
    padding: 16,
  },
  donationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  donationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  donationImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  donationImage: {
    width: 50,
    height: 50,
    tintColor: "#fff",
  },
  donationContent: {
    flex: 1,
  },
  donationType: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textLight,
  },
  donationItems: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 8,
  },
  donationRecipient: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 12,
  },
  donationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
  },
  donationTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  donationTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 4,
  },
  donationAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textLight,
  },
  messagesContainer: {
    paddingHorizontal: 16,
  },
  messageCardContainer: {
    width: width * 0.9,
    marginHorizontal: 8,
  },
  messageCard: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  messageHeaderContent: {
    flex: 1,
  },
  messageSender: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.text,
  },
  messageDate: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
  },
  messageText: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 22,
    fontStyle: "italic",
  },
  messageQuoteIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    opacity: 0.5,
  },
  campaignsContainer: {
    paddingHorizontal: 16,
  },
  campaignCardContainer: {
    width: width * 0.85,
    height: 220,
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  campaignCard: {
    flex: 1,
    padding: 20,
  },
  campaignImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  campaignImage: {
    width: 50,
    height: 50,
    tintColor: "#fff",
  },
  campaignContent: {
    flex: 1,
  },
  campaignBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  campaignBadgeText: {
    fontSize: 12,
    color: THEME.textLight,
    marginLeft: 4,
  },
  campaignTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: THEME.textLight,
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 16,
    lineHeight: 20,
  },
  campaignProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  campaignProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginRight: 8,
    overflow: "hidden",
  },
  campaignProgressFill: {
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 4,
  },
  campaignProgressText: {
    fontSize: 14,
    fontWeight: "bold",
    color: THEME.textLight,
  },
  testimonialsContainer: {
    paddingHorizontal: 16,
  },
  testimonialContainer: {
    width: width - 40,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  testimonialCard: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  quoteIconTop: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  quoteIconBottom: {
    position: "absolute",
    bottom: 60,
    right: 20,
  },
  quoteSymbol: {
    fontSize: 60,
    color: "rgba(255, 255, 255, 0.2)",
    fontWeight: "bold",
  },
  testimonialQuote: {
    fontSize: 18,
    fontWeight: "500",
    color: THEME.textLight,
    textAlign: "center",
    lineHeight: 28,
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  testimonialAuthorContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  testimonialAuthor: {
    fontSize: 16,
    fontWeight: "bold",
    color: THEME.textLight,
  },
  testimonialRole: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 4,
  },
})

