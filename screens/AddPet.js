import React, {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions, TextInput, Alert, SafeAreaView, BackHandler, ActivityIndicator, Image } from 'react-native';
import PropsHeader from '../assets/PropsHeader'; 
import { lightTheme, darkTheme } from '../src/theme';
import { firebase, auth } from '../src/firebase.config';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';

export default function AddPet({navigation}){

    const[petName, setPetName] = useState('');
    const theme = lightTheme;
    const[isLoaded, setIsLoaded] = useState(false);

    useEffect(()=> {
        loadFirestore();
    },[])

    const loadFirestore = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();

        if(data.pet_registered === true) { navigation.navigate('LoadingScreen'); }
        else { setIsLoaded(true); }
    }    

    const verifyName = async() => {
        if(petName !== ''){
            await AsyncStorage.setItem('petNameData', petName);
            
            navigation.navigate('AddPetInfo', {petName})
        }
        else {
            Alert.alert(
                'Campo vazio',
                'Por favor, insira o nome de seu pet.',
                [
                    {
                        style: 'cancel',
                        text: "OK"
                    }
                ],
                {
                    cancelable: true
                })
        }
    }

    const backAction = () => {
        Alert.alert(
            'Aviso!',
            'Tem certeza que deseja sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },

                {
                    text: 'Sair',
                    onPress: ()=>{
                        signOut(auth)
                        .then(()=> {
                            AsyncStorage.clear()
                            .then(()=>{
                                navigation.navigate('Access')
                            })
                            .catch(error=>{
                                Alert.alert('Erro', 'Houve um erro ao tentar desconectar da sua conta, tente novamente.');
                            })
                        })
                        .catch((error)=>{
                            const errorMessage = error.errorMessage;
                            console.log(errorMessage)
                        })
                    } 
                }
            ],
            {
                cancelable: true
            }
        );
        return true;
    };

    useFocusEffect(
        useCallback(()=>{
            BackHandler.addEventListener('hardwareBackPress', backAction);

            return(()=>{
                BackHandler.removeEventListener('hardwareBackPress', backAction);
            })
        },[])
    );

    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            {isLoaded? (
                <View style={{flex: 1}}>
                    <View style={styles.addView}>
                        <Image source={require('../assets/Images/aPetitLogo.png')} style={{resizeMode: 'stretch', width: 250, height: 250}}/>
                        <Text style={[styles.text, theme.color, {marginBottom: 20}]}>Para começar, insira o nome de seu Pet</Text>
                        <TextInput 
                            style={[styles.text, {borderBottomWidth: 1, marginVertical: 10, fontFamily: 'Montserrat-SemiBold'}, theme.color, theme.borderColor]}
                            value={petName}
                            onChangeText={setPetName}
                            placeholder='Nome'
                            placeholderTextColor={theme.placeholder}/>
                        <TouchableOpacity onPress={verifyName} style={styles.continueBtn}> 
                            <Text style={styles.btnText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#28b2d6" /> 
                </View>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    addView: {
        flex: 1,
        width: Dimensions.get('screen').width,
        justifyContent: 'center',
        alignItems: 'center',
    },

    text: {
        fontSize: 20,
        width: 250,
        paddingVertical: 5,
        textAlign: 'center',
        fontFamily: 'Montserrat'
    },
    
    continueBtn: {
        height: 45,
        width: 220,
        backgroundColor: '#ff9b4f',
        borderRadius: 7,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 35
    },
    
    btnText: {
        fontFamily: 'Montserrat-SemiBold',
        color: 'white',
        fontSize: 18
    }
})