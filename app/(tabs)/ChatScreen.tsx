import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, FlatList, TouchableOpacity, ScrollView } from 'react-native';

const messages = [
  { id: '1', sender: 'Julia', time: '8:45 AM', text: 'Lorem ipsum dolor sit amet consectetur. Est tincidunt.' },
  { id: '2', sender: 'Me', time: '8:46 AM', text: 'Lorem ipsum dolor sit amet consectetur.' },
  // Add more messages here
];

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Image source={require('../../assets/images/Dummy.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Image source={require('../../assets/images/Dummy.png')} style={styles.profileImage} />
        <Text style={styles.userName}>Julia</Text>
      </View>
      <ScrollView style={styles.messageContainer}>
        {messages.map((message) => (
          <View key={message.id} style={message.sender === 'Me' ? styles.myMessage : styles.theirMessage}>
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>{message.time}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Message..." />
        <TouchableOpacity style={styles.sendButton}>
          <Image source={require('../../assets/images/Dummy.png')} style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    padding: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e1ffc7',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    padding: 10,
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
  },
  messageTime: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
  sendIcon: {
    width: 20,
    height: 20,
  },
});
