import { useState, useEffect, useCallback } from 'react';
import { 
    ActivityIndicator, 
    View, 
    StyleSheet, 
    Text, 
    Modal, 
    TouchableOpacity, 
    Image, 
    Dimensions, 
    ScrollView, 
    TextInput, 
    Alert, 
    Switch, 
    SafeAreaView, 
    BackHandler
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import PropsHeader from '../assets/PropsHeader';
import { signOut, updatePassword } from 'firebase/auth';
import { auth, firebase } from '../src/firebase.config';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, updateDoc, doc, getDoc } from 'firebase/firestore';
import { lightTheme, darkTheme } from '../src/theme';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../src/firebase.config';
import { getDownloadURL, uploadBytes, ref } from 'firebase/storage';

export default function EditProfile({navigation}){

    const iconSize = 28;
    const[isLoaded, setIsLoaded] = useState(false);

    const[userImage, setUserImage] = useState('');
    const[userName, setUserName] = useState('');
    const[userEmail, setUserEmail] = useState('');
    const[newPasswd, setNewPasswd] = useState('');
    const[newRePasswd, setNewRePasswd] = useState('');
    const[seePassword, setSeePassword] = useState(false);
    const[theme, setTheme] = useState(lightTheme);

    const[showModal, setShowModal] = useState(false);
    const[darkMode, setDarkMode] = useState(false);
    const isButtonEnabled = newPasswd.length >= 6 && newRePasswd.length >= 6;

    useEffect(()=>{
        loadUserData();
    },[]);

    const loadUserData = async() => {
        const firestore = getFirestore(firebase);
        const docRef = doc(firestore, 'users', await AsyncStorage.getItem('userID'));
        const docSnapshot = await getDoc(docRef);
        const data = docSnapshot.data();

        setUserName(data.userData.name);
        setUserEmail(data.userData.email);
        setUserImage(data.userData.image);
 
        const newMode = data.dark_theme;
        setDarkMode(newMode); 

        setTheme(newMode? darkTheme : lightTheme);
        setIsLoaded(true);
    }

    const disconnectAlert = () => {
        Alert.alert(
            "Deseja sair?", 
            "Você tem certeza que deseja desconectar de sua conta?",
            [
                {
                    text: 'Não',
                    style: 'cancel'
                },
                {
                    text: 'Sim',
                    onPress: ()=>{
                        signOut(auth)
                        .then(()=> {
                            AsyncStorage.clear()
                            .then(()=>{
                                navigation.navigate('Access')
                            })
                            .catch(error=>{
                                console.log('Erro:', error)
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
        )
    }

    const loadImage = () => {
        if(userImage === undefined){
            return(
                <MaterialCommunityIcons name='camera-flip' color='#ff9b4f' size={60}/>
            )
        } else {
            return (
                <Image source={{uri: userImage}} style={styles.userImg}/>
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
                const filename = 'userImage.jpg'
                const storageRef = ref(storage, `${await AsyncStorage.getItem('userID')}/${filename}`)
                
                const response = await fetch(url);
                const blob = await response.blob();
                await uploadBytes(storageRef, blob);

                const uri = await getDownloadURL(storageRef)
                
                setUserImage(uri);
            }
        }
    } 

    const switchState = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        setTheme(newMode? darkTheme : lightTheme);
    }

    const saveData = async() => {
        if(userName === '' || userEmail === ''){
            Alert.alert('Campos vazios!', 'Por favor, preenchar todos campos para salvar os dados.')
        } else {
            const firestore = getFirestore(firebase);
            const id = await AsyncStorage.getItem('userID');
            const userDocRef = doc(firestore, 'users', id);
            
            const data = {
                userData: {
                    id: id,
                    name: userName,
                    email: userEmail,
                    ...(userImage !== undefined? 
                        {image: userImage} : {})
                },

                dark_theme: darkMode
            }

            await updateDoc(userDocRef, data);
            navigation.navigate('LoadingScreen');
        }        
    }

    const setNewPassword = () => {
        if(newPasswd !== newRePasswd){
            Alert.alert('Erro nas senhas', 'As senhas não se coincidem!')
        }
        else{
            Alert.alert(
                'Aviso',
                'Você tem certeza que deseja alterar a senha da sua conta?',
                [
                    {
                        text: 'Não',
                        style: 'cancel'
                    },

                    {
                        text: 'Sim',
                        onPress: ()=>{  
                            const user = auth.currentUser;
                            
                            updatePassword(user, newPasswd)
                            .then(()=>{
                                Alert.alert('Senha alterada!', 'Sua senha foi alterada com sucesso!');
                                setShowModal(false);
                            })
                            .catch((error)=>{
                                Alert.alert('Erro!', 'Houve um problema ao tentar alterar sua senha, tente novamente.');
                            })
                            .catch((error)=>{
                                console.log(error.message)
                            })
                        }
                    }
                ],

                {
                    cancelable: false
                }
            )
        }
    }

    const backAction = () => {
        Alert.alert(
            'Aviso!',
            'Caso você tenha editado alguma informação, você perderá todos os dados inseridos. Deseja sair dessa página?',
            [
                {
                    text: 'Não',
                    style: 'cancel'
                },

                {
                    text: 'Sim',
                    onPress: ()=>navigation.goBack()
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

    const contentView = () => {
        return(
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{justifyContent: 'center', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <View style={[styles.userImgView, theme.borderColor]}>
                        {loadImage()}
                        <TouchableOpacity onPress={requestGalleryPermission} style={[styles.editUserPng, theme.borderColor]}>
                            <MaterialCommunityIcons name='pencil-outline' size={25} color='white'/>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.configs, theme.borderColor]}>
                        <MaterialCommunityIcons name='account' size={iconSize} color={theme.iconColor} style={styles.iconConfigs}/>
                        <Text style={[styles.text, theme.color]}>Nome: </Text>
                        <TextInput
                            style={[styles.inputText, theme.color]}
                            value={userName}
                            onChangeText={setUserName}
                            placeholder='Nome'/>
                    </View>

                    <View style={[styles.configs, {borderBottomWidth: 0}]}>
                        <MaterialCommunityIcons name='at' size={iconSize} color={theme.iconColor} style={styles.iconConfigs}/>
                        <Text style={[styles.text, {flex: 1}, theme.color]}>{`E-mail:  ${userEmail}`}</Text>
                    </View>

                    <TouchableOpacity onPress={()=>setShowModal(true)} style={styles.modifyPsBtn}>
                        <MaterialCommunityIcons name='shield-edit-outline' size={iconSize} color='#ff9b4f' style={styles.iconConfigs}/>
                        <Text style={styles.modifyPsTxt}>Modificar Senha</Text>
                    </TouchableOpacity>

                    <View style={styles.switch}>
                        <MaterialCommunityIcons name={theme.iconNameTheme} color={theme.iconColorTheme} size={25}/>
                        <Text style={[styles.darkModeText, theme.color]}>Modo noturno</Text>
                        <Switch
                            trackColor={{
                                true: '#28b2d6',
                                false: '#ff9b4f'
                            }}
                            thumbColor='white'
                            value={darkMode}
                            onValueChange={switchState}>
                        </Switch>
                    </View>

                    <TouchableOpacity onPress={saveData} style={[styles.saveButton, {backgroundColor: '#ff9b4f'}]}>
                        <MaterialCommunityIcons name='content-save' size={25} color='#fff'/>
                        <Text style={[styles.btnText, {color: 'white'}]}>Salvar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={disconnectAlert} style={styles.leftButton}>
                        <MaterialCommunityIcons name='exit-to-app' size={25} color='#28b2d6'/>
                        <Text style={[styles.btnText, {color: '#28b2d6'}]}>Desconectar</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }

    return(
        <SafeAreaView style={[styles.container, theme.backgroundColor]}>
            <PropsHeader
                bgColor={theme.headerColor}
                btnFunc={()=>Alert.alert(
                    'Atenção!',
                    'Caso você tenha editado alguma informação, você perderá todos os dados inseridos. Deseja sair dessa página?',
                    [
                        {
                            text: 'Não',
                            style: 'cancel'
                        },

                        {
                            text: 'Sim',
                            onPress: ()=>navigation.goBack()
                        }
                    ],
                    {
                        cancelable: true,
                        
                    }
                )} icon='arrow-left'/>

            {isLoaded ? (contentView()) : (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#28b2d6" /> 
                </View>
            )} 

            <Modal visible={showModal} transparent={true} animationType='slide'>
                <View style={styles.modalContainer}>
                    <View style={styles.modalBGView}/>
                    <View style={[styles.modalContent, theme.backgroundColor]}>
                        <Text style={[styles.modalTitle, theme.color]}>Atualizar Senha</Text>
                        <View style={styles.modalViews}>
                            <Text style={[styles.modalText, theme.color]}>Nova senha:</Text>
                            <View style={[styles.modalInputs, theme.borderColor]}>
                                <MaterialCommunityIcons name='lock' size={iconSize} color={theme.iconColor} style={styles.iconConfigs}/>
                                <TextInput
                                    placeholder='Senha'
                                    style={[styles.modalInputText, theme.color]}
                                    secureTextEntry={!seePassword}
                                    value={newPasswd}
                                    onChangeText={setNewPasswd}
                                    placeholderTextColor={theme.placeholder}/>
                            </View>
                        </View>
                        <View style={styles.modalViews}>
                            <Text style={[styles.modalText, theme.color]}>Confirmar senha:</Text>
                            <View style={[styles.modalInputs, theme.borderColor]}>
                                <MaterialCommunityIcons name='lock' size={iconSize} color={theme.iconColor} style={styles.iconConfigs}/>
                                <TextInput
                                    placeholder='Senha'
                                    style={[styles.modalInputText, theme.color]}
                                    secureTextEntry={!seePassword}
                                    value={newRePasswd}
                                    onChangeText={setNewRePasswd}
                                    placeholderTextColor={theme.placeholder}/>
                            </View>
                            <TouchableOpacity onPress={()=>setSeePassword(!seePassword)} style={{marginTop: 10, alignSelf: 'flex-end'}}>
                                <MaterialCommunityIcons name={seePassword? 'eye' : 'eye-off'} size={25} color={theme.iconColor}/>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={[styles.saveButton, {backgroundColor: isButtonEnabled? '#ff9b4f' : '#ffc89e'}]} 
                            onPress={setNewPassword} 
                            disabled={!isButtonEnabled}>
                            <MaterialCommunityIcons name='content-save' size={25} color='#fff'/>
                            <Text style={[styles.btnText, {color: 'white'}]}>Atualizar Senha</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=>setShowModal(false)}>
                            <Text style={{fontFamily: 'Montserrat', color:'#28b2d6', fontSize: 16}}>Voltar</Text>
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
        justifyContent: 'center',
        alignItems: 'center',
    },

    userImgView: {
        marginTop: 20,
        marginBottom: 10,
        width: 140,
        height: 140,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        borderWidth: 2,
    },

    userImg: {
        width: 136,
        height: 136,
        resizeMode: 'stretch',
        borderRadius: 100,
    },

    editUserPng: {
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

    configs: {
        flexDirection: 'row',
        width: Dimensions.get('screen').width * 0.85,
        marginVertical: 10,
        alignItems: 'center',
        paddingVertical: 5,
        borderBottomWidth: 1,
    },

    iconConfigs: {
        marginRight: 6,
    },

    darkModeText: {
        fontFamily: 'Montserrat-SemiBold',
        textAlign: 'center',
        width: 140,
        fontSize: 17
    },

    text: {
        fontSize: 17,
        fontFamily: 'Montserrat',
        flex: 0.25,
        height: '100%',
        textAlignVertical: 'center'
    },

    inputText: {
        fontSize: 17,
        fontFamily: 'Montserrat',
        flex: 0.75,
        height: '100%',
        textAlignVertical: 'center'
    },

    modifyPsBtn: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        padding: 7,
        borderRadius: 5,
        borderColor: '#ff9b4f',
        alignSelf: 'flex-start'
    },

    modifyPsTxt: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        color: '#ff9b4f'
    },

    saveButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 45,
        width: 220,
        borderRadius: 7,
        paddingHorizontal: 10,
        marginVertical: 15
    },

    leftButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 45,
        width: 220,
        borderRadius: 7,
        borderColor: '#28b2d6',
        borderWidth: 2,
        paddingHorizontal: 10,
        marginVertical: 15
    },

    btnText: {
        fontSize: 18,
        fontFamily: 'Montserrat-SemiBold'
    },

    switch: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 3
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center'
    },

    modalBGView: {
        backgroundColor: 'black',
        opacity: 0.6,
        flex: 1,
    },

    modalContent: {
        backgroundColor: '#fff',
        width: Dimensions.get('screen').width * 0.85,
        height: Dimensions.get('screen').height * 0.7,
        position: 'absolute',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10
    },

    modalTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 20,
        marginBottom: 20
    },
    
    modalViews: {
        width: '80%',
        marginVertical: 15
    },

    modalText: {
        fontFamily: 'Montserrat',
        fontSize: 17,
        marginBottom: 7
    },

    modalInputs: {
        borderBottomWidth: 1,
        paddingVertical: 3,
        flexDirection: 'row'
    },

    modalInputText: {
        fontSize: 17,
        flex: 1,
        fontFamily: 'Montserrat'
    }
})