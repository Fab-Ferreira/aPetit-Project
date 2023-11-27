import React, {useState, useEffect, useCallback} from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { 
    ActivityIndicator, 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Animated, 
    Image, 
    Platform, 
    Dimensions, 
    BackHandler, 
    Alert, 
    SafeAreaView, 
    ScrollView 
} from 'react-native'
import PropsFooter from '../assets/PropsFooter';
import PropsHeader from '../assets/PropsHeader';
import { auth, firebase } from '../src/firebase.config';
import { signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { lightTheme, darkTheme } from '../src/theme';
import { useFocusEffect } from '@react-navigation/native';

export default function Home({navigation}){

    const[isLoaded, setIsLoaded] = useState(false);
    const[storageProgress, setStorageProgress] = useState(3);    
    const[pet, setPet] = useState(undefined);
    const[snack, setSnack] = useState(undefined);
    const[theme, setTheme] = useState(lightTheme);

    useEffect(()=>{
        loadFirestore();
    },[]);

    const loadFirestore = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();   

        if(data.pet_registered === true) 
        {
            setPet(data.petData);
            setSnack(data.snackData);
        }

        setTheme(data.dark_theme? darkTheme : lightTheme);
        setIsLoaded(true);
    }    
        
    const contentView = () => {
        return(
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center'}}>
                <View style={{flex: 1}}>
                    <View style={styles.imgView}>
                        <Image source={{uri: pet.image}} style={styles.img}/>
                    </View>

                    <View style={styles.nameView}>
                        <Text style={[styles.name, theme.color]}>{`${pet.pet_name}`}</Text>
                    </View>

                    <Text style={[styles.textInfo, theme.color]}>{`Animal: ${pet.animal}`}</Text>
                    <Text style={[styles.textInfo, theme.color]}>{`Porte: ${pet.size}`}</Text>
                    <Text style={[styles.textInfo, theme.color]}>{`Peso: ${pet.weight} kg`}</Text>
                    
                    <View style={styles.snackView}>
                        <Text style={[styles.snackTextTitle, theme.color]}>Refeição</Text>
                        <Text style={[styles.textInfo, theme.color]}>{`Quantidade: ${snack.amount} g`}</Text>
                        <Text style={[styles.textInfo, theme.color]}>{`Validade: ${snack.expiration_date}`}</Text>
                    </View>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={()=>navigation.navigate('Alimentation')}>
                            <View style={[styles.btn, {backgroundColor: '#ff9b4f'}]}>
                                <MaterialCommunityIcons name='food-drumstick' color='white' size={30}/>
                            </View>
                            <Text style={[styles.btnText, theme.color]}>Alimentar</Text>
                        </TouchableOpacity> 

                        <TouchableOpacity style={{justifyContent: 'center', alignItems: 'center'}} onPress={()=>navigation.navigate('EditPet')}>
                            <View style={[styles.btn, {backgroundColor: '#28b2d6'}]}>
                                <MaterialCommunityIcons name='cog' color='white' size={30}/>
                            </View>
                            <Text style={[styles.btnText, theme.color]}>Configurar</Text>
                        </TouchableOpacity>
                    </View>  

                    <View style={styles.storage}>
                        <Text style={[styles.textInfo, {alignSelf: 'center', fontFamily: 'Montserrat-SemiBold'}, theme.color]}>Armazenamento</Text>
                        <View style={[styles.storageBarContainer, theme.footerColor]}>
                            <Animated.View style={[styles.storageBar, {width: `${storageProgress * 25}%`}]}/>
                        </View>
                    </View>
                </View>
            </ScrollView>
        )
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
            <PropsHeader btnFunc={()=>navigation.navigate('EditProfile')} icon='cog' bgColor={theme.headerColor}/>

            {isLoaded? (contentView()) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#28b2d6" /> 
                </View>
            )}

            <View style={[styles.footer, theme.footerColor]}>
                <PropsFooter 
                    function={()=>navigation.navigate('Home')} 
                    iconName='home' 
                    txt='Início' 
                    iconColor='#ff9b4f' 
                    fontColor={theme.footerTxtColor}/>
                <PropsFooter 
                    function={()=>navigation.navigate('Alimentation')} 
                    iconName='food-drumstick' 
                    txt='Alimentar' 
                    iconColor='#28b2d6' 
                    fontColor={theme.footerTxtColor}/>
                <PropsFooter 
                    function={()=>navigation.navigate('Connection')} 
                    iconName='wifi' 
                    txt='Conexão'
                    iconColor='#28b2d6' 
                    fontColor={theme.footerTxtColor}/>
                <PropsFooter 
                    function={()=>navigation.navigate('Planner')} 
                    iconName='calendar-month' 
                    txt='Calendário' 
                    iconColor='#28b2d6' 
                    fontColor={theme.footerTxtColor}/>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },

    logoCenter: {
        width: 230,
        height: 230,
        alignSelf: 'center',
    },
    
    footer: {
        flexDirection: 'row',
        width: Dimensions.get('screen').width,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 75,
        position: 'absolute',
        bottom: 0,
        paddingHorizontal: 15,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: {
                    width: 0,
                    height: 20
                },
                shadowOpacity: 0.2,
                shadowRadius: 3
            },

            android: {
                elevation: 50
            }
        })
    },

    imgView: {
        marginTop: 20,
        alignSelf: 'center',
    },

    img: {
        width: 220,
        height: 220,
        resizeMode: 'stretch',
        borderRadius: 40
    },

    openingTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 20,
        width: 200,
        textAlign: 'center',
        lineHeight: 35,
        marginVertical: 20
    },

    openingMessage: {
        fontFamily: 'Montserrat',
        fontSize: 17,
        textAlign: 'center',
        width: Dimensions.get('screen').width * 0.83,
        lineHeight: 23
    },

    nameView: {
        marginVertical: 15,
        borderBottomWidth: 1.5,
        borderColor: '#28b2d6',
        width: Dimensions.get('screen').width * 0.5,
        alignSelf: 'center'
    },

    name: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 25,
        textAlign: 'center'
    },

    textInfo: {
        fontFamily: 'Montserrat',
        fontSize: 17,
        marginBottom: 10
    },

    snackView: {
        borderWidth: 2,
        borderColor: '#28b2d6',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 7
    },

    snackTextTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        marginBottom: 10,
        alignSelf: 'center'
    },

    buttons: {
        flexDirection: 'row',
        alignSelf: 'center',
        marginVertical: 27
    },

    btn: {
        width: 55,
        height: 55,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20
    },

    btnText: { 
        fontFamily: 'Montserrat',
        marginTop: 7
    },

    storageBarContainer: {
        width: Dimensions.get('screen').width * 0.65,
        height: 8,
        backgroundColor: '#ddd',
        borderWidth: 1,
        borderRadius: 7,
        marginTop: 10,
        marginBottom: 90
    },

    storageBar: {
        height: '100%',
        backgroundColor: '#ff9b4f',
        borderRadius: 7
    },
})