import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { GiftedChat, Bubble, Send } from "react-native-gifted-chat";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { database as db } from "../../config/FirebaseConfig";
import OpenAI from "openai";
import Ionicons from "react-native-vector-icons/Ionicons";
import Markdown from "react-native-markdown-display";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "react-native-feather";
import { useRouter } from "expo-router";

export default function AIAssistantScreen() {
  interface Message {
    _id: string;
    text: string;
    createdAt: Date;
    user: {
      _id: number;
      name?: string;
    };
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const AIModel = async (prompt: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: prompt }],
      });

      return response.choices[0]?.message?.content || "Sorry, I couldn't process that.";
    } catch (error) {
      console.error("AI response error:", error);
      return "Sorry, something went wrong.";
    }
  };

  useEffect(() => {
    const messagesRef = collection(db, "chats");
    const q = query(messagesRef, orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.id,
          text: doc.data().text,
          createdAt: doc.data().createdAt ? doc.data().createdAt.toDate() : new Date(),
          user: doc.data().user,
        }))
      );
    });
    return () => unsubscribe();
  }, []);

  const handleSend = useCallback(async (newMessages: Message[] = []) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, newMessages));

    const { text } = newMessages[0];

    await addDoc(collection(db, "chats"), {
      text,
      createdAt: serverTimestamp(),
      user: { _id: 1 },
    });

    setIsTyping(true);

    const aiText = await AIModel(text);

    setIsTyping(false);

    const aiResponse = {
      _id: Math.random().toString(36).substring(7),
      text: aiText,
      createdAt: new Date(),
      user: { _id: 2, name: "KindNest AI" },
    };

    setMessages((prev) => GiftedChat.append(prev, [aiResponse]));

    await addDoc(collection(db, "chats"), {
      text: aiText,
      createdAt: serverTimestamp(),
      user: { _id: 2, name: "KindNest AI" },
    });
  }, []);

  const clearChat = async () => {
    try {
      const messagesRef = collection(db, "chats");
      const snapshot = await getDocs(messagesRef);
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setMessages([]);
      // console.log("Chat cleared!");
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  interface RenderMessageTextProps {
    currentMessage: {
      text: string;
    };
  }

  const renderMessageText = (props: RenderMessageTextProps) => (
    <Markdown>{props.currentMessage.text}</Markdown>
  );

  const router = useRouter();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.container}>
        {/* 🔹 Header Title */}
        <LinearGradient colors={["#0B5351", "#092327"]} start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }} style={styles.headerGradient}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => (router.replace("/(tabsDonor)"))} activeOpacity={0.7}>
              <ArrowLeft width={24} height={24} color="#ffffff" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>KindNest AI Assistant</Text>
            </View>
            <Text style={styles.headerSubtitle}>Ask anything — your AI assistant is here to help with kindness.</Text>
          </View>
        </LinearGradient>
        {/* 🔹 Clear Chat Button */}
        <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>

        <GiftedChat
          messages={messages}
          onSend={(messages) => handleSend(messages)}
          user={{ _id: 1 }}
          isTyping={isTyping}
          renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                right: {
                  backgroundColor: "#179898",
                  borderRadius: 18,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                  marginRight: 6,
                  marginVertical: 2,
                  maxWidth: "85%",
                },
                left: {
                  backgroundColor: "#e5e7eb",
                  borderRadius: 18,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  marginLeft: 6,
                  marginVertical: 2,
                  maxWidth: "85%",
                  marginBottom: 30,
                },
              }}
              textStyle={{
                right: {
                  color: "#ffffff",
                  fontSize: 15,
                },
                left: {
                  color: "#111827",
                  fontSize: 15,
                },
              }}
            />
          )}
          renderSend={(props) => (
            <Send {...props}>
              <Text style={styles.sendText}>Send</Text>
            </Send>
          )}
          renderMessageText={renderMessageText}
          bottomOffset={10}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
      marginLeft: 35,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#ffffff",
    },
    headerSubtitle: {
      fontSize: 14,
      color: "rgba(255, 255, 255, 0.8)",
      marginLeft: 26,
    },
  clearButton: {
    position: "absolute",
    top: 90,
    right: 10,
    backgroundColor: "#ef4444",
    padding: 10,
    borderRadius: 30,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  sendText: {
    color: "#179898",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginRight: 10,
  },
  backButton: {
    position: "absolute",
    left: 10,
    top: 0,
    zIndex: 10,
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
});
