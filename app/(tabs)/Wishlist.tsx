"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from "react-native"
import { Picker } from "@react-native-picker/picker"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore"
import { database as db } from "../../config/FirebaseConfig"
import AntDesign from "@expo/vector-icons/AntDesign"
import { LinearGradient } from "expo-linear-gradient"
import { BlurView } from "expo-blur"
import {
  Heart,
  ShoppingBag,
  Coffee,
  Gift,
  User,
  Tag,
  FileText,
  AlertTriangle,
  Check,
  Shirt,
  Activity,
} from "react-native-feather"

const { width } = Dimensions.get("window")

type WishlistItem = {
  id: string
  name: string
  category: string
  description: string
  requester: string
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
  inputBorder: "#e0e0e0",
  gradientStart: "#1f6969",
  gradientEnd: "#184f4f",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",
}

// Categories with icons and colors
const categories = [
  {
    value: "Food",
    label: "Food & Nutrition",
    icon: Coffee,
    color: "#04DC49",
  },
  {
    value: "Clothes",
    label: "Clothes & Garments",
    icon: Shirt,
    color: "#14CC60",
  },
  {
    value: "Toys",
    label: "Toys & Games",
    icon: Gift,
    color: "#4CAF50",
  },
  {
    value: "Medical Supplies",
    label: "Medical Supplies",
    icon: Activity,
    color: "#09A129",
  },
  {
    value: "Miscellaneous",
    label: "Miscellaneous",
    icon: ShoppingBag,
    color: "#09A129",
  },
]

// Get icon for category
const getCategoryIcon = (categoryName: string) => {
  const category = categories.find((cat) => cat.value === categoryName)
  return category ? category.icon : ShoppingBag
}

// Get color for category
const getCategoryColor = (categoryName: string) => {
  const category = categories.find((cat) => cat.value === categoryName)
  return category ? category.color : THEME.primary
}

const Wishlist = () => {
  const [name, setName] = useState<string>("")
  const [category, setCategory] = useState<string>("Food")
  const [description, setDescription] = useState<string>("")
  const [requester, setRequester] = useState<string>("")
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "wishlist"), (snapshot) => {
      const wishlistData: WishlistItem[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<WishlistItem, "id">),
      }))
      setWishlist(wishlistData)
    })

    return () => unsubscribe()
  }, [])

  const handleSubmit = async () => {
    if (!name || !description || !requester) {
      Alert.alert("Missing Information", "Please fill in all required fields to submit your wishlist request.", [
        { text: "OK" },
      ])
      return
    }

    setLoading(true)
    try {
      const wishlistData = { name, category, description, requester }

      if (editingId) {
        const wishlistRef = doc(db, "wishlist", editingId)
        await updateDoc(wishlistRef, wishlistData)
        setEditingId(null)
        setSuccessMessage("Your wishlist request has been updated successfully!")
      } else {
        await addDoc(collection(db, "wishlist"), wishlistData)
        setSuccessMessage("Your wishlist request has been submitted successfully!")
      }

      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 3000)

      // Reset form
      setName("")
      setCategory("Food")
      setDescription("")
      setRequester("")
    } catch (error) {
      Alert.alert("Error", "Failed to process wishlist request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: WishlistItem) => {
    setEditingId(item.id)
    setName(item.name)
    setCategory(item.category)
    setDescription(item.description)
    setRequester(item.requester)
  }

  const handleDelete = async (id: string) => {
    Alert.alert("Confirm Deletion", "Are you sure you want to delete this wishlist request?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "wishlist", id))
            Alert.alert("Success", "Wishlist request has been deleted successfully.")
          } catch (error) {
            Alert.alert("Error", "Failed to delete wishlist request. Please try again.")
          }
        },
        style: "destructive",
      },
    ])
  }

  const renderCategoryIcon = (categoryName: string) => {
    const CategoryIcon = getCategoryIcon(categoryName)
    const color = getCategoryColor(categoryName)

    return (
      <View style={[styles.categoryIconContainer, { backgroundColor: `${color}20` }]}>
        <CategoryIcon width={20} height={20} color={color} />
      </View>
    )
  }

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const categoryColor = getCategoryColor(item.category)

    return (
      <View style={[styles.wishlistItemCard, { borderLeftColor: categoryColor, borderLeftWidth: 4 }]}>
        <View style={styles.wishlistItemContent}>
          <View style={styles.wishlistItemHeader}>
            <View style={styles.wishlistItemCategory}>
              {renderCategoryIcon(item.category)}
              <View>
                <Text style={styles.wishlistItemName}>{item.name}</Text>
                <Text style={styles.wishlistItemCategoryText}>{item.category}</Text>
              </View>
            </View>
            <View style={styles.wishlistItemActions}>
              <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEdit(item)}>
                <AntDesign name="edit" size={16} color={THEME.info} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <AntDesign name="delete" size={16} color={THEME.error} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.wishlistItemDetails}>
            <Text style={styles.wishlistItemDescription}>{item.description}</Text>
            <View style={styles.wishlistItemRequester}>
              <User width={14} height={14} color={THEME.textMuted} />
              <Text style={styles.wishlistItemRequesterText}>Requested by: {item.requester}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={styles.container}>
        <LinearGradient colors={["#0B5351", "#092327"]} start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }} style={styles.headerGradient}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {/* <Heart width={20} height={20} color={THEME.textLight} /> */}
              <Text style={styles.headerTitle}>Wishlist</Text>
            </View>
            <Text style={styles.headerSubtitle}>Request specific needs for those who need it most</Text>
          </View>
        <View style={styles.backgroundContainer}>
          <FlatList
            data={wishlist}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <View style={styles.formContainer}>
                <View style={styles.formSection}>
                  <Text style={styles.sectionTitle}>Create a Wishlist Request</Text>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Requester Name</Text>
                    <View style={styles.inputContainer}>
                      <User width={20} height={20} color={THEME.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter your name or organization"
                        value={requester}
                        onChangeText={setRequester}
                        style={styles.input}
                        placeholderTextColor={THEME.textMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Category</Text>
                    <View style={styles.pickerContainer}>
                      <Tag width={20} height={20} color={THEME.primary} style={styles.inputIcon} />
                      <View style={styles.pickerWrapper}>
                        <Picker
                          selectedValue={category}
                          onValueChange={setCategory}
                          style={styles.picker}
                          dropdownIconColor={THEME.primary}
                        >
                          {categories.map((cat) => (
                            <Picker.Item key={cat.value} label={cat.label} value={cat.value} color={THEME.text} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Requested Item</Text>
                    <View style={styles.inputContainer}>
                      <ShoppingBag width={20} height={20} color={THEME.primary} style={styles.inputIcon} />
                      <TextInput
                        placeholder="Enter the item you need"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholderTextColor={THEME.textMuted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <View style={styles.textAreaContainer}>
                      <FileText width={20} height={20} color={THEME.primary} style={styles.textAreaIcon} />
                      <TextInput
                        placeholder="Describe the need in detail (quantity, urgency, specific requirements, etc.)"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        style={styles.textArea}
                        placeholderTextColor={THEME.textMuted}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    <LinearGradient
                      colors={["#0b5351", "#0b5351"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.submitButtonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color={THEME.textLight} />
                      ) : (
                        <>
                          <Text style={styles.submitButtonText}>{editingId ? "Update Request" : "Submit Request"}</Text>
                          <AntDesign name="arrowright" size={20} color={THEME.textLight} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            }
            ListEmptyComponent={
              wishlist.length === 0 && (
                <View style={styles.emptyStateContainer}>
                  <AlertTriangle width={50} height={50} color={THEME.textMuted} />
                  <Text style={styles.emptyStateText}>No wishlist requests yet</Text>
                  <Text style={styles.emptyStateSubtext}>Create a request to help those in need</Text>
                </View>
              )
            }
            ListFooterComponent={
              wishlist.length > 0 && (
                <View style={styles.wishlistHeader}>
                  <Text style={styles.wishlistTitle}>Current Wishlist Requests</Text>
                  <View style={styles.wishlistDivider} />
                </View>
              )
            }
            ListHeaderComponentStyle={styles.listHeaderStyle}
          />
        </View>

      {/* Success Message */}
      {showSuccessMessage && (
        <View style={styles.successMessageContainer}>
          <BlurView intensity={90} tint="dark" style={styles.successMessageBlur}>
            <View style={styles.successMessageContent}>
              <View style={styles.successIconContainer}>
                <Check width={40} height={40} color={THEME.success} />
              </View>
              <Text style={styles.successMessageTitle}>Success!</Text>
              <Text style={styles.successMessageText}>{successMessage}</Text>
            </View>
          </BlurView>
        </View>
      )}
      </LinearGradient>

    </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  backgroundContainer: {
    marginTop: 20,
    backgroundColor: THEME.background,
  },
  backgroundImage: {
    flex: 1,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 20 : 15,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: THEME.textLight,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 12,
  },
  listContainer: {
    paddingBottom: 40,
  },
  listHeaderStyle: {
    zIndex: 10,
  },
  formContainer: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(31, 105, 105, 0.1)",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: THEME.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(31, 105, 105, 0.2)",
    borderRadius: 12,
    backgroundColor: THEME.card,
    overflow: "hidden",
  },
  inputIcon: {
    padding: 12,
    paddingHorizontal: 20,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 8,
    color: THEME.text,
    fontSize: 14,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(31, 105, 105, 0.2)",
    borderRadius: 12,
    backgroundColor: THEME.card,
    overflow: "hidden",
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  textAreaContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(31, 105, 105, 0.2)",
    borderRadius: 12,
    backgroundColor: THEME.card,
    overflow: "hidden",
    alignItems: "flex-start",
    
  },
  textAreaIcon: {
    padding: 12,
    marginTop: 16,
    marginHorizontal: 6,
  },
  textArea: {
    flex: 1,
    minHeight: 100,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    color: THEME.text,
    fontSize: 14,
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
    shadowColor: THEME.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.textLight,
    marginRight: 8,
  },

  // Wishlist items
  wishlistHeader: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  wishlistTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: THEME.textLight,
  },
  wishlistDivider: {
    height: 3,
    width: 40,
    backgroundColor: THEME.secondary,
    marginTop: 8,
    borderRadius: 2,
  },
  wishlistItemCard: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 106,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  wishlistItemContent: {
    padding: 16,
  },
  wishlistItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  wishlistItemCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  wishlistItemName: {
    fontSize: 16,
    fontWeight: "700",
    color: THEME.text,
  },
  wishlistItemCategoryText: {
    fontSize: 13,
    color: THEME.textMuted,
    marginTop: 2,
  },
  wishlistItemActions: {
    flexDirection: "row",
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
  },
  deleteButton: {
    backgroundColor: "rgba(244, 67, 54, 0.1)",
  },
  wishlistItemDetails: {
    marginTop: 8,
  },
  wishlistItemDescription: {
    fontSize: 14,
    color: THEME.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  wishlistItemRequester: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  wishlistItemRequesterText: {
    fontSize: 13,
    color: THEME.textMuted,
    marginLeft: 6,
    fontStyle: "italic",
  },

  // Empty state
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: THEME.textLight,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 8,
  },

  // Success message
  successMessageContainer: {
    position: "absolute",
    top: 150,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
  successMessageBlur: {
    borderRadius: 16,
    overflow: "hidden",
    width: "90%",
    maxWidth: 320,
  },
  successMessageContent: {
    padding: 20,
    alignItems: "center",
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successMessageTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: THEME.textLight,
    marginBottom: 8,
  },
  successMessageText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
})

export default Wishlist

