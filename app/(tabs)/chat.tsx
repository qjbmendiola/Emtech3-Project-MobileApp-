import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { id: "1", sender: "bot", text: "Hello! How can I help you today?" },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessages = [
      ...chat,
      { id: Date.now().toString(), sender: "user", text: message },
      {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Sample reply...",
      },
    ];

    setChat(newMessages);
    setMessage("");
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View style={styles.container}>

        {/* CHAT LIST */}
        <FlatList
          data={chat}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }} // 🔥 avoid tab overlap
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.sender === "user"
                  ? styles.userMessage
                  : styles.botMessage,
              ]}
            >
              <Text
                style={
                  item.sender === "user"
                    ? styles.userText
                    : styles.botText
                }
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        {/* INPUT */}
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your message..."
            value={message}
            onChangeText={setMessage}
            style={styles.input}
          />

          <Pressable style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#cfcfcf",
    padding: 10,
  },

  message: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: "75%",
  },

  botMessage: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 0,
  },

  userMessage: {
    backgroundColor: "#d32f2f",
    alignSelf: "flex-end",
    borderTopRightRadius: 0,
  },

  botText: {
    color: "#000",
  },

  userText: {
    color: "#fff",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 20,
  },

  sendButton: {
    backgroundColor: "#d32f2f",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginLeft: 8,
    borderRadius: 20,
  },

  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});