import { useCallback } from "react";
import { SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";

export default function LoadingScreen({navigation}){

    useFocusEffect(
        useCallback(()=>{
            const timer = setTimeout(() => {
                navigation.navigate('Home');
            }, 1);
            return()=>clearTimeout(timer);
        },[])
    )

    return(
        <SafeAreaView style={styles.container}>
            <ActivityIndicator size="large" color="#28b2d6"/>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})