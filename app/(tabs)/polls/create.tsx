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
      const user = auth.currentUser;
      if(!user) {
        Alert.alert("Error", "You must be logged in to create a poll");
        return;
      }

      //Initialize votes with 0 for each option
      const votesInit = options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {});

      await addDoc(collection(db, "polls"), {
        question,
        options,
        votes: votesInit,
        voters: {},
        createdAt: serverTimestamp(),
        creatorId: user.uid,
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
      <Text style={styles.title}>Create Poll</Text>
      
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
          <View>
            <TextInput
              style={styles.input}
              value={options[index]} // Keeps the value static
              onChangeText={(text) => updateOption(text, index)}
              placeholder={`Option ${index + 1}`}
            />
            {options.length > 1 && (
              <TouchableOpacity onPress={() => removeOption(index)} style={styles.removeButton}>
                <Text style={styles.removeText}>REMOVE</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />

      <TouchableOpacity style={styles.addOptions} onPress={addOption}>
        <Text style={styles.AddOptionsText}>ADD OPTION</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.createPoll} onPress={submitPoll}>
        <Text style={styles.createPollText}>CREATE POLL</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
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
  removeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  removeText: {
    color: 'red',
    fontWeight: 'bold',
  },
  addOptions: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'green',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  AddOptionsText: {
    color: 'green',
    fontWeight: 'bold',
  },
  
  createPoll: {
    backgroundColor: 'blue',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  createPollText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
