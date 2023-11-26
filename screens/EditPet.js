import React, {useState, useEffect} from 'react';
import { 
    SafeAreaView, 
    View, 
    StyleSheet, 
    Text, 
    Dimensions, 
    TouchableOpacity, 
    TextInput, 
    Image, 
    ScrollView, 
    Alert, 
    ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropsHeader from '../assets/PropsHeader';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import * as ImagePicker from 'expo-image-picker';
import { firebase } from '../src/firebase.config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../src/theme';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../src/firebase.config';
import { format } from 'date-fns-tz';

export default function EditPet({navigation}){

    const[isLoaded, setIsLoaded] = useState(false);
    const[petName, setPetName] = useState('');
    const[petPicture, setPetPicture] = useState('');
    const[petWeight, setPetWeight] = useState('');
    const[snackAmount, setSnackAmount] = useState('');
    const[snackStorage, setSnackStorage] = useState('');
    const[snackIntervalType, setSnackIntervalType] = useState('');
    const[showBirthdate, setShowBirthdate] = useState(false);
    const[showExpirationDate, setShowExpirationDate] = useState(false);
    const[showInitialDate, setShowInitialDate] = useState(false);
    const[theme, setTheme] = useState(lightTheme);
    const[petBirthdate, setPetBirthdate] = useState(new Date());
    const[snackExpirationDate, setSnackExpirationDate] = useState(new Date());
    const[snackInitialDate, setSnackInitialDate] = useState(new Date());
    const[times, setTimes] = useState(undefined);
    const[period, setPeriod] = useState(undefined);

    const[selectedAnimalOption, setSelectedAnimalOption] = useState(0);
    const radioAnimalProps = [
        { label: 'Cachorro', value: 0 },
        { label: 'Gato', value: 1 }
    ]

    const[selectedSizeOption, setSelectedSizeOption] = useState(0);
    const radioSizeProps = [
        { label: 'Pequeno', value: 0 },
        { label: 'Médio', value: 1 },
        { label: 'Grande', value: 2 }
    ]

    useEffect(()=>{
        loadData();

        console.log(snackExpirationDate.toLocaleDateString()); 
    },[]);

    const loadData = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();

        setPetName(data.petData.pet_name);
        setPetPicture(data.petData.image);
        
        setPetWeight(data.petData.weight.toString());
        setSnackAmount(data.snackData.amount.toString());
        setSnackStorage(data.snackData.storage.toString());
        setSnackIntervalType(data.snackData.interval_type.toString());
        setTheme(data.dark_theme? darkTheme : lightTheme);
        setIsLoaded(true);

        const birthdateString = data.petData.birthdate;
        const [dayB, monthB, yearB] = birthdateString.split('/');
        setPetBirthdate(new Date(`${yearB}-${monthB}-${dayB}`));

        const expirationString = data.snackData.expiration_date;
        const [dayE, monthE, yearE] = expirationString.split('/');
        setSnackExpirationDate(new Date(`${yearE}-${monthE}-${dayE}`)); 

        const initialString = data.snackData.initial_date;
        const [dayI, monthI, yearI] = initialString.split('/');
        setSnackInitialDate(new Date(`${yearI}-${monthI}-${dayI}`)); 

        if(data.snackData.interval_type === 'Period'){
            setPeriod(data.snackData.period)
        } else {
            setTimes(data.snackData.times)
        }
    }

    const loadImage = () => {
        if(petPicture !== ''){
            return (
                <Image source={{uri: petPicture}} style={styles.petImg}/>
            )
        }
    }

    const updateData = () => {
        if(petName === '' || petWeight === '' || snackAmount === ''){
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
                'Aviso!',
                'Você tem certeza que deseja atualizar as informações do seu pet?',
                [
                    {
                        text: 'Não',
                        style: 'cancel'
                    },

                    {
                        text: 'Sim',
                        onPress: async()=>{
                            const firestore = getFirestore(firebase);
                            const petDocRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
                            const data = {
                                petData: {
                                    pet_name: petName,
                                    birthdate: petBirthdate.toLocaleDateString('pt-BR').toString(),
                                    animal: selectedAnimalOption? 'Gato' : 'Cachorro',
                                    image: petPicture,
                                    weight: parseFloat(petWeight),
                                },

                                snackData: {
                                    amount: parseInt(snackAmount),
                                    expiration_date: snackExpirationDate.toLocaleDateString('pt-BR').toString(),
                                    storage: parseInt(snackStorage),
                                    initial_date: snackInitialDate.toLocaleDateString('pt-BR').toString(),
                                    interval_type: snackIntervalType,
                                    ...(snackIntervalType === 'Custom_Time'? 
                                        {times: times} : {period: period})
                                }
                            }

                            switch(selectedSizeOption){
                                case 0:
                                    data.petData.size = 'Pequeno';
                                    break;
                                
                                case 1:
                                    data.petData.size = 'Médio';
                                    break;

                                case 2:
                                    data.petData.size = 'Grande';
                                    break;
                            }
                            await updateDoc(petDocRef, data);
                            navigation.navigate('LoadingScreen')
                        }
                    }
                ],
                {
                    cancelable: true
                }
            )
        }
    }

    async function requestGalleryPermission() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Você precisa conceder permissão para acessar a galeria.');
        }
        else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1
            });
      
            if (!result.canceled) {
                const url = result.assets[0].uri;
                const filename = 'petImage.jpg'
                const storageRef = ref(storage, `${await AsyncStorage.getItem('userID')}/${filename}`)
                
                const response = await fetch(url);
                const blob = await response.blob();
                await uploadBytes(storageRef, blob);

                const uri = await getDownloadURL(storageRef)
                
                setPetPicture(uri);
            }
        }
    } 

    const onChangeBirthdate = ({type}, selectedDate) => {
        if(type == "set"){
            const currentDate = selectedDate;
            setPetBirthdate(currentDate);
        }
        setShowBirthdate(false);
    }

    const onChangeInitialDate = ({type}, selectedDate) => {
        if(type == "set"){
            const currentDate = selectedDate;
            setSnackInitialDate(currentDate);
        }
        setShowInitialDate(false);
    }

    const onChangeExpirationDate = ({type}, selectedDate) => {
        if(type == "set"){
            const currentDate = selectedDate;
            setSnackExpirationDate(currentDate);
        }
        setShowExpirationDate(false);
    }

    const contentView = () => {
        return(
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={[styles.petImgView, theme.borderColor]}>
                        {loadImage()}
                        <TouchableOpacity onPress={requestGalleryPermission} style={[styles.editPetPng, theme.borderColor]}>
                            <MaterialCommunityIcons name='pencil-outline' size={25} color='white'/>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.info, theme.borderColor]}>
                        <MaterialCommunityIcons name='paw' size={25} color={theme.iconColor}/>
                        <Text style={[styles.text, theme.color]}>Nome:</Text>
                        <TextInput
                            style={[styles.textInput, theme.color]}
                            placeholder='Nome'
                            value={petName}
                            onChangeText={setPetName}
                            placeholderTextColor={theme.placeholder}/>
                    </View>

                    <View style={[styles.info, theme.borderColor]}>
                        <MaterialCommunityIcons name='weight-kilogram' size={25} color={theme.iconColor}/>
                        <Text style={[styles.text, theme.color]}>Peso (kg):</Text>
                        <TextInput
                            style={[styles.textInput, theme.color]}
                            placeholder='Peso'
                            value={petWeight}
                            onChangeText={setPetWeight}
                            keyboardType='decimal-pad'
                            placeholderTextColor={theme.placeholder}
                            maxLength={3}/>
                    </View>

                    
                    <View style={[styles.info, {borderBottomWidth: 0}]}>
                        <MaterialCommunityIcons name='calendar-heart' size={25} color={theme.iconColor}/>
                        <Text style={[styles.text, theme.color]}>Nascimento:</Text>
                    </View>
                    <TouchableOpacity style={[styles.birthdateInput, theme.borderColor]} onPress={()=>setShowBirthdate(true)}>
                        <Text style={[styles.birthdateText, theme.color]}>{petBirthdate.toLocaleDateString('pt-BR').toString()}</Text>
                    </TouchableOpacity> 

                    <View style={styles.radioView}>
                        <View style={{flex: 0.5, justifyContent: 'center'}}>
                            <Text style={[styles.text, theme.color, {height: 'auto', marginBottom: 10, fontFamily: 'Montserrat-SemiBold'}]}>Animal:</Text>
                            <View style={{flexDirection: 'row'}}>
                                <RadioForm formHorizontal={true} animation={true}>
                                    {radioAnimalProps.map((obj, i) => (
                                        <RadioButton labelHorizontal={true} key={i} style={{marginHorizontal: 10}}>
                                            <RadioButtonInput
                                                obj={obj}
                                                index={i}
                                                isSelected={selectedAnimalOption === i}
                                                onPress={()=>setSelectedAnimalOption(i)}
                                                borderWidth={2}
                                                buttonInnerColor='#ff9b4f'
                                                buttonOuterColor={theme.iconColor}
                                                buttonSize={14}
                                                iconInnerSize={5}/>
                                            <RadioButtonLabel
                                                obj={obj}
                                                index={i}
                                                labelHorizontal={false}
                                                onPress={()=>setSelectedAnimalOption(i)}
                                                labelStyle={[{fontFamily: 'Montserrat', marginLeft: 5, fontSize: 15}, theme.color]}/>
                                        </RadioButton>
                                    ))}
                                </RadioForm>
                            </View>
                        </View>
                        <View style={{flex: 0.5, justifyContent: 'center'}}>
                            <Text style={[styles.text, theme.color, {height: 'auto', marginBottom: 10, fontFamily: 'Montserrat-SemiBold'}]}>Porte Físico:</Text>
                            <RadioForm formHorizontal={true} animation={true}>
                                {radioSizeProps.map((obj, i) => (
                                    <RadioButton labelHorizontal={true} key={i} style={{marginHorizontal: 5}}>
                                        <RadioButtonInput
                                            obj={obj}
                                            index={i}
                                            isSelected={selectedSizeOption === i}
                                            onPress={()=>setSelectedSizeOption(i)}
                                            borderWidth={2}
                                            buttonInnerColor='#ff9b4f'
                                            buttonOuterColor={theme.iconColor}
                                            buttonSize={14}
                                            iconInnerSize={5}/>
                                        <RadioButtonLabel
                                            obj={obj}
                                            index={i}
                                            labelHorizontal={false}
                                            onPress={()=>setSelectedSizeOption(i)}
                                            labelStyle={[{fontFamily: 'Montserrat', marginLeft: 5, fontSize: 15}, theme.color]}/>
                                    </RadioButton>
                                ))}
                            </RadioForm>
                        </View>
                    </View>
                    <View style={styles.snackView}>
                        <Text style={[styles.title, theme.color]}>Refeição</Text>
                        <View style={[styles.info, theme.borderColor]}>
                            <MaterialCommunityIcons name='food-drumstick' size={25} color={theme.iconColor}/>
                            <Text style={[styles.text, theme.color]}>Quantidade (g):</Text>
                            <TextInput
                                style={[styles.textInput, theme.color]}
                                placeholder='gramas'
                                value={snackAmount}
                                onChangeText={setSnackAmount}
                                keyboardType='number-pad'
                                maxLength={3}
                                placeholderTextColor={theme.placeholder}/>
                        </View>
                        <View style={[styles.info, theme.borderColor]}>
                            <MaterialCommunityIcons name='weight-kilogram' size={25} color={theme.iconColor}/>
                            <Text style={[styles.text, theme.color]}>Estoque (kg):</Text>
                            <TextInput
                                style={[styles.textInput, theme.color]}
                                placeholder='quilos'
                                value={snackStorage}
                                onChangeText={setSnackStorage}
                                keyboardType='number-pad'
                                maxLength={2}
                                placeholderTextColor={theme.placeholder}/>
                        </View>
                        <View style={[styles.info, {borderBottomWidth: 0}]}>
                            <MaterialCommunityIcons name='calendar' size={25} color={theme.iconColor}/>
                            <Text style={[styles.text, theme.color]}>Reabastecimento:</Text>
                        </View>
                        <TouchableOpacity style={[styles.birthdateInput, theme.borderColor]} onPress={()=>setShowInitialDate(true)}>
                            <Text style={[styles.birthdateText, theme.color]}>{snackInitialDate.toLocaleDateString().toString()}</Text>
                        </TouchableOpacity>

                        <View style={[styles.info, {borderBottomWidth: 0}]}>
                            <MaterialCommunityIcons name='calendar-alert' size={25} color={theme.iconColor}/>
                            <Text style={[styles.text, theme.color]}>Validade:</Text>
                        </View>
                        <TouchableOpacity style={[styles.birthdateInput, theme.borderColor]} onPress={()=>setShowExpirationDate(true)}>
                            <Text style={[styles.birthdateText, theme.color]}>{snackInitialDate.toLocaleDateString().toString()}</Text>
                        </TouchableOpacity>

                        {showBirthdate && (
                            <DateTimePicker
                                mode='date'
                                display='spinner'
                                value={petBirthdate}
                                onChange={onChangeBirthdate}
                                cancelable={true}
                                maximumDate={new Date()}
                            />
                        )}

                        {showInitialDate && (
                            <DateTimePicker
                                mode='date'
                                display='spinner'
                                value={snackInitialDate}
                                onChange={onChangeInitialDate}
                                cancelable={true}
                                maximumDate={new Date()}
                            />
                        )}

                        {showExpirationDate && (
                            <DateTimePicker
                                mode='date'
                                display='spinner'
                                value={snackExpirationDate}
                                onChange={onChangeExpirationDate}
                                minimumDate={new Date()}
                                cancelable={true}
                            />
                        )}
                    </View>
                    <TouchableOpacity onPress={updateData} style={styles.saveBtn}>
                        <Text style={styles.saveBtnText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }

    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            <PropsHeader btnFunc={()=>Alert.alert(
                'Atenção!',
                'Caso você tenha editado alguma informação, você perderá todos os dados inseridos. Deseja voltar para a tela de início?',
                [
                    {
                        text: 'Não',
                        style: 'cancel'
                    },

                    {
                        text: 'Sim',
                        onPress: ()=>navigation.navigate('Home')
                    }
                ],
                {
                    cancelable: true,
                }
            )} icon='arrow-left' bgColor={theme.headerColor}/>

            {isLoaded? (contentView()) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#28b2d6" /> 
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },

    title: {
        fontSize: 22,
        fontFamily: 'Montserrat-SemiBold',
        alignSelf: 'center'
    },
    
    info: {
        width: Dimensions.get('screen').width * 0.75,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        marginVertical: 11,
    },

    text: {
        fontFamily: 'Montserrat',
        fontSize: 17,
        textAlignVertical: 'center',
        textAlign: 'center',
        height: '100%',
        marginHorizontal: 10
    },

    textInput: {
        fontFamily: 'Montserrat',
        fontSize: 17,
        textAlignVertical: 'center',
        height: '100%',
        flex: 1
    },

    petImgView: {
        marginTop: 20,
        marginBottom: 10,
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 2,
    },

    petImg: {
        width: 136,
        height: 136,
        resizeMode: 'stretch',
        borderRadius: 100,
    },

    editPetPng: {
        backgroundColor: '#28b2d6',
        height: 40,
        width: 40,
        position: 'absolute',
        zIndex: 1,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 2
    },

    birthdateInput: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        width: Dimensions.get('screen').width * 0.75,
        borderRadius: 5,
        marginBottom: 10,
    },

    birthdateText: {
        fontSize: 16,
        fontFamily: 'Montserrat',
    },

    saveBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ff9b4f',
        height: 45,
        width: 220,
        borderRadius: 7,
        paddingHorizontal: 10,
        marginBottom: 20
    },

    saveBtnText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 18,
        color: 'white'
    },

    radioView: {
        borderWidth: 2,
        borderColor: '#ff9b4f',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 7,
        marginTop: 20,
        height: 210,
        width: Dimensions.get('screen').width * 0.9
    },

    snackView: {
        borderWidth: 2,
        borderColor: '#28b2d6',
        justifyContent: 'center',
        padding: 20,
        borderRadius: 7,
        marginVertical: 20,
        width: Dimensions.get('screen').width * 0.9
    }
})