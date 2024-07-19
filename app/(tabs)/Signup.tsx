import React, { useState } from 'react';
import { View, Text, TextInput,ScrollView, KeyboardAvoidingView,Platform, StyleSheet,Modal,Alert,Pressable, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {createUserWithEmailAndPassword } from "firebase/auth";
import { ScaledSheet } from 'react-native-size-matters';
import { auth } from "@/app/firebaseConfig"
import axios from 'axios'


interface SignUpScreenProps {
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
  setAuthState: React.Dispatch<React.SetStateAction<string | null>>;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ setUser, setAuthState }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [options, setOptions] = useState(true);
  const [counter1, setCounter1] = useState(1);
  const [counter2, setCounter2] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const router = useRouter();

  const handleOption1 = ()=> {
    if (counter1 < 1) {
      setOptions(!options)
    }
    setCounter1(1)
    setCounter2(0);
  }
  const handleOption2 = ()=> {
    if (counter2 < 1) {
      setOptions(!options)
    }
    setCounter2(1)
    setCounter1(0);
  }
 

  async function createUser(email:string, password: string) {
    try {
      const response = await axios.post(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCo1OOCzf2RhK_Dol9eKj67MBweQy4zsMs',
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      );
      
      console.log('User created successfully:', response.data);
      return response.data; // Optionally return data for further processing
  
    } catch (error) {
      console.error('Error creating user:');
      throw error; // Rethrow the error or handle as needed
    }
  }

  const handleSignup = async () => {
    try {
    
      if(options == true) {
        if(email == "") {
          setModalMessage('Email cannot be empty.');
          setModalVisible(true);
        }
      }else{
        if(phone == "") {
          setModalMessage('Phone number cannot be empty.');
          setModalVisible(true);
        }
      }
      if( password == ""){
        setModalMessage('Password cannot be empty.');
        setModalVisible(true);
      }else if ( password != confirmPassword){
        setModalMessage('Passwords do not match.');
        setModalVisible(true);
      }else{
      try{
        const response = await createUserWithEmailAndPassword(auth, email, password);
      setModalMessage(`User created at: ${response.user.email}`);
      setModalVisible(true);

      // If successful, navigate to next screen
      router.push('/SignUpDetails');
      }catch(error){
        setModalMessage(`Error occured during signup with firebase`);
        setModalVisible(true);
      }
      }
      }catch (error) {
        setModalMessage('Error occured during signup');
        setModalVisible(true);
      }

      }
     
      return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
                setModalVisible(!modalVisible);
              }}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <Text style={styles.modalText}>{modalMessage}</Text>
                  <Pressable
                    style={[styles.buttonm, styles.buttonClose]}
                    onPress={() => setModalVisible(!modalVisible)}
                  >
                    <Text style={styles.textStyle}>close</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
            <View style={styles.top}>
              <View style={styles.logo}>
                <Image source={require("../../assets/images/LogoRed.png")} />
              </View>
              <Text style={styles.title}>Use email or phone</Text>
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: options ? "#FAF2F2" : "transparent" },
                  ]}
                  onPress={handleOption1}
                >
                  <Text
                    style={[
                      styles.text,
                      { color: options ? "black" : "#FAF2F2" },
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: options ? "transparent" : "#FAF2F2" },
                  ]}
                  onPress={handleOption2}
                >
                  <Text
                    style={[
                      styles.text,
                      { color: options ? "#FAF2F2" : "black" },
                    ]}
                  >
                    Phone
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.options}>{options ? "Email" : "Phone"}</Text>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
               keyboardVerticalOffset={50}
              >
                <TextInput
                  style={styles.input}
                  placeholder={options ? "Email" : "Phone"}
                  value={options ? email : phone}
                  onChangeText={options ? setEmail : setPhone}
                  keyboardType={options ? "email-address" : "phone-pad"}
                  autoCapitalize="none"
                  textContentType={options ? "emailAddress" : "password"}
                />

                <Text style={styles.options}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  keyboardType="visible-password"
                  textContentType="password"
                />
                <Text style={{ color: "#3A3A3A", fontSize: 10 }}>
                  Password must be 8 or more characters
                </Text>

                <View>
                  <Text style={styles.options}>Confirm password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    textContentType="password"
                  />
                </View>
              </KeyboardAvoidingView>
            </View>

           
          </View>
        </ScrollView>
      );
    };
    

    
    const styles = ScaledSheet.create({
      container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: "center",
        backgroundColor: "#faf2f2"
      },
      top:{
         marginTop: '100@mvs'
      },
      logo:{
        justifyContent: "center", 
        alignItems: 'center', 
        marginBottom: '20@mvs'
      },
      options: {
        marginTop: '10@mvs', 
        color: "#3A3A3A", 
        fontSize: '15@ms'
      },
      title: {
        alignSelf: "center",
        fontSize: '24@ms',
        marginBottom: '20@vs',
      },
      button: {
        justifyContent: "center",
        width: '154@s',
        height: '40@vs',
        borderRadius: 6,
      },
      inputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: "center",
        marginBottom: '20@vs',
        marginTop: '10@vs',
        backgroundColor: "#C4C4C4",
        height: '45@vs',
        width: '320@s',
        borderRadius: 8
      },
      text: {
        alignSelf: "center",
      },
      input: {
        marginTop: '10@mvs',
        height: '45@vs',
        width: '320@s',
        backgroundColor: "#C4C4C4",
        borderColor: '#C4C4C4',
        borderWidth: 1,
        marginBottom: '10@mvs',
        padding: '5@ms',
        borderRadius: 8
      },
      next: {
        marginTop: '40@mvs',
        marginBottom: '10@mvs',
        backgroundColor: "#800000",
        width: '320@s',
        height: '50@vs',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: "center",
      },
      centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '22@mvs',
      },
      modalView: {
        margin: '20@ms',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: '35@ms',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
      },
      buttonm: {
        borderRadius: 10,
        paddingHorizontal: '5@ms',
        paddingVertical: '3@mvs',
        elevation: 2,
      },
      buttonClose: {
        backgroundColor: '#800000',
      },
      textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
      },
      modalText: {
        marginBottom: '15@mvs',
        textAlign: 'center',
      },
    });
    export default SignUpScreen;
    