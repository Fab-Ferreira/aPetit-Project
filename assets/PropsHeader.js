import { View, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default props => {
    return(
        <View style={[styles.container, {backgroundColor: props.bgColor}]}>
            <TouchableOpacity onPress={props.btnFunc} style={styles.userBtn}>
                <MaterialCommunityIcons name={props.icon} size={35} color='#28b2d6'/>
            </TouchableOpacity>
            
            <Image source={require('../assets/Images/aPetitLogoCut.png')} style={styles.logoHeader}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: Dimensions.get('screen').width,
        height: 105,
        paddingHorizontal: 25,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexDirection: 'row',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        zIndex: 1,
    },
    
    userBtn: {
        position: 'absolute',
        left: 25,
        bottom: 15
    },

    logoHeader: {
        width: 100,
        height: 60,
        position: 'absolute',
        justifyContent: 'center',
        bottom: 10 
    }
})