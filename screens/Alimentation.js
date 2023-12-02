import React, {useState, useEffect} from 'react';
import { 
    View, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    Dimensions,  
    SafeAreaView, 
    ScrollView, 
    Image, 
    TextInput, 
    Alert, 
    ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropsFooter from '../assets/PropsFooter';
import PropsHeader from '../assets/PropsHeader';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { firebase } from '../src/firebase.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { lightTheme, darkTheme } from '../src/theme';

export default function Alimentation({navigation}){

    const[isLoaded, setIsLoaded] = useState(false);
    const[pet, setPet] = useState(undefined);
    const[time, setTime] = useState(new Date());
    const[showTimePicker, setShowTimePicker] = useState(false);
    const[theme, setTheme] = useState(lightTheme);
    const[amount, setAmount] = useState('');

    useEffect(()=>{
        loadFirestore();
    },[]);

    const loadFirestore = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();

        if(data.pet_registered === true) {
            setPet(data.petData);
        }  

        setTheme(data.dark_theme? darkTheme : lightTheme);
        setIsLoaded(true);
    } 

    const onChangeTime = ({type}, selectedTime) => {
        if(type == "set"){
            const currentTime = selectedTime;
            setTime(currentTime);
        }
        setShowTimePicker(false);
    }

    const testConnection = () => {
        var socket = new WebSocket('ws://192.168.100.77:81');
        socket.onopen = () => {
            console.log("Conexão WebSocket aberta");
            
            // Envio da mensagem após a conexão ser aberta
            socket.send(amount);
             // Evento chamado quando uma mensagem é recebida

            // Evento chamado quando ocorre um erro
            socket.onerror = (error) => {
                console.error("Erro WebSocket:", error);
                Alert.alert('Erro', 'Não foi possível estabelecer uma conexão com o circuito.')
            };

            // Evento chamado quando a conexão é fechada
            socket.onclose = (event) => {
                console.log("Conexão WebSocket fechada:", event);
            };
        };
    }

    const confirmAction = () => {
        if(amount === '' || time === null){
            Alert.alert(
                'Campos vazios',
                'Por favor, preencha todos os campos para prosseguir.',
                [
                    {
                        text: 'OK',
                        style: 'cancel'
                    }
                ],

                {
                    cancelable: true
                }
            )
        }
        else {
            Alert.alert(
                'Alimentar Pet',
                'Você tem certeza que deseja alimentar seu pet fora do horário pré-programado?',
                [
                    {
                        text: 'Não',
                        style: 'cancel'
                    },

                    {
                        text: 'Sim',
                        onPress: ()=>Alert.alert(
                            "Horário definido com sucesso!",
                            "A ração será despejada para seu pet quando chegar na hora certa ☺",
                            [
                                {
                                    text: 'OK',
                                    onPress: testConnection,
                                }
                            ],
                            {
                                cancelable: false
                            }
                        )
                    }
                ],
                {
                    cancelable: true
                }
            )
        }
    }

    const contentView = () => {
        return(
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center'}}>
                <View style={styles.content}>
                    <View style={[styles.imgView, theme.borderColor]}>
                        <Image style={styles.img} source={{uri: pet.image}}/>
                    </View>

                    <View style={styles.nameView}>
                        <Text style={[styles.name, theme.color]}>{`${pet.pet_name}`}</Text>
                    </View> 

                    <Text style={[styles.label, theme.color]}>Informe a quantidade de ração e o horário para alimentar o seu pet</Text>
                    <View style={[styles.inputView, theme.borderColor]}>
                        <MaterialCommunityIcons name='food-drumstick' color={theme.iconColor} size={25}/>
                        <Text style={[styles.text, {marginHorizontal: 10}, theme.color]}>Quantidade (g): </Text>
                        <TextInput
                            style={[styles.text, theme.color, {flex: 1}]}
                            placeholder='em gramas'
                            keyboardType='number-pad'
                            value={amount}
                            onChangeText={setAmount}
                            placeholderTextColor={theme.placeholder}
                            maxLength={3}/>
                    </View>
            
                    <View style={styles.inputTime}>
                        <MaterialCommunityIcons name='clock-outline' size={25} color={theme.iconColor}/>
                        <Text style={[styles.text, {marginLeft: 10}, theme.color]}>{`Horário: ${time.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}`} </Text>
                    </View>
        
                    <TouchableOpacity style={styles.btn} onPress={confirmAction}>
                        <Text style={styles.btnText}>Alimentar</Text>
                    </TouchableOpacity>
                </View>

                {showTimePicker && (
                    <DateTimePicker
                        mode='time'
                        display='spinner'
                        value={time}
                        is24Hour={true}
                        onChange={onChangeTime}/>
                )}
            </ScrollView>
        )
    }

    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            <PropsHeader btnFunc={()=>navigation.navigate('EditProfile')} icon='cog' bgColor={theme.headerColor}/>

            {isLoaded ? (contentView()) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#28b2d6" /> 
                </View>
            )} 

            <View style={[styles.footer, theme.footerColor]}>
                <PropsFooter 
                    function={()=>navigation.navigate('Home')} 
                    iconName='home' 
                    txt='Início' 
                    iconColor='#28b2d6' 
                    fontColor={theme.footerTxtColor}/>
                <PropsFooter 
                    function={()=>navigation.navigate('Alimentation')} 
                    iconName='food-drumstick' 
                    txt='Alimentar'
                    iconColor='#ff9b4f' 
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
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    
    content: {
        flex: 1,
    },

    errorMsg: {
        fontFamily: 'Montserrat-SemiBold',
        textAlign: 'center',
        fontSize: 16,
        width: Dimensions.get('screen').width * 0.9,
    },
    
    addPetBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff9b4f',
        height: 45,
        width: 220,
        borderRadius: 7,
        paddingHorizontal: 10,
        margin: 10
    },

    btnText: {
        fontSize: 17,
        fontFamily: 'Montserrat-SemiBold',
        color: 'white'
    },

    footer: {
        flexDirection: 'row',
        width: Dimensions.get('screen').width,
        backgroundColor: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 75,
        paddingHorizontal: 15,
        zIndex: 1,
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

    nameView: {
        marginVertical: 10,
        borderBottomWidth: 1.5,
        borderColor: '#28b2d6',
        width: Dimensions.get('screen').width * 0.5,
        alignSelf: 'center'
    },

    name: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 25,
        textAlign: 'center',  
    },

    label: {
        fontFamily: 'Montserrat',
        fontSize: 17,
        textAlign: 'center',
        width: Dimensions.get('screen').width * 0.8,
        marginVertical: 10
    },

    inputView: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        padding: 4,
        width: Dimensions.get('screen').width * 0.83,
        alignItems: 'center',
    },

    text: {
        alignSelf: 'center', 
        fontFamily: 'Montserrat', 
        fontSize: 17,
        textAlignVertical: 'center',
    },

    icons: {
        resizeMode: 'stretch',
        width: 40,
        height: 40,
    },

    btn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff9b4f',
        height: 45,
        width: 220,
        borderRadius: 7,
        paddingHorizontal: 10,
        marginVertical: 20,
        alignSelf: 'center',
        marginBottom: 20
    },

    btnText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        color: 'white'
    },

    inputTime: {
        flexDirection: 'row', 
        marginTop: 20, 
        marginBottom: 7, 
        padding: 3, 
        justifyContent: 'center', 
        alignItems: 'center'
    },

    timePicker: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        width: Dimensions.get('screen').width * 0.83,
        borderRadius: 5
    },

    timePickerText: {
        fontSize: 16,
        fontFamily: 'Montserrat',
    },
})