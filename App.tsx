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
  Button,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { BleManager, Device } from 'react-native-ble-plx';

const requestPermissions = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 23) {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permission Required',
          message: 'This app needs location permission to scan for Bluetooth devices.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

function App(): React.JSX.Element {
  const [bluetoothStatus, setBluetoothStatus] = useState('');
  const [manager, setManager] = useState<BleManager | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        console.error('Permission denied');
      }
    };

    const bleManager = new BleManager();
    setManager(bleManager);

    checkPermissions();

    BluetoothStateManager.getState().then(setBluetoothStatus);

    const subscription = BluetoothStateManager.onStateChange((state) => {
      setBluetoothStatus(state);
    }, true);

    return () => subscription.remove();
  }, []);

  const scanDevices = () => {
    if (manager) {
      // Iniciar el escaneo
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error(error);
          return;
        }
        if (device) {
          setDevices((prevDevices) => {
            // Evitar duplicados verificando el ID del dispositivo
            const deviceExists = prevDevices.some((d) => d.id === device.id);
            if (!deviceExists) {
              return [...prevDevices, device];
            }
            return prevDevices;
          });
        }
      });
       // Detener el escaneo después de 20 segundos
    setTimeout(() => {
      console.log("Stopping device scan after 20 seconds...");
      manager.stopDeviceScan();
    }, 20000); // 20,000 ms = 20 segundos


    }
  }
  //manager.stopDeviceScan(); // Detén el escaneo si está activo
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const connectDevice = async (deviceId: string) => {
    console.log(`connectDevice called with deviceId: ${deviceId}`); // Log inicial
    if (manager) {
        try {
            console.log(`Checking if device ${deviceId} is already connected...`);
            
            // Pausa antes de comprobar el estado de conexión
            await delay(1000); // 1000 ms = 1 segundo

            const isConnected = await manager.isDeviceConnected(deviceId);
            console.log(`Connection status for device ${deviceId}: ${isConnected}`);

            if (isConnected) {
                console.log(`Device ${deviceId} is already connected.`);
                return; // Salir si ya está conectado
            }

            console.log(`Attempting to connect to device: ${deviceId}`);

            // Pausa antes de intentar la conexión
            await delay(1000);

            // Intentamos conectarnos al dispositivo
            const connectedDevice = await manager.connectToDevice(deviceId);

            // Pausa antes de verificar el dispositivo conectado
            await delay(5000);

            console.log('Connection attempt completed.');
            console.log('Connected to device:', connectedDevice.id);

            // Otros log para verificar el estado del dispositivo conectado
            console.log('Device name:', connectedDevice.name);

            console.log('Device connected:', await connectedDevice.isConnected());
      
      

        } catch (error) {
            if (error instanceof Error) {
                console.error('Error connecting to device:', error.message);
            } else {
                console.error('Error connecting to device:', error);
            }
        }
    }
};

const readHumidity = async (deviceId: string) => {
  console.log(`readHumidity called with deviceId: ${deviceId}`);
  if (manager) {
    try {
      const serviceUuid = "12345678-1234-1234-1234-123456789abc"; // UUID del servicio del ESP32
      const characteristicUuid = "abcdef12-1234-1234-1234-abcdef123456"; // UUID de la característica del sensor

      console.log("Discovering services and characteristics...");
      await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId);

      console.log("Reading humidity characteristic...");
      const characteristic = await manager.readCharacteristicForDevice(
        deviceId,
        serviceUuid,
        characteristicUuid
      );

      // Los datos se reciben en base64 y deben decodificarse
      const humidityValue = atob(characteristic.value || "");
      console.log("Humedad recibida:", humidityValue);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error reading humidity:", error.message);
      } else {
        console.error("Error reading humidity:", error);
      }
    }
  }
};

  return (
    <View>
      <Text>Bluetooth Status: {bluetoothStatus}</Text>
      <Button title="Start Scan" onPress={scanDevices} />
      <Text>Dispositivos Encontrados:</Text>
      {devices.map((device) => (
        <View key={device.id}>
          <Text>{device.name || 'Unnamed Device'}</Text>
          <Button title="Connect" onPress={() => connectDevice(device.id)} />
          <Button title="Read Humidity" onPress={() => readHumidity(device.id)} />
        </View>
      ))}
    </View>
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








//fin ultimo Detect On Off Phone Bluetooth

  /*
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
*/