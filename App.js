import React from 'react';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Splash from './screens/Splash';
import Sliders from './screens/Sliders';
import Access from './screens/Access';
import Register from './screens/Register';
import Login from './screens/Login';
import Home from './screens/Home';
import Alimentation from './screens/Alimentation';
import AddPet from './screens/AddPet';
import AddPetInfo from './screens/AddPetInfo';
import Connection from './screens/Connection';
import Planner from './screens/Planner';
import EditProfile from './screens/EditProfile';
import EditPet from './screens/EditPet';
import SnackConfig from './screens/SnackConfig';
import LoadingScreen from './screens/LoadingScreen';

StatusBar.setHidden(true);
StatusBar.setBarStyle('dark-content');

LogBox.ignoreAllLogs();

export default function App(){

  let[fontsLoaded] = useFonts({
    'Montserrat': require('./assets/Fonts/Montserrat-Regular.ttf'),
    'Montserrat-SemiBold': require('./assets/Fonts/Montserrat-SemiBold.ttf')
  })

  if(!fontsLoaded){
    <AppLoading />
  }

  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Splash" component={Splash}/>
        <Stack.Screen name="Sliders" component={Sliders}/>
        <Stack.Screen name="Access" component={Access}/>
        <Stack.Screen name="Register" component={Register}/>
        <Stack.Screen name="Login" component={Login}/>
        <Stack.Screen name="Home" component={Home} options={{animationEnabled: false}}/>
        <Stack.Screen name="Alimentation" component={Alimentation} options={{animationEnabled: false}}/>
        <Stack.Screen name="AddPet" component={AddPet} options={{animationEnabled: false}}/>
        <Stack.Screen name="AddPetInfo" component={AddPetInfo}/>
        <Stack.Screen name="Connection" component={Connection} options={{animationEnabled: false}}/>
        <Stack.Screen name="Planner" component={Planner} options={{animationEnabled: false}}/>
        <Stack.Screen name="EditProfile" component={EditProfile}/>
        <Stack.Screen name="EditPet" component={EditPet}/>
        <Stack.Screen name='SnackConfig' component={SnackConfig}/>
        <Stack.Screen name='LoadingScreen' component={LoadingScreen}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}