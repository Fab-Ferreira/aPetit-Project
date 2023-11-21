import React, {useEffect, useState} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Dimensions, Alert, SafeAreaView, ActivityIndicator, ScrollView } from 'react-native';
import PropsFooter from '../assets/PropsFooter';
import PropsHeader from '../assets/PropsHeader';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { lightTheme, darkTheme } from '../src/theme';
import { firebase } from '../src/firebase.config';
import { getDoc, getFirestore, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

LocaleConfig.locales['pt-BR'] = {
    monthNames: [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ],
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom.', 'Seg.', 'Ter.', 'Qua.', 'Qui.', 'Sex.', 'Sáb.'] 
}

LocaleConfig.defaultLocale = 'pt-BR';

export default function Planner({navigation}){

    const[theme, setTheme] = useState(lightTheme);
    const[isLoaded, setIsLoaded] = useState(false);
    const[pet, setPet] = useState(undefined);
    const[snack, setSnack] = useState(undefined);
    const[expirationDate, setExpirationDate] = useState('');
    const[selectedDate, setSelectedDate] = useState('');
    const[showDateModal, setShowDateModal] = useState(false);
    const[predictionDate, setPredictionDate] = useState('');
    const[initialDate, setInitialDate] = useState('');

    useEffect(()=>{
        loadFirestore(); 
    },[]);

    const loadFirestore = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();   

        if(data.pet_registered === true) { 
            const date = data.snackData.expiration_date.split('/');
            const initialDateArray = data.snackData.initial_date.split('/');
            setInitialDate(`${initialDateArray[2]}-${initialDateArray[1]}-${initialDateArray[0]}`);
            const amount = data.snackData.amount;
            const snackStorage = data.snackData.storage;
            const intervalType = data.snackData.interval_type;
            setExpirationDate(`${date[2]}-${date[1]}-${date[0]}`);

            if(intervalType === 'Period'){
                const period = data.snackData.period;
                const predictionDays = parseInt(((snackStorage * 1000) / (amount / period)) / 24);
                
                const originalDate = new Date(`${initialDateArray[2]}-${initialDateArray[1]}-${initialDateArray[0]}`);
                const newDate = new Date(originalDate);
                newDate.setDate(newDate.getDate() + predictionDays + 1);
                const predictDate = newDate.toLocaleDateString('pt-BR').split('/');

                setPredictionDate(`${predictDate[2]}-${predictDate[1]}-${predictDate[0]}`);
            }
            else if(intervalType === 'Custom_Time'){
                const length = data.snackData.times.length;
                const predictionDays = parseInt((snackStorage * 1000) / (amount * length));

                const originalDate = new Date(`${initialDateArray[2]}-${initialDateArray[1]}-${initialDateArray[0]}`);
                const newDate = new Date(originalDate);
                newDate.setDate(newDate.getDate() + predictionDays + 1);
                const predictDate = newDate.toLocaleDateString('pt-BR').split('/');

                setPredictionDate(`${predictDate[2]}-${predictDate[1]}-${predictDate[0]}`);
                console.log(predictDate)
            }
        }

        setTheme(data.dark_theme? darkTheme : lightTheme);
        setIsLoaded(true); 
    }    

    const customDates = {
        [expirationDate]: {
            marked: true, 
            dotColor: '#97562C', 
            activeOpacity: 0,
        },

        [predictionDate]: {
            marked: true, 
            dotColor: '#e61919', 
            activeOpacity: 0,
            endingDay: true,
        }
    };

    const calendarMonthNames = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto', 
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro'
    ]
    
    const contentView = () => {
        return(
            <View style={styles.calendarView}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={[styles.title, theme.color]}>Acompanhe o relatório mensal de seu Pet</Text>
                    <Calendar
                        renderHeader={(date)=>(
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center' }}>
                                <Text style={[{ fontSize: 21, marginHorizontal: 5 }, theme.color]}>{calendarMonthNames[date.getMonth()]}</Text>
                                <Text style={[{ fontSize: 21, marginHorizontal: 5 }, theme.color]}>{date.getFullYear()}</Text>
                            </View>
                        )}
                        
                        enableSwipeMonths={true}
                        hideExtraDays={true}
                        theme={{
                            calendarBackground: theme.headerColor,
                            todayTextColor: '#ff9b4f',
                            arrowColor: '#ff9b4f',
                            textDayFontSize: 19,
                            textDayHeaderFontSize: 19,
                            dayTextColor: theme.iconColor
                        }}
                        
                        hideDayNames={true}
                        markedDates={customDates}
                        //onDayPress={handleDay}
                        style={[{borderTopWidth: 2, borderBottomWidth: 2}, theme.borderColor]}/>
                    <View style={[styles.legendView, theme.borderColor]}>
                        <Text style={[styles.legendTitle, theme.color]}>Legenda</Text>
                        <View style={styles.legend}>
                            <MaterialCommunityIcons name='numeric-10-circle-outline' color='#ff9b4f' size={22}/>
                            <Text style={[styles.legentText, theme.color]}>Dia atual</Text>
                        </View>
                        <View style={styles.legend}>
                            <MaterialCommunityIcons name='circle' color='#97562C' size={22}/>
                            <Text style={[styles.legentText, theme.color]}>Data de Validade da Ração</Text>
                        </View>
                        <View style={styles.legend}>
                            <MaterialCommunityIcons name='circle' color='#e61919' size={22}/>
                            <Text style={[styles.legentText, theme.color]}>Previsão para o fim da ração</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    }

    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            <PropsHeader btnFunc={()=>navigation.navigate('EditProfile')} icon='cog' bgColor={theme.headerColor}/>

            {isLoaded? (contentView()) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#28b2d6" /> 
                </View>
            )}
            
            <View style={[styles.footer, theme.footerColor]}>
                <PropsFooter function={()=>navigation.navigate('Home')} iconName='home' txt='Início' iconColor='#28b2d6' fontColor={theme.footerTxtColor}/>
                <PropsFooter function={()=>navigation.navigate('Alimentation')} iconName='food-drumstick' txt='Alimentar' iconColor='#28b2d6' fontColor={theme.footerTxtColor}/>
                <PropsFooter function={()=>navigation.navigate('Connection')} iconName='bluetooth-audio' txt='Conexão' iconColor='#28b2d6' fontColor={theme.footerTxtColor}/>
                <PropsFooter function={()=>navigation.navigate('Planner')} iconName='calendar-month' txt='Calendário' iconColor='#ff9b4f' fontColor={theme.footerTxtColor}/>
            </View>

            <Modal visible={showDateModal} transparent={true} animationType='slide'>
                <View style={styles.modalContainer}>
                    <View style={styles.modalBackground}/>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, theme.color]}>{selectedDate}</Text>
                        <TouchableOpacity onPress={()=>setShowDateModal(false)} style={styles.exitBtn}>
                            <Text style={[styles.exitBtnText, theme.color]}>Voltar</Text>
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
    },

    title: {
        marginVertical: 40,
        textAlign: 'center',
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 21,
        width: Dimensions.get('screen').width * 0.85,
        alignSelf: 'center'
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

    calendarView: {
        flex: 1,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    modalBackground: {
        backgroundColor: 'black',
        opacity: 0.7,
        flex: 1,
    },

    modalContent: {
        backgroundColor: '#fff',
        width: Dimensions.get('screen').width * 0.85,
        height: Dimensions.get('screen').height * 0.85,
        position: 'absolute',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 15
    },

    modalTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18
    },

    exitBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: 150,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#28b2d6'
    },

    exitBtnText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 16,
        color: '#28b2d6'
    },

    legendView: {
        borderWidth: 2,
        width: Dimensions.get('screen').width * 0.9,
        borderRadius: 7,
        padding: 10,
        alignSelf: 'center',
        alignItems: 'center',
        marginVertical: 20
    },

    legend: {
        flexDirection: 'row',
        width: '90%',
        marginVertical: 5,
        alignItems: 'center'
    },

    legentText: {
        fontFamily: 'Montserrat',
        fontSize: 16,
        marginLeft: 10
    },

    legendTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 20,
        alignSelf: 'center',
        marginBottom: 10
    }
})