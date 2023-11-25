import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, TextInput, ScrollView, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firebase } from '../src/firebase.config';
import { getFirestore, setDoc, doc } from 'firebase/firestore';

export default function Register({navigation}){

    const[userName, setUserName] = useState('')
    const[email, setEmail] = useState('')
    const[password, setPassword] = useState('')
    const[rePassword, setRePassword] = useState('')
    const[seePsWord, setSeePsWord] = useState(false)
    const[seeRePsWord, setSeeRePsWord] = useState(false)
    
    const isButtonEnabled = userName.length > 0 && email.length > 0 && password.length >= 6 && rePassword.length >= 6;

    function newUser() {
        if (password !== rePassword) {
            Alert.alert('Erro nas senhas','As senhas não se coincidem!');
            return;
        }
        else {
            createUserWithEmailAndPassword(auth, email, password)
            .then((UserCredencial) => {
                const user = UserCredencial.user;
                Alert.alert('Bem-vindo(a)!', 'Seja bem-vindo(a) ao aPetit!');
                
                const firestore = getFirestore(firebase);
                const data = {
                    userData: {
                        id: user.uid,
                        name: userName,
                        email: email,
                    },

                    dark_theme: false,
                    pet_registered: false,
                }
                const docRef = doc(firestore, 'users', user.uid);
                setDoc(docRef, data)

                const setStorage = async() => {
                    await AsyncStorage.setItem('userID', user.uid);
                    await AsyncStorage.setItem('user', user);
                }

                setStorage();

                navigation.navigate('AddPet');
            })
            .catch((error) => {
                if(error.code === 'auth/invalid-email'){
                    Alert.alert('E-mail inválido','Por favor, insira um e-mail que seja válido.')
                } else if (error.code === 'auth/email-already-in-use') {
                    Alert.alert('Conta já existente','Por favor, faça login para acessar o aplicativo.');
                    navigation.navigate('Login');
                } else {
                    Alert.alert('Aviso!','Ocorreu um erro inesperado, tente novamente.');
                }
                
            })
        }
    }

    return(
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
            <Image source={require('../assets/Images/aPetitLogo.png')} style={styles.img}/>

            <Text style={styles.title}>Crie sua Conta!</Text>

            <View style={styles.textType}>
                <View style={styles.textTypeContainer}>
                    <MaterialCommunityIcons 
                        name='account' 
                        size={25} 
                        color='black' 
                        style={{marginHorizontal: 5}}
                    />
                    <TextInput 
                        style={styles.loginInfo} 
                        placeholder='Nome'
                        value={userName}
                        onChangeText={setUserName}/>
                </View>
            </View>

            <View style={styles.textType}>
                <View style={styles.textTypeContainer}>
                    <MaterialCommunityIcons 
                        name='at' 
                        size={25} 
                        color='black' 
                        style={{marginHorizontal: 5}}
                    />
                    <TextInput style={styles.loginInfo} 
                        placeholder='E-mail' 
                        keyboardType='email-address'
                        value={email}
                        onChangeText={setEmail}/>
                </View>
            </View>

            <View style={styles.textType}>
                <View style={styles.textTypeContainer}>
                    <MaterialCommunityIcons 
                        name='lock' 
                        size={25} 
                        color='black' 
                        style={{marginHorizontal: 5}}
                    />
                    <TextInput style={styles.loginInfo} 
                        placeholder='Senha' 
                        secureTextEntry={!seePsWord}
                        value={password}
                        onChangeText={setPassword}/>

                    <TouchableOpacity onPress={()=>setSeePsWord(!seePsWord)} style={{margin: 5}}>
                        <MaterialCommunityIcons name={seePsWord ? 'eye' : 'eye-off'} size={25} color='black'/>
                    </TouchableOpacity>
                </View>
            </View>
        
            <View style={styles.textType}>
                <View style={styles.textTypeContainer}>
                    <MaterialCommunityIcons 
                        name='lock' 
                        size={25} 
                        color='black' 
                        style={{marginHorizontal: 5}}/>
                    <TextInput style={styles.loginInfo} 
                        placeholder='Repetir senha' 
                        secureTextEntry={!seeRePsWord}
                        value={rePassword}
                        onChangeText={setRePassword}/>

                    <TouchableOpacity onPress={()=>setSeeRePsWord(!seeRePsWord)} style={{margin: 5}}>
                        <MaterialCommunityIcons name={seeRePsWord ? 'eye' : 'eye-off'} size={25} color='black'/>
                    </TouchableOpacity>
                </View>
            </View>
            

            <TouchableOpacity onPress={newUser} style={[styles.btnJoin, {backgroundColor: isButtonEnabled? '#ff9b4f' : '#ffc89e'}]} disabled={!isButtonEnabled}>
                <Text style={styles.btnJoinText}>Criar</Text>
            </TouchableOpacity>

            <View style={{flexDirection: 'row'}}>
                <Text style={styles.registerText}>Já possui uma conta? </Text>
                <TouchableOpacity onPress={()=>navigation.navigate('Login')} style={styles.btnRegister}>
                    <Text style={[styles.registerText, {color: '#28b2d6'}]}>Login</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    container2: {
        width: Dimensions.get('screen').width * 0.9,
        height: Dimensions.get('screen').height * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'red'
    },

    img: {
        resizeMode: 'stretch',
        height: Dimensions.get('screen').height * 0.25,
        aspectRatio: 1/1
    },

    title: {
        fontSize: 25,
        marginBottom: 20,
        fontFamily: 'Montserrat-SemiBold'
    },

    textType: {
        width: Dimensions.get('screen').width * 0.76,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
        borderBottomWidth: 1
    },

    textTypeContainer: {
        flex: 0.95,
        flexDirection: 'row',
        alignItems: 'center',
    },

    loginInfo: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Montserrat'
    },

    registerText: {
        fontSize: 16,
        fontFamily: 'Montserrat'
    },

    btnJoin: {
        height: 40,
        width: 130,
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 25
    },

    btnJoinText: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'Montserrat-SemiBold',
        letterSpacing: 1
    }
})