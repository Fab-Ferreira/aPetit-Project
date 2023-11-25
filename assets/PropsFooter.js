import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default props => {
    return(
        <TouchableOpacity style={styles.btn} onPress={props.function}>
            <MaterialCommunityIcons name={props.iconName} size={25} color={props.iconColor}/>
            <Text style={[styles.text, {color: props.fontColor}]}>{props.txt}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    btn: {
        alignItems: 'center',
        width: 65,
    },

    text: {
        fontSize: 11,
        fontFamily: 'Montserrat',
        marginTop: 3
    }
})