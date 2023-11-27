import React, {useState, useEffect} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Dimensions, Image, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropsFooter from '../assets/PropsFooter';
import PropsHeader from '../assets/PropsHeader';
import { lightTheme, darkTheme } from '../src/theme';
import { BleManager } from 'react-native-ble-plx';
import { firebase } from '../src/firebase.config';
import { getDoc, getFirestore, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Connection({navigation}){

    const[isConnected, setIsConnected] = useState(false);
    const[theme, setTheme] = useState(lightTheme);
    //const _BleManager = new BleManager();

    useEffect(()=>{
        loadUserData();
    },[])

    const loadUserData = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();
        
        setTheme(data.dark_theme? darkTheme : lightTheme);
    }

    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            <PropsHeader btnFunc={()=>navigation.navigate('EditProfile')} icon='cog' bgColor={theme.headerColor}/>

            <View style={styles.content}> 
                <View style={styles.status}>
                    <Text style={[styles.statusText, theme.color]}>Status:</Text>
                    <Text style={[styles.statusText, {fontFamily: 'Montserrat-SemiBold'}, theme.color]}>{isConnected? 'On' : 'Off'}</Text>

                    <View style={[styles.statusColor, {backgroundColor: isConnected? '#64b500' : 'red'}]}>
                        <MaterialCommunityIcons name={isConnected? 'wifi' : 'wifi-off'} size={21} color='white'/>
                    </View>
                </View>
            </View>
            

            <View style={[styles.footer, theme.footerColor]}>
                <PropsFooter function={()=>navigation.navigate('Home')} iconName='home' txt='Início' iconColor='#28b2d6' fontColor={theme.footerTxtColor}/>
                <PropsFooter function={()=>navigation.navigate('Alimentation')} iconName='food-drumstick' txt='Alimentar' iconColor='#28b2d6' fontColor={theme.footerTxtColor}/>
                <PropsFooter function={()=>navigation.navigate('Connection')} iconName='wifi' txt='Conexão' iconColor='#ff9b4f' fontColor={theme.footerTxtColor}/>
                <PropsFooter function={()=>navigation.navigate('Planner')} iconName='calendar-month' txt='Calendário' iconColor='#28b2d6' fontColor={theme.footerTxtColor}/>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },

    footer: {
        flexDirection: 'row',
        width: Dimensions.get('screen').width,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 75,
        paddingHorizontal: 15,
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    status: {
        flexDirection: 'row',
        width: 150,
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    btnText: {
        fontSize: 17,
        fontFamily: 'Montserrat-SemiBold',
        color: 'white'
    },

    statusText: {
        fontFamily: 'Montserrat',
        flexDirection: 'row',
        fontSize: 20
    },

    statusColor: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center'
    }
})