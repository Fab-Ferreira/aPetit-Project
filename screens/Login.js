import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Alert, TextInput, SafeAreaView, ScrollView, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../src/firebase.config';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { firebase } from '../src/firebase.config';
import { getFirestore, doc, getDoc } from 'firebase/firestore'

export default function Login({navigation}){

    const[email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[seePsWord, setSeePsWord] = useState(false);
    const[showModal, setShowModal] = useState(false);
    const[modalMail, setModalMail] = useState('');

    const isButtonEnabled = email.length > 0 && password.length >= 6;

    const userLogin = () => {
        if(email === '' || password === ''){
            Alert.alert('Campo(s) vazio(s)','Por favor, preencha todos os campos!')
        }
        else {
            signInWithEmailAndPassword(auth, email, password)
            .then(async(userCredential) => {
                const user = userCredential.user;
                await AsyncStorage.setItem('user', user.toString());
                await AsyncStorage.setItem('userID', user.uid)
                .then(async()=>{
                    const firestore = getFirestore(firebase);
                    const docRef = doc(firestore, 'users', user.uid);
                    const docSnapshot = await getDoc(docRef);
                    const data = docSnapshot.data();
                    navigation.navigate('AddPet');
                })
                .catch((error)=>{
                    Alert.alert("Falha na Conexão","Erro ao tentar entrar na conta, tente novamente.");
                })
            })
            .catch((error) => {
                if(error.code === 'auth/invalid-login-credentials'){
                    Alert.alert('Usuário ou senha incorreta', 'Por favor, informe corretamente o endereço e-mail e a sua senha.')
                }
                else {
                    Alert.alert('Erro!', 'Ocorreu um erro inesperado ao tentar acessar a conta. Por favor, tente novamente.')
                }
            })
        }
    }

    const replacePass = () => {
        if(modalMail !== ''){
            sendPasswordResetEmail(auth, modalMail)
            .then(()=>{
                Alert.alert(
                    "Email enviado",
                    "Um email foi enviado para " + modalMail + ". Verifique sua caixa de email.",
                )
                setShowModal(false);

            })
            .catch((error)=>{
                Alert.alert('Falha ao enviar email', 'Houve um problema ao enviar o email. Por favor, tente novamente ou pressione em voltar');
                return;
            })
        } else {
            Alert.alert("Campo vazio!", "Por favor, insira o email para a redifinição de senha.");
        }
    }

    return(
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <Image source={require('../assets/Images/aPetitLogo.png')} style={styles.img}/>

            <Text style={styles.title}>Login</Text>


            <View style={styles.textType}>
                <View style={styles.textTypeContainer}>
                    <MaterialCommunityIcons 
                        name='at' 
                        size={25} 
                        color='black' 
                        style={{marginHorizontal: 5}}
                    />
                    <TextInput 
                        style={styles.loginInfo} 
                        placeholder='E-mail'
                        value={email}
                        onChangeText={setEmail}
                        keyboardType='email-address'/>
                </View>
            </View>

            <View>
                <View style={styles.textType}>
                    <View style={styles.textTypeContainer}>
                        <MaterialCommunityIcons 
                            name='lock' 
                            size={25} 
                            color='black' 
                            style={{marginHorizontal: 5}}
                        />
                        <TextInput 
                            style={styles.loginInfo} 
                            placeholder='Senha'
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!seePsWord}/>

                        <TouchableOpacity onPress={()=>setSeePsWord(!seePsWord)} style={{margin: 5}}>
                            <MaterialCommunityIcons name={seePsWord ? 'eye' : 'eye-off'} size={25} color='black'/>
                        </TouchableOpacity>
                    </View>
                </View> 
                <TouchableOpacity onPress={()=>setShowModal(true)}>
                    <Text style={{fontSize: 13, textDecorationLine: 'underline', fontFamily: 'Montserrat'}}>Esqueci minha senha</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={userLogin} 
                style={[styles.btnLogin, {backgroundColor: isButtonEnabled? '#ff9b4f' : '#ffc89e'}]} 
                disabled={!isButtonEnabled}>
                <Text style={styles.btnLoginText}>Entrar</Text>
            </TouchableOpacity>

            <View style={{flexDirection: 'row'}}>
                <Text style={styles.registerText}>Não possui uma conta? </Text>
                <TouchableOpacity onPress={()=>navigation.navigate('Register')} style={styles.btnRegister}>
                    <Text style={[styles.registerText, {color: '#28b2d6'}]}>Cadastre-se</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>

            <Modal visible={showModal} animationType='slide' transparent={true}>
                <View style={styles.modalView}>
                    <View style={{backgroundColor: 'black', opacity: 0.6, flex: 1}}/>

                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Redefinir Senha</Text>
                        <Text style={styles.modalText}>Informe o e-mail da sua conta para redefinir sua senha</Text>
                        <View style={[styles.textType, {flexDirection: 'row', width: '80%'}]}>
                            <MaterialCommunityIcons name='at' size={25} style={{marginHorizontal: 5}}/>
                            <TextInput 
                                style={styles.loginInfo} 
                                placeholder='Endereço e-mail'
                                value={modalMail}
                                onChangeText={setModalMail}
                                keyboardType='email-address'/>
                        </View>

                        <TouchableOpacity onPress={replacePass} style={styles.sendEmailBtn}>
                            <Text style={styles.sendEmailBtnText}>Enviar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setShowModal(false)} style={{flexDirection: 'row', marginTop: 10}}>
                            <MaterialCommunityIcons size={20} name='arrow-left-bold-box-outline' color='#28b2d6'/>
                            <Text style={styles.closeModalText}>Voltar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    img: {
        resizeMode: 'stretch',
        height: Dimensions.get('screen').height * 0.25,
        aspectRatio: 1/1,
    },

    title: {
        fontSize: 25,
        marginBottom: 20,
        fontFamily: 'Montserrat-SemiBold',
    },

    textType: {
        width: Dimensions.get('screen').width * 0.76,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
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

    btnLogin: {
        height: 40,
        width: 130,
        backgroundColor: '#ff9b4f',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 35
    },

    btnLoginText: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'Montserrat-SemiBold'
    },

    modalView: {
        flex: 1,
        justifyContent: 'center',
    },

    modalContent: {
        backgroundColor: '#fff',
        width: Dimensions.get('screen').width * 0.8,
        height: Dimensions.get('screen').height * 0.8,
        position: 'absolute',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },

    modalTitle: {
        fontSize: 20,
        fontFamily: 'Montserrat-SemiBold',
        marginVertical: 15,
    },

    modalText: {
        fontFamily: 'Montserrat',
        textAlign: 'center',
        width: '90%',
        marginVertical: 10,
        fontSize: 17
    },

    sendEmailBtn: {
        backgroundColor: '#ff9b4f',
        width: '80%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 7,
        height: 40,
        marginVertical: 20
    },

    sendEmailBtnText: {
        fontSize: 18,
        color: 'white',
        fontFamily: 'Montserrat-SemiBold'
    },

    closeModalText: {
        fontFamily: 'Montserrat',
        color: '#28b2d6',
        fontSize: 15,
        marginLeft: 5
    }
})