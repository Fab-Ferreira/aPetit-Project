import React, {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, Image, TouchableOpacity, Dimensions, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropsHeader from '../assets/PropsHeader';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { firebase, storage } from '../src/firebase.config';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { darkTheme, lightTheme } from '../src/theme';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddPetInfo({navigation}){

    const[petWeight, setPetWeight] = useState('');
    const[petImage, setPetImage] = useState('');
    const[showDatePicker, setShowDatePicker] = useState(false);
    const[date, setDate] = useState(new Date());
    const[theme, setTheme] = useState(lightTheme);

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
    
    useEffect(()=> {
        loadFirestore();
    },[]) 

    const loadFirestore = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();   
    
        setTheme(data.dark_theme? darkTheme : lightTheme);
    }    

    const addAnimal = () => {
        if(petWeight === '' || parseFloat(petWeight) <= 0){
            Alert.alert(
                'Peso inválido',
                'Por favor, preencha corretamente o campo "peso".',
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
        } else if (petImage === '') {
            Alert.alert(
                'Sem foto',
                'Coloque uma foto de seu pet.',
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
            navigation.navigate('SnackConfig');

            const savePetData = async() => {
                const firestore = getFirestore(firebase);
                const petDocRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));

                const data = {
                    petData: {
                        pet_name: await AsyncStorage.getItem('petNameData'),
                        birthdate: date.toLocaleDateString('pt-BR').toString(),
                        animal: selectedAnimalOption? 'Gato' : 'Cachorro',
                        image: petImage,
                        weight: parseFloat(petWeight)
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

                return updateDoc(petDocRef, data);
            }
            
            savePetData();
        }
    }

    async function requestGalleryPermission() {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Aviso!', 'Você necessita fornecer permissão para que a aPetit acesse sua galeria.');
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
                    
                    setPetImage(uri);
                }
            }
        } catch (error) {
            console.log(error);
        }
    } 

    const loadImage = () => {
        if(petImage === ''){
            return(
                <MaterialCommunityIcons name='camera-flip' color='#ff9b4f' size={60}/>
            )
        } else {
            return (
                <Image source={{uri: petImage}} style={styles.petImg}/>
            )
        }
    }

    const onChangeDate = ({type}, selectedDate) => {
        if(type == "set"){
            const currentDate = selectedDate;
            setDate(currentDate);
            setShowDatePicker(false);
        }
    }

    const cancelAction = async() => {
        Alert.alert(
            'Atenção!',
            'Você perderá os dados inseridos, deseja continuar?',
            [
                {
                    text: "Não",
                    style: 'cancel'
                },

                { 
                    text: "Sim",
                    onPress: ()=>{
                        navigation.navigate('AddPet')
                    }
                }
            ]
        )
    }
    
    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            <PropsHeader btnFunc={cancelAction} icon='arrow-left' bgColor={theme.headerColor}/>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <Text style={[styles.title, theme.color]}>{useRoute().params.petName}</Text>

                    <View style={[styles.petImgView, theme.borderColor]}>
                        {loadImage()}
                        <TouchableOpacity onPress={requestGalleryPermission} style={[styles.editPetPng, theme.borderColor]}>
                            <MaterialCommunityIcons name='pencil-outline' size={25} color='white'/>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.info}>
                        <MaterialCommunityIcons name='paw' size={25} color={theme.iconColor}/>
                        <Text style={[styles.textInfo, {marginLeft: 5}, theme.color]}>Animal: </Text>
                        <RadioForm formHorizontal={true} animation={true} style={{flex: 0.7}}>
                            {radioAnimalProps.map((obj, i) => (
                                <RadioButton labelHorizontal={true} key={i} style={styles.radioStyle}>
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

                    <View style={styles.info}>
                        <MaterialCommunityIcons name='calendar-minus' size={25} color={theme.iconColor}/>
                        <Text style={[styles.textInfo, {marginLeft: 5, flex: 0.78}, theme.color]}>Data de Nascimento:</Text>    
                    </View>

                    {showDatePicker && (
                        <DateTimePicker
                            mode='date'
                            display='spinner'
                            value={date} 
                            onChange={onChangeDate}
                            cancelable={true}
                            maximumDate={new Date()}
                        />
                    )}

                    <TouchableOpacity style={[styles.birthdateInput, theme.borderColor]} onPress={()=>setShowDatePicker(true)}>
                        <Text style={[styles.birthdateText, theme.color]}>{date.toLocaleDateString('pt-BR').toString()}</Text>
                    </TouchableOpacity> 
                
                    <View style={styles.sizeView}>
                        <Text style={[styles.textInfo, theme.color, 
                            {fontFamily: 'Montserrat-SemiBold', textAlign: 'center', marginTop: 20, marginBottom: 10}]}>Porte Físico do Animal</Text>
                        
                        <RadioForm formHorizontal={true} animation={true}>
                            {radioSizeProps.map((obj, i) => (
                                <RadioButton labelHorizontal={true} key={i} style={styles.radioStyle}>
                                    <RadioButtonInput
                                        obj={obj}
                                        index={i}
                                        isSelected={selectedSizeOption === i}
                                        onPress={()=>setSelectedSizeOption(i)}
                                        borderWidth={2}
                                        buttonInnerColor='#28b2d6'
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

                        <View style={styles.info}>
                            <MaterialCommunityIcons name='weight-kilogram' size={25} color={theme.iconColor}/>
                            <Text style={[styles.textInfo, {marginLeft: 5, flex: 0.25}, theme.color]}>Peso:</Text>
                            <TextInput
                                placeholder='Peso (em kg)'
                                keyboardType='decimal-pad'
                                style={[styles.textInput, theme.color]}
                                onChangeText={setPetWeight}
                                value={petWeight}
                                placeholderTextColor={theme.placeholder}
                                maxLength={3}/>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.addBtn} onPress={addAnimal}>
                        <Text style={styles.btnText}>Adicionar</Text>
                    </TouchableOpacity>
                </View> 
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    content: {
        flex: 1,
        alignItems: 'center'
    },

    title: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 23,
        marginTop: 20,
        marginBottom: 15
    },

    petImgView: {
        marginVertical: 10,
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

    info: {
        flexDirection: 'row',
        width: Dimensions.get('screen').width * 0.83,
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 15,
        marginBottom: 10
    },
    
    textInfo: {
        fontFamily: 'Montserrat',
        fontSize: 18,
        textAlignVertical: 'center'
    },

    textInput: {
        fontFamily: 'Montserrat',
        fontSize: 18,
        width: 160,
        textAlignVertical: 'center',
        flex: 0.75,
    },

    radioStyle: {
        margin: 10,
    },

    sizeView: {
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        width: Dimensions.get('screen').width * 0.9,
        borderColor: '#28b2d6',
        borderWidth: 3,
        borderRadius: 10,
        paddingVertical: 10,
        marginVertical: 13
    },

    addBtn: {
        flexDirection: 'row',
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

    birthdateInput: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        width: Dimensions.get('screen').width * 0.83,
        borderRadius: 5,
    },

    birthdateText: {
        fontSize: 16,
        fontFamily: 'Montserrat',
    },
})