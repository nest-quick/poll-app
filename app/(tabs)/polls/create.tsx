import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert, FlatList } from "react-native";
import {db, auth} from '../../../lib/firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([""]);
  const router = useRouter();

  const addOption = () => {
    if(options.length < 5){
      setOptions([...options, ""]);
    }else{
      Alert.alert("Limit Reached", "Ony 5 options max");
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  }

  const updateOption = (text: string, index: number) => {
    const updatedOptions = [...options];
    updatedOptions[index] = text;
    setOptions(updatedOptions);
  };

  const submitPoll = async() => {
    if(!question.trim() || options.some(opt => !opt.trim())){
      Alert.alert("Error", "Poll question and options cannot be empty");
      return;
    }

    try{
      await addDoc(collection(db, "polls"), {
        question,
        options,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Poll created!");
      setQuestion("");
      setOptions([""]);
      router.push("/(tabs)/feed");

    }catch(error){
      console.error("Error creating poll: ", error);
      Alert.alert("Error", "Failed to create poll");
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a Poll</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter your poll question"
        value={question}
        onChangeText={setQuestion}
      />
      <FlatList
        data={options}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.optionContainer}>
            <TextInput
              style={styles.input}
              value={options[index]} // Keeps the value static
              onChangeText={(text) => updateOption(text, index)}
              placeholder={`Option ${index + 1}`}
            />
            {options.length > 1 && (
              <TouchableOpacity onPress={() => removeOption(index)} style={styles.removeButton}>
                <Text style={styles.removeText}>✖</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <Button title="Add Option" onPress={addOption}/>
      <Button title="Create Poll" onPress={submitPoll}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: "#f0f0f0",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
  },
  removeText: {
    fontSize: 18,
    color: "red",
  },
});
