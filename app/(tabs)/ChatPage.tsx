import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { ScaledSheet, vs } from 'react-native-size-matters';
import { translateText } from '@/translationService';

const initialMessages = [
  { id: '1', text: 'Hello!', user: 'other' },
  { id: '2', text: 'Hi, how are you?', user: 'me' },
  // Add more messages here
];

type Message = {
  id: string;
  text: string;
  user: string;
};

const MessageBubble: React.FC<{ message: Message; onTranslate: () => void }> = ({ message, onTranslate }) => (
  <View style={[styles.messageBubble, message.user === 'me' ? styles.myMessage : styles.otherMessage]}>
    <Text style={styles.messageText}>{message.text}</Text>
    <TouchableOpacity onPress={onTranslate} style={styles.translateButton}>
      <Text style={styles.translateButtonText}>Translate</Text>
    </TouchableOpacity>
  </View>
);

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [translatedMessages, setTranslatedMessages] = useState<{ [key: string]: string }>({});

  const handleSend = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: String(messages.length + 1),  // Simple ID generation for demonstration
        text: inputMessage,
        user: 'me',
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');  // Clear the input field
    }
  };

  const handleTranslate = async (id: string, text: string) => {
    const translatedText = await translateText(text);
    setTranslatedMessages((prev) => ({ ...prev, [id]: translatedText }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.TopBar}>
        <Image source={require("../../assets/images/Profile8.png")} style={styles.Image} />
        <View style={styles.Icons}>
          <Pressable>
            <Image source={require("../../assets/images/VoiceCall.png")} style={styles.Images} />
          </Pressable>
          <Pressable>
            <Image source={require("../../assets/images/VideoCall.png")} style={styles.Images} />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={{ ...item, text: translatedMessages[item.id] || item.text }}
            onTranslate={() => handleTranslate(item.id, item.text)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={10}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: '10@s',
  },
  TopBar: {
    display: 'flex',
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#c4c4c4",
    alignItems: "center",
    marginTop: "30@vs",
  },
  Icons: {
    display: "flex",
    flexDirection: 'row',
    gap: "2@s",
  },
  Image: {
    height: "50@vs",
    width: "50@s",
    resizeMode: "contain",
  },
  Images: {
    height: "30@vs",
    width: "30@s",
    resizeMode: "contain",
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10@s',
    borderRadius: '10@vs',
    marginVertical: '5@vs',
  },
  myMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#ECECEC',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: '16@vs',
  },
  translateButton: {
    marginTop: '5@vs',
    paddingVertical: '2@vs',
    paddingHorizontal: '6@s',
    borderRadius: '5@vs',
    alignSelf: 'flex-start',
  },
  translateButtonText: {
    color: '#0000FF',
    fontSize: '12@vs',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    padding: '10@s',
  },
  input: {
    flex: 1,
    height: '40@vs',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: '20@vs',
    paddingLeft: '15@s',
  },
  sendButton: {
    marginLeft: '10@s',
    padding: '10@s',
    backgroundColor: '#800000',
    borderRadius: '20@vs',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: '16@vs',
  },
});

export default ChatPage;
