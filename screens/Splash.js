import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Image, Animated, SafeAreaView } from 'react-native';
import { firebase } from 'firebase/app';
import { auth } from '../src/firebase.config';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Splash({navigation}){

    const[progress, setProgress] = useState(1);

    useEffect(()=>{ 
        if(progress >= 100){
            onAuthStateChanged(auth, async(user) => {
                if(user){
                    await AsyncStorage.setItem('user', user.toString());
                    await AsyncStorage.setItem('userID', user.uid)
                    .then(()=>{
                        navigation.navigate('AddPet');
                    })
                } else {
                    navigation.navigate('Sliders');
                }
            })
        } else {
            setTimeout(()=>{ 
                setProgress(progress + 1)
            }, 1)
        }
    }, [progress])

    return(
        <SafeAreaView style={styles.container}>
            <Image source={require('../assets/Images/aPetitLogo.png')} style={styles.logoImage}/>
            <View style={styles.progressBarContainer}>
                <Animated.View style={[styles.progressBar, {width: `${progress}%`}]}/>
            </View>
        </SafeAreaView>
    )
} 

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 120,
    },

    logoImage: {
        width: 280,
        height: 280,
        resizeMode: 'stretch',
    },

    progressBarContainer: {
        width: '60%',
        height: 5,
        backgroundColor: '#ddd',
        borderRadius: 5,
    },

    progressBar: {
        height: '100%',
        backgroundColor: '#28b2d6',
        borderRadius: 5,
    }
}) 