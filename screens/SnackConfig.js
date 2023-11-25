import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropsHeader from '../assets/PropsHeader';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase } from '../src/firebase.config';
import { getFirestore, updateDoc, doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../src/theme';

export default function SnackConfig({navigation}){

    const[amount, setAmount] = useState('');
    const[storage, setStorage] = useState('');
    const[period, setPeriod] = useState('');
    const[theme, setTheme] = useState(lightTheme);
    const[times, setTimes] = useState([]);
    const[date, setDate] = useState(new Date());
    const[time, setTime] = useState(new Date());
    const[showDatePicker, setShowDatePicker] = useState(false);
    const[showTimePicker, setShowTimePicker] = useState(false);
    const[initialDate, setInitialDate] = useState('');

    const[selectedIntervalOption, setSelectedIntervalOption] = useState(0);
    const radioIntervalProps = [
        { label: 'Período', value: 0 },
        { label: 'Definir horários', value: 1 }
    ]

    const[selectedTimeOption, setSelectedTimeOption] = useState(0);
    const radioTimeProps = [
        { label: 'Minutos', value: 0 },
        { label: 'Horas', value: 1 }
    ]

    useEffect(()=> {
        loadFirestore();
        const actualDate = new Date();
        setInitialDate(actualDate.toLocaleDateString('pt-BR').toString());
    },[])

    const loadFirestore = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();   
    
        setTheme(data.dark_theme? darkTheme : lightTheme);
    }    

    const snackInterval = () => {
        if(!selectedIntervalOption) {
            return(
                <View>
                    <View style={[styles.info, theme.borderColor, {borderBottomWidth: 1}]}>
                        <Text style={[styles.textInfo, theme.color]}>Intervalo de tempo: </Text>
                        <TextInput
                            style={[styles.inputTextInfo, theme.color, theme.borderColor]}
                            value={period}
                            onChangeText={setPeriod}
                            placeholder='Intervalo'
                            keyboardType='number-pad'
                            placeholderTextColor={theme.placeholder}
                            maxLength={3}/>
                        
                    </View>
                    <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                        {radioTimeProps.map((obj, i)=>(
                            <RadioButton labelHorizontal={true} key={i} style={{margin: 10}}>
                                <RadioButtonInput
                                    obj={obj}
                                    index={i}
                                    isSelected={selectedTimeOption === i}
                                    onPress={()=>setSelectedTimeOption(i)}
                                    borderWidth={2}
                                    buttonInnerColor='#28b2d6'
                                    buttonOuterColor={theme.iconColor}
                                    buttonSize={14}
                                    iconInnerSize={5}/>
                                <RadioButtonLabel
                                    obj={obj}
                                    index={i}
                                    labelHorizontal={false}
                                    onPress={()=>setSelectedTimeOption(i)}
                                    labelStyle={[{fontFamily: 'Montserrat', marginLeft: 5, fontSize: 15}, theme.color]}/>
                            </RadioButton>
                        ))}
                    </View>
                </View>
            )
        }
        else {
            return(
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <View style={[styles.info, {flex: 1, alignSelf: 'center', justifyContent: 'center'}]}>
                        {showTimePicker && (
                            <DateTimePicker
                                mode='time'
                                display='spinner'
                                value={time}
                                is24Hour={true}
                                onChange={onChangeTime}/>
                        )}
                
                        <TouchableOpacity style={styles.plus} onPress={()=>setShowTimePicker(true)}>
                            <MaterialCommunityIcons name='plus' size={22} color='white'/>
                        </TouchableOpacity>

                        <Text style={[styles.textInfo, theme.color]}>Horas:</Text>
                    </View>
                    {times.length > 0 && (
                        <View style={[styles.times, theme.borderColor]}>
                            {times.map((item, index) => (
                                <View key={index} style={{flexDirection: 'row', alignItems: 'center', marginVertical: 5, justifyContent: 'center'}}>
                                    <Text style={[styles.textInfo, theme.color]}>{item}</Text>
                                    <TouchableOpacity style={styles.deleteTimeBtn} onPress={()=>{
                                        const newItems = times.filter((_, i) => i !== index);
                                        setTimes(newItems);
                                    }}>
                                        <MaterialCommunityIcons name='delete' size={13} color='white'/>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )
        }
    }

    const warning = () => {
        Alert.alert(
            'Valor(es) vazio(s)',
            'Por favor, preencha todos os campos corretamente.',
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

    const validadeSnack = () => {
        switch(selectedIntervalOption){
            case 0:
                if(amount === '' || storage === '' || period === '' || parseInt(amount) <= 0 || parseInt(period) <= 0 || parseInt(storage) <= 0){ warning() }
                else { addSnack() }
                break;

            case 1:
                if(amount === '' || storage === '' || times.length === 0 || parseInt(amount) <= 0 || parseInt(storage) <= 0){ {warning() }
                }
                else { addSnack() }
                break;
        }
    }

    const addSnack = async() => {
        const firestore = getFirestore(firebase);
        const user = await AsyncStorage.getItem('userID');
        const snackDocRef = doc(firestore, 'users', user);

        const data = {
            snackData: {
                amount: parseInt(amount),
                expiration_date: date.toLocaleDateString('pt-BR').toString(),
                initial_date: initialDate,
                interval_type: selectedIntervalOption? 'Custom_Time' : 'Period',
                storage: parseInt(storage),
                ...(selectedIntervalOption? 
                    {times: 
                        times.map((item) => (
                            item
                        ))
                    } : {period: selectedTimeOption? parseInt(period) * 60 : parseInt(period)})
            },

            pet_registered: true,
        }

        
        await updateDoc(snackDocRef, data)

        navigation.navigate('LoadingScreen')
    }

    const onChangeDate = ({type}, selectedDate) => {
        if(type == "set"){
            const currentDate = selectedDate;
            setDate(currentDate);
        }
        setShowDatePicker(false);
    }
    
    const onChangeTime = ({type}, selectedTime) => {
        if(type == "set"){
            const currentTime = selectedTime;
            setTime(currentTime);

            const fixedHours = currentTime.getHours();
            const fixedMinutes = currentTime.getMinutes();
            const formattedHours = (fixedHours < 10) ? `0${fixedHours}` : `${fixedHours}`;
            const formattedMinutes = (fixedMinutes < 10) ? `0${fixedMinutes}` : `${fixedMinutes}`;
            const fixedTime = `${formattedHours}:${formattedMinutes}`;

            setTimes([...times, fixedTime.toString()]);
        }
        setShowTimePicker(false);
    }

    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            <PropsHeader btnFunc={()=>navigation.goBack()} icon='arrow-left' bgColor={theme.headerColor}/>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{alignItems: 'center'}}>
            <Text style={[styles.title, theme.color]}>Refeição</Text>
            <View style={[styles.info, {borderBottomWidth: 1}, theme.borderColor]}>
                <MaterialCommunityIcons name='food-drumstick' size={25} color={theme.iconColor}/>
                <Text style={[styles.textInfo, {marginLeft: 5}, theme.color]}>Quantidade (g): </Text>
                <TextInput
                    style={[styles.inputTextInfo, theme.color]}
                    placeholder='em gramas'
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType='number-pad'
                    placeholderTextColor={theme.placeholder}
                    maxLength={3}/>
            </View>

            <View style={[styles.info, {marginBottom: 20, borderBottomWidth: 1}, theme.borderColor]}>
                <MaterialCommunityIcons name='weight-kilogram' size={25} color={theme.iconColor}/>
                <Text style={[styles.textInfo, {marginLeft: 5}, theme.color]}>Estoque (kg): </Text>
                <TextInput
                    style={[styles.inputTextInfo, theme.color, theme.borderColor]}
                    placeholder='em quilos'
                    value={storage}
                    onChangeText={setStorage}
                    keyboardType='number-pad'
                    placeholderTextColor={theme.placeholder}
                    maxLength={2}/>
            </View>

            <View style={styles.expirationDateView}>
                {showDatePicker && (
                    <DateTimePicker
                        mode='date'
                        display='calendar'
                        value={date}
                        onChange={onChangeDate}
                        cancelable={true}
                        minimumDate={new Date()}/> 
                )}

                <View style={styles.expirationDateTitle}>
                    <MaterialCommunityIcons name='calendar-alert' size={25} color={theme.iconColor}/>
                    <Text style={[styles.textInfo, {marginLeft: 5}, theme.color]}>Definir data de validade:</Text>
                </View>
                <TouchableOpacity style={[styles.expirationDateInput, theme.borderColor]} onPress={()=>setShowDatePicker(true)}>
                    <Text style={[styles.expirationDateInputText, theme.color]}>{date.toLocaleDateString('pt-BR').toString()}</Text>
                </TouchableOpacity> 
            </View>
            
            <View style={styles.interval}>
                <Text style={[styles.textInfo, {fontFamily: 'Montserrat-SemiBold'}, theme.color]}>Intervalo por refeição</Text>
                <RadioForm formHorizontal={true} animation={true} style={{flex: 0.7, marginVertical: 10}}>
                    {radioIntervalProps.map((obj, i) => (
                        <RadioButton labelHorizontal={true} key={i} style={{margin: 10}}>
                            <RadioButtonInput
                                obj={obj}
                                index={i}
                                isSelected={selectedIntervalOption === i}
                                onPress={()=>setSelectedIntervalOption(i)}
                                borderWidth={2}
                                buttonInnerColor='#28b2d6'
                                buttonOuterColor={theme.iconColor}
                                buttonSize={14}
                                iconInnerSize={5}/>
                            <RadioButtonLabel
                                obj={obj}
                                index={i}
                                labelHorizontal={false}
                                onPress={()=>setSelectedIntervalOption(i)}
                                labelStyle={[{fontFamily: 'Montserrat', marginLeft: 5, fontSize: 15}, theme.color]}/>
                        </RadioButton>
                    ))}
                </RadioForm>

                {snackInterval()}
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={validadeSnack}> 
                <Text style={styles.btnText}>Confirmar</Text>
            </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    title: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 23,
        marginBottom: 10,
        marginTop: 20
    },
    
    info: {
        flexDirection: 'row',
        width: Dimensions.get('screen').width * 0.8,
        alignItems: 'center',
        height: 50,
        marginVertical: 10
    },

    textInfo: {
        fontFamily: 'Montserrat',
        fontSize: 18,
        textAlignVertical: 'center',
        width: 'auto'
    },

    inputTextInfo: {
        fontFamily: 'Montserrat',
        fontSize: 18,
        textAlignVertical: 'center',
        width: 120,
        paddingVertical: 3,
        marginLeft: 10,
    },

    expirationDateView: {
        height: 70,
        justifyContent: 'space-between',
        width: Dimensions.get('screen').width * 0.8,
    },

    expirationDateTitle: {
        flexDirection: 'row'
    },

    expirationDateInput: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        width: '100%',
        borderRadius: 5
    },

    expirationDateInputText: {
        fontSize: 16,
        fontFamily: 'Montserrat',
    },

    time: {
        borderBottomWidth: 1,
        fontFamily: 'Montserrat',
        fontSize: 18,
        width: 50,
        textAlign: 'center'
    },

    interval: {
        borderWidth: 3,
        borderRadius: 10,
        padding: 10,
        marginVertical: 35,
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        borderColor: '#28b2d6',
    },

    confirmBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff9b4f',
        height: 45,
        width: 220,
        borderRadius: 7,
        paddingHorizontal: 10,
        marginBottom: 20
    },

    btnText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        color: 'white'
    },

    plus: {
        width: 28,
        height: 28,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        backgroundColor: '#28b2d6'
    },

    times: {
        borderWidth: 1,
        flex: 1,
        borderRadius: 10,
        padding: 10,
        justifyContent: 'space-between'
    },

    deleteTimeBtn: {
        backgroundColor: '#ff9b4f',
        borderRadius: 30,
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10
    }
})