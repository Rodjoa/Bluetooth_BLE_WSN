/**
 * Sample React Native App with Bluetooth State Check
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {
  Colors,
  Header,
} from 'react-native/Libraries/NewAppScreen';

function App(): React.JSX.Element {
  const [bluetoothStatus, setBluetoothStatus] = useState('');
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  // Effect to get and listen to Bluetooth status
  useEffect(() => {
    // Get initial Bluetooth state
    BluetoothStateManager.getState().then(setBluetoothStatus);

    // Listen to Bluetooth state changes
    const subscription = BluetoothStateManager.onStateChange((state) => {
      setBluetoothStatus(state);
    }, true);

    // Clean up the subscription on unmount
    return () => subscription.remove();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
            padding: 24,
          }}>
          <Text style={styles.sectionTitle}>Estado del Bluetooth</Text>
          <Text style={styles.sectionDescription}>
            {bluetoothStatus === 'PoweredOn'
              ? 'El Bluetooth está activado'
              : 'El Bluetooth está desactivado'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
  },
  sectionDescription: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginVertical: 8,
  },
});

export default App;
