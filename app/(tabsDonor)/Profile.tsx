import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { getLocalStorage, setLocalStorage, RemoveLocalStorage } from "@/service/Storage"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { signOut, updatePassword } from "firebase/auth"
import { auth } from "@/config/FirebaseConfig"
import { Feather, MaterialIcons } from "@expo/vector-icons"
import { doc, updateDoc, getFirestore } from "firebase/firestore"

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
}

// Organization types
const ORGANIZATION_TYPES = ["Old Age Home", "Orphanage", "NGO"]

export default function ProfileScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [category, setCategory] = useState("")
  const [userInfo, setUserInfo] = useState<{
    name?: string
    email?: string
    profilePic?: string
    uid?: string
    displayName?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  // Organization details states
  const [organizationType, setOrganizationType] = useState("")
  const [organizationName, setOrganizationName] = useState("")
  const [organizationAddress, setOrganizationAddress] = useState("")
  const [organizationContact, setOrganizationContact] = useState("")
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)
  const [organizationDetailsSet, setOrganizationDetailsSet] = useState(false)

  const router = useRouter()
  const db = getFirestore()

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true)
        const data = await getLocalStorage("userDetail")
        const userCategory = await getLocalStorage("category")
        
        // Fetch organization details if user is a recipient
        if (userCategory === "recipient") {
          const orgDetails = await getLocalStorage("organizationDetails")
          if (orgDetails) {
            setOrganizationType(orgDetails.type || "")
            setOrganizationName(orgDetails.name || "")
            setOrganizationAddress(orgDetails.address || "")
            setOrganizationContact(orgDetails.contact || "")
            setOrganizationDetailsSet(!!orgDetails.type)
          }
        }

        if (data) {
          setUserInfo(data)
          setName(data.displayName || "")
          setEmail(data.email || "")
        }

        if (userCategory) {
          setCategory(userCategory)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      Alert.alert("Error", "Name and email cannot be empty.")
      return
    }

    // Validate organization details for recipients
    if (category === "recipient") {
      if (!organizationName || !organizationAddress || !organizationContact) {
        Alert.alert("Error", "Please fill in all organization details.")
        return
      }

      if (!organizationType && !organizationDetailsSet) {
        Alert.alert("Error", "Please select an organization type.")
        return
      }
    }

    try {
      setUpdating(true)
      const updatedUser = { ...(userInfo || {}), name, email }
      await setLocalStorage("userDetail", updatedUser)
      setUserInfo(updatedUser)

      // Save organization details for recipients
      if (category === "recipient") {
        const orgDetails = {
          type: organizationType,
          name: organizationName,
          address: organizationAddress,
          contact: organizationContact,
        }
        await setLocalStorage("organizationDetails", orgDetails)
        setOrganizationDetailsSet(!!organizationType)

        // Update Firebase database with organization details
        if (userInfo?.uid) {
          const userDocRef = doc(db, "users", userInfo.uid)
          await updateDoc(userDocRef, {
            organizationDetails: {
              type: organizationType,
              name: organizationName,
              address: organizationAddress,
              contact: organizationContact,
            },
          })
        } else {
          console.error("User ID not found, cannot update Firebase database")
        }
      }

      if (password) {
        if (auth.currentUser) {
          await updatePassword(auth.currentUser, password)
          Alert.alert("Success", "Profile and password updated successfully!")
          setPassword("")
        } else {
          Alert.alert("Error", "No authenticated user found.")
        }
      } else {
        Alert.alert("Success", "Profile updated successfully!")
      }
    } catch (error) {
      console.error("Update Error:", error)
      Alert.alert("Error", "Failed to update profile. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    try {
      await RemoveLocalStorage("userDetail")
      await RemoveLocalStorage("role")
      await RemoveLocalStorage("category")
      await RemoveLocalStorage("organizationDetails")
      await signOut(auth)
      router.replace("/login/SignIn")
    } catch (error) {
      console.error("Logout Error:", error)
      Alert.alert("Error", "Failed to logout. Please try again.")
    }
  }

  const selectOrganizationType = (type: string) => {
    setOrganizationType(type)
    setShowTypeDropdown(false)
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={THEME.primary} />
        <Text className="mt-4 text-gray-600">Loading profile...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#0B5351", "#092327"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="w-full pt-8 pb-12 items-center rounded-b-[40px] shadow-lg"
        >
          {/* Category Badge */}
          {category && (
            <View className="absolute top-4 right-4 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Text className="text-white font-semibold capitalize">
                {category === "donor" ? "🎁 Donor" : "🙏 Recipient"}
              </Text>
            </View>
          )}

          {/* Profile Image */}
          <View className="w-28 h-28 rounded-full overflow-hidden border-4 border-white items-center justify-center bg-white shadow-xl">
              <View className="w-full h-full bg-gray-200 items-center justify-center">
                <Feather name="user" size={50} color="#666" />
              </View>
          </View>

          

          <Text className="text-2xl font-bold mt-3 text-white capitalize">{name || "Your Name"}</Text>
          <Text className="text-white opacity-80 flex-row items-center mt-1">
            <Feather name="mail" size={14} color="white" style={{ opacity: 0.8, marginRight: 5 }} />
            {email || "your.email@example.com"}
          </Text>
        </LinearGradient>

        {/* Profile Form */}
        <View className="px-6 py-8">
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-lg font-bold mb-6 text-gray-800">Personal Information</Text>

            {/* Form Fields */}
            <View className="space-y-5">
              <View>
                <Text className="font-medium text-gray-600 my-2">Full Name</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                  <Feather name="user" size={18} color={THEME.textMuted} />
                  <TextInput
                    className="flex-1 p-3 ml-2"
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View>
                <Text className="font-medium text-gray-600 my-2">Email Address</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                  <Feather name="mail" size={18} color={THEME.textMuted} />
                  <TextInput
                    className="flex-1 p-3 ml-2"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View>
                <Text className="font-medium text-gray-600 my-2">New Password</Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                  <Feather name="lock" size={18} color={THEME.textMuted} />
                  <TextInput
                    className="flex-1 p-3 ml-2"
                    placeholder="Enter new password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1 ml-1">Leave blank if you don't want to change</Text>
              </View>
            </View>
          </View>

          {/* Organization Details - Only for Recipients */}
          {category === "recipient" && (
            <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
              <Text className="text-lg font-bold mb-6 text-gray-800">Organization Details</Text>

              {/* Organization Form Fields */}
              <View className="space-y-5">
                <View>
                  <Text className="font-medium text-gray-600 my-2">Organization Type</Text>
                  <TouchableOpacity
                    className="flex-row items-center justify-between border border-gray-200 rounded-xl bg-gray-50 px-3 py-3"
                    onPress={() => !organizationDetailsSet && setShowTypeDropdown(true)}
                    disabled={organizationDetailsSet}
                  >
                    <View className="flex-row items-center">
                      <MaterialIcons name="business" size={18} color={THEME.textMuted} />
                      <Text className={`ml-2 ${!organizationType ? "text-gray-400" : "text-gray-800"}`}>
                        {organizationType || "Select organization type"}
                      </Text>
                    </View>
                    {!organizationDetailsSet && <Feather name="chevron-down" size={18} color={THEME.textMuted} />}
                  </TouchableOpacity>
                  {organizationDetailsSet && (
                    <Text className="text-xs text-amber-600 mt-1 ml-1">
                      Organization type cannot be changed once set
                    </Text>
                  )}
                </View>

                <View>
                  <Text className="font-medium text-gray-600 my-2">Organization Name</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                    <MaterialIcons name="apartment" size={18} color={THEME.textMuted} />
                    <TextInput
                      className="flex-1 p-3 ml-2"
                      placeholder="Enter organization name"
                      value={organizationName}
                      onChangeText={setOrganizationName}
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-medium text-gray-600 my-2">Address</Text>
                  <View className="flex-row items-start border border-gray-200 rounded-xl bg-gray-50 px-3 py-2">
                    <MaterialIcons name="location-on" size={18} color={THEME.textMuted} style={{ marginTop: 10 }} />
                    <TextInput
                      className="flex-1 p-2 ml-2"
                      placeholder="Enter organization address"
                      value={organizationAddress}
                      onChangeText={setOrganizationAddress}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                </View>

                <View>
                  <Text className="font-medium text-gray-600 my-2">Contact Number</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-gray-50 px-3">
                    <Feather name="phone" size={18} color={THEME.textMuted} />
                    <TextInput
                      className="flex-1 p-3 ml-2"
                      placeholder="Enter contact number"
                      value={organizationContact}
                      onChangeText={setOrganizationContact}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Account Type */}
          <View className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <Text className="text-lg font-bold mb-4 text-gray-800">Account Type</Text>
            <View className="flex-row items-center p-3 bg-gray-50 rounded-xl">
              <MaterialIcons
                name={category === "donor" ? "volunteer-activism" : "person"}
                size={24}
                color={THEME.primary}
              />
              <View className="ml-3">
                <Text className="text-base font-medium capitalize">{category || "Not specified"}</Text>
                <Text className="text-xs text-gray-500">
                  {category === "donor"
                    ? "You're helping others by donating"
                    : category === "recipient"
                      ? "You're receiving assistance"
                      : "Please set your account type"}
                </Text>
              </View>
            </View>
          </View>

          {/* Donation History Button (Only for Donors) */}
          {category === "donor" && (
            <TouchableOpacity
              className="bg-white rounded-2xl shadow-md p-4 mb-6 flex-row items-center justify-between"
              onPress={() => router.replace("/donor/donationHistory")}
            >
              <View className="flex-row items-center">
                <MaterialIcons name="history" size={24} color={THEME.primary} />
                <Text className="text-base font-medium ml-3">Donation History</Text>
              </View>
              <Feather name="chevron-right" size={20} color={THEME.textMuted} />
            </TouchableOpacity>
          )}
          {category === "recipient" && (
            <TouchableOpacity
              className="bg-white rounded-2xl shadow-md p-4 mb-6 flex-row items-center justify-between"
              onPress={() => router.replace("/recipient/receivedDonations")}
            >
              <View className="flex-row items-center">
                <MaterialIcons name="history" size={24} color={THEME.primary} />
                <Text className="text-base font-medium ml-3">Received Donations</Text>
              </View>
              <Feather name="chevron-right" size={20} color={THEME.textMuted} />
            </TouchableOpacity>
          )}

          {/* Buttons */}
          <TouchableOpacity className="w-full mb-3" onPress={handleUpdateProfile} disabled={updating}>
            <LinearGradient
              colors={[THEME.primary, THEME.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="w-full py-4 rounded-xl shadow-md items-center"
            >
              {updating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-center text-lg">Update Profile</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-white border border-red-500 py-4 rounded-xl mb-16"
            onPress={handleLogout}
          >
            <Text className="text-red-500 font-bold text-center text-lg">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Organization Type Dropdown Modal */}
      <Modal
        visible={showTypeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypeDropdown(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={() => setShowTypeDropdown(false)}
        >
          <View className="bg-white rounded-xl mx-6 mt-40 overflow-hidden">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">Select Organization Type</Text>
            </View>

            {ORGANIZATION_TYPES.map((type, index) => (
              <TouchableOpacity
                key={index}
                className="p-4 border-b border-gray-100 flex-row items-center"
                onPress={() => selectOrganizationType(type)}
              >
                <MaterialIcons
                  name={type === "Old Age Home" ? "elderly" : type === "Orphanage" ? "child-care" : "business"}
                  size={20}
                  color={THEME.primary}
                />
                <Text className="text-gray-800 ml-3">{type}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity className="p-4 bg-gray-100" onPress={() => setShowTypeDropdown(false)}>
              <Text className="text-center text-gray-600 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

