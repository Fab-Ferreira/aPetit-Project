import { View, Modal, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default props => {
    return (
        <Modal visible={true} transparent={true} animationType='fade'>
            <View style={styles.modalContainer}>
                <View style={styles.background}/>
                <View style={[styles.container, {backgroundColor: 'white'}]}>
                    <View style={{flexDirection: 'row'}}>
                        <Text style={[styles.title, {color: props.textColor}]}>Titulo</Text>
                        <MaterialCommunityIcons name={props.iconName} size={25} color={props.iconColor}/>
                    </View>
                    
                    <Text style={[styles.text, {color: props.textColor}]}>Esta mensagem deveria aparecer para voce :D</Text>

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.btn1} onPress={props.btn1Press}>
                            <Text style={[styles.text, {color: props.textColor}]}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    container: {
        width: Dimensions.get('screen').width * 0.8,
        height: Dimensions.get('screen').height * 0.3,
        position: 'absolute',
        alignSelf: 'center',
        borderRadius: 5,
        zIndex: 1,
        padding: 20
    },

    background: {
        backgroundColor: 'black',
        opacity: 0.6,
        flex: 1,
    },

    title: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 20
    },

    text: {
        fontFamily: 'Montserrat',
        fontSize: 15,
        textAlign: 'justify',
        width: '100%',
        textAlignVertical: 'center',
        lineHeight: 20
    },

    buttons: {
        flexDirection: 'row',
        bottom: 20,
        right: 20,
        position: 'absolute'
    },

    btn1: {
        
    },

    btn2: {

    }
})