import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import { BleManager, Device } from 'react-native-ble-plx';

// Solicitar permisos de ubicación (necesario para BLE en Android)
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

  useEffect(() => {
    const initialize = async () => {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        console.error('Permission denied');
      }

      const bleManager = new BleManager();
      setManager(bleManager);

      BluetoothStateManager.getState().then(setBluetoothStatus);

      const subscription = BluetoothStateManager.onStateChange((state) => {
        setBluetoothStatus(state);
      }, true);

      return () => subscription.remove();
    };

    initialize();
  }, []);

  const scanDevices = () => {
    if (manager) {
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error(error);
          return;
        }
        if (device) {
          setDevices((prevDevices) => {
            const deviceExists = prevDevices.some((d) => d.id === device.id);
            if (!deviceExists) {
              return [...prevDevices, device];
            }
            return prevDevices;
          });
        }
      });

      setTimeout(() => {
        manager.stopDeviceScan();
      }, 20000);
    }
  };

  const connectDevice = async (deviceId: string) => {
    if (manager) {
      try {
        const isConnected = await manager.isDeviceConnected(deviceId);
        if (!isConnected) {
          await manager.connectToDevice(deviceId);
        }
        await manager.discoverAllServicesAndCharacteristicsForDevice(deviceId);
        console.log(`Connected to device: ${deviceId}`);
      } catch (error) {
        console.error('Error connecting to device:', error);
      }
    }
  };

  const readHumidity = async (deviceId: string) => {
    await readCharacteristic(deviceId, "12345678-1234-1234-1234-123456789abc", "abcdef12-1234-1234-1234-abcdef123456", "Humedad");
  };

  const readBattery = async (deviceId: string) => {
    await readCharacteristic(deviceId, "23456789-2345-2345-2345-234567890bcd", "bcdef123-2345-2345-2345-bcdef1234567", "Batería");
  };

  const readLight = async (deviceId: string) => {
    const result = await readCharacteristic(deviceId, "34567890-3456-3456-3456-345678901cde", "cdef2345-3456-3456-3456-cdef23456789", "Luz");
    if (result) {
      const lightValues = atob(result).split(",").map(Number);
      console.log("Valores de luz recibidos:", lightValues);
    }
  };

  const readCharacteristic = async (deviceId: string, serviceUuid: string, characteristicUuid: string, label: string) => {
    if (manager) {
      try {
        const characteristic = await manager.readCharacteristicForDevice(deviceId, serviceUuid, characteristicUuid);
        const value = atob(characteristic.value || "");
        console.log(`${label} recibida:`, value);
        return value;
      } catch (error) {
        console.error(`Error leyendo ${label}:`, error);
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
          <Button title="Read Battery" onPress={() => readBattery(device.id)} />
          <Button title="Read Light" onPress={() => readLight(device.id)} />
        </View>
      ))}
    </View>
  );
}

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