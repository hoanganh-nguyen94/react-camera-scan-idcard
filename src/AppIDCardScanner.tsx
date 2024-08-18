import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from './IDCardScanner/screens/HomeScreen';
import CameraScreen from './IDCardScanner/screens/CameraScreen';
import CardScreen from './IDCardScanner/screens/CardScreen';
import {TextButton} from './IDCardScanner/components/TextButton';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen
          name="Card"
          component={CardScreen}
          options={() => ({
            // Add a placeholder button without the `onPress` to avoid flicker
            headerRight: () => <TextButton title="Save"></TextButton>,
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
