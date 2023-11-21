import { useCallback } from 'react';
import { Text, TouchableOpacity, StyleSheet, Image, SafeAreaView, BackHandler, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function Access({navigation}){  
    const backAction = () => {
        Alert.alert(
            'Sair do App',
            'Tem certeza que deseja sair?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },

                {
                    text: 'Sair',
                    onPress: ()=>BackHandler.exitApp()
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
        <SafeAreaView style={styles.container}>
            <Image source={require('../assets/Images/aPetitLogo.png')} style={styles.img}/>
            <Text style={styles.messageWelcome}>Seja Bem-Vindo(a)!</Text>

            <TouchableOpacity onPress={()=>navigation.navigate('Register')} style={styles.btnRegister}>
                <Text style={styles.btnRegisterText}>Cadastre-se</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>navigation.navigate('Login')} style={styles.btnLogin}>
                <Text style={styles.btnLoginText}>Login</Text>
            </TouchableOpacity>
        </SafeAreaView> 
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    messageWelcome: {
        alignSelf: 'center',
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 25,
        textAlign: 'center',
        marginBottom: 20
    },
    
    img: {
        resizeMode: 'stretch',
        height: 175,
        aspectRatio: 1/1,
    },

    btnRegister: {
        width: 220,
        borderRadius: 7,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 25,
        flexDirection: 'row',
        backgroundColor: '#ff9b4f',
    },

    btnLogin: {
        width: 220,
        borderRadius: 7,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 25,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#28b2d6'
    },
     
    btnRegisterText: {
        fontSize: 22,
        fontFamily: 'Montserrat-SemiBold',
        color: 'white'
    },

    btnLoginText: {
        fontSize: 22,
        fontFamily: 'Montserrat-SemiBold',
        color: '#28b2d6'
    }
})