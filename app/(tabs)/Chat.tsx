import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { GiftedChat, Bubble, Send } from "react-native-gifted-chat";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, getDocs } from "firebase/firestore";
import { database as db } from "../../config/FirebaseConfig"; // Ensure Firebase is properly configured
import OpenAI from "openai";
import Ionicons from "react-native-vector-icons/Ionicons";
import Markdown from 'react-native-markdown-display'; 

const AIAssistantScreen = () => {
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
  const [isTyping, setIsTyping] = useState(false); // 🔹 AI typing indicator

  const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Function to fetch AI response from Gemini 2.5
  const AIModel = async (prompt: string) => {
    try {
      const response = await openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: prompt }],
      });

      console.log("AI Response:", response);
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

    // Save user message to Firestore
    await addDoc(collection(db, "chats"), {
      text,
      createdAt: serverTimestamp(),
      user: { _id: 1 },
    });

    setIsTyping(true); // 🔹 Show AI is thinking

    // Fetch AI response
    const aiText = await AIModel(text);

    setIsTyping(false); // 🔹 AI finished thinking

    const aiResponse = {
      _id: Math.random().toString(36).substring(7),
      text: aiText,
      createdAt: new Date(),
      user: { _id: 2, name: "KindNest AI" },
    };

    console.log("AI Response:", aiResponse);

    setMessages((prev) => GiftedChat.append(prev, [aiResponse]));

    // Save AI response to Firestore
    await addDoc(collection(db, "chats"), {
      text: aiText,
      createdAt: serverTimestamp(),
      user: { _id: 2, name: "KindNest AI" },
    });
  }, []);

  // 🔥 Function to clear chat history from Firestore
  const clearChat = async () => {
    try {
      const messagesRef = collection(db, "chats");
      const snapshot = await getDocs(messagesRef);

      // Delete each document
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Clear UI
      setMessages([]);
      console.log("Chat cleared!");
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
    <Markdown>
      {props.currentMessage.text}
    </Markdown>
  );

  return (
    <View style={styles.container}>
        {/* 🔹 Clear Chat Button */}
      <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>

      <GiftedChat
        messages={messages}
        onSend={(messages) => handleSend(messages)}
        user={{ _id: 1 }}
        isTyping={isTyping} // 🔹 Shows typing indicator
        renderBubble={(props) => (
            <Bubble
              {...props}
              wrapperStyle={{
                right: {
                  backgroundColor: "#179898", // Change this to any color you want (e.g., green)
                  paddingHorizontal : 5,
                },
                left: {
                  backgroundColor: "#E0E0E0", // AI response background color (e.g., light gray)
                  paddingHorizontal : 8,
                  paddingVertical : 3,
                },
              }}
              textStyle={{
                right: {
                  color: "#ffffff",
                  alignSelf : "center",
                   // Text color for user messages
                },
                left: {
                  color: "#000", // Text color for AI messages
                },
              }}
            />
          )}
        // 🔹 Change Send button text color
        renderSend={(props) => (
            <Send {...props}>
              <Text style={styles.sendText}>Send</Text>
            </Send>
          )}
        renderMessageText={renderMessageText} // 🔹 Render markdown text
        />
      </View>
    );
  };

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f5f5f5",
    },
    clearButton: {
      position: "absolute",
      top: 10,
      right: 10,
      backgroundColor: "#d9534f", // 🔹 Red button color
      padding: 10,
      borderRadius: 20,
      zIndex: 10,
    },
    sendText: {
        color: "#179898",
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 8,
        marginRight: 10,
      },
  });

export default AIAssistantScreen;

// import React, { Component } from 'react'
// import { Text, View } from 'react-native'

// export class chat extends Component {
//   render() {
//     return (
//       <View>
//         <Text> textInComponent </Text>
//       </View>
//     )
//   }
// }

// export default chat


