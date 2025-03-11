import { View, Text, Alert, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useState } from 'react';
import { ref, set } from 'firebase/database';
import { database } from '@/config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

const ContactForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmitForm = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill all details');
            return;
        }
        try {
            const newContactRef = ref(database, 'contacts/' + Date.now());
            await set(newContactRef, {
                title,
                description
            });
            Alert.alert('Success!', 'Message sent successfully');
            setTitle('');
            setDescription('');
        } catch (error) {
            console.error('Error storing data: ', error);
            Alert.alert('Error!', 'Error storing data');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white px-6 py-10">
            {/* Header Section */}
            <View className="items-center mb-6">
                <Text className="text-4xl font-bold text-teal-700 mb-2">Contact Us</Text>
                <Text className="text-md text-gray-600 text-center">We're here to help. Let us know your concerns!</Text>
            </View>

            {/* Input Fields */}
            <View className="mb-4">
                <View className="flex-row items-center bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 mb-3">
                    <Ionicons name="text" size={20} color="teal" className="mr-3" />
                    <TextInput
                        placeholder='Enter Title'
                        value={title}
                        onChangeText={setTitle}
                        className="flex-1 text-gray-900"
                    />
                </View>

                <View className="flex-row items-start bg-gray-100 border border-gray-300 rounded-lg px-4 py-3">
                    <Ionicons name="chatbox-ellipses" size={20} color="teal" className="mt-1 mr-3" />
                    <TextInput
                        placeholder='Enter Description'
                        value={description}
                        onChangeText={setDescription}
                        className="flex-1 text-gray-900"
                        multiline
                        numberOfLines={4}
                    />
                </View>
            </View>

            {/* Submit Button */}
            <View className="items-center">
                <TouchableOpacity 
                    className="bg-teal-700 py-4 px-10 w-full rounded-xl shadow-lg active:scale-95 transition-transform"
                    onPress={handleSubmitForm}
                >
                    <Text className="text-white text-center text-lg font-semibold">Send Message</Text>
                </TouchableOpacity>
            </View>

            {/* Decorative Footer */}
            <View className="items-center mt-6">
                <Text className="text-xs text-gray-400">KindNest © 2025 - Spreading Kindness Everywhere</Text>
            </View>
        </KeyboardAvoidingView>
    );
};

export default ContactForm;