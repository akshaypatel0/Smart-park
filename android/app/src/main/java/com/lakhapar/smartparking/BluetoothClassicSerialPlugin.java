package com.lakhapar.smartparking;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.pm.PackageManager;
import android.os.Build;
import androidx.core.app.ActivityCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Set;
import java.util.UUID;

@CapacitorPlugin(name = "BluetoothClassicSerial")
public class BluetoothClassicSerialPlugin extends Plugin {

    // Standard Bluetooth Serial Port Profile (SPP) UUID for HC-05 / HC-06 / Arduino
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805f9b34fb");

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket currentSocket;
    private Thread readThread;
    private volatile boolean isRunning = false;
    private OutputStream outputStream;

    @Override
    public void load() {
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    @PluginMethod
    public void isEnabled(PluginCall call) {
        JSObject ret = new JSObject();
        boolean enabled = bluetoothAdapter != null && bluetoothAdapter.isEnabled();
        ret.put("enabled", enabled);
        call.resolve(ret);
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    public void listPairedDevices(PluginCall call) {
        if (bluetoothAdapter == null) {
            call.reject("Bluetooth is not available on this device.");
            return;
        }

        try {
            Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
            JSArray devicesArray = new JSArray();

            if (pairedDevices != null) {
                for (BluetoothDevice device : pairedDevices) {
                    JSObject devObj = new JSObject();
                    devObj.put("name", device.getName() != null ? device.getName() : "Unknown");
                    devObj.put("address", device.getAddress());
                    devObj.put("type", "classic");
                    devicesArray.put(devObj);
                }
            }

            JSObject ret = new JSObject();
            ret.put("devices", devicesArray);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Error listing paired Bluetooth devices: " + e.getMessage());
        }
    }

    @SuppressLint("MissingPermission")
    @PluginMethod
    public void connect(PluginCall call) {
        String address = call.getString("address");

        if (bluetoothAdapter == null) {
            call.reject("Bluetooth adapter not available");
            return;
        }

        if (!bluetoothAdapter.isEnabled()) {
            call.reject("Bluetooth is turned off. Please turn ON Bluetooth in Android Settings.");
            return;
        }

        // Clean up any existing connection
        cleanup();

        new Thread(() -> {
            try {
                BluetoothDevice targetDevice = null;

                if (address != null && !address.isEmpty()) {
                    targetDevice = bluetoothAdapter.getRemoteDevice(address);
                } else {
                    // Auto-discover first paired device with HC-05 / HC / Arduino
                    Set<BluetoothDevice> pairedDevices = bluetoothAdapter.getBondedDevices();
                    if (pairedDevices != null) {
                        for (BluetoothDevice dev : pairedDevices) {
                            String name = dev.getName();
                            if (name != null && (name.toUpperCase().contains("HC") || name.toUpperCase().contains("BT") || name.toUpperCase().contains("ARDUINO") || name.toUpperCase().contains("PARKING"))) {
                                targetDevice = dev;
                                break;
                            }
                        }
                        if (targetDevice == null && !pairedDevices.isEmpty()) {
                            targetDevice = pairedDevices.iterator().next();
                        }
                    }
                }

                if (targetDevice == null) {
                    call.reject("No HC-05 or Bluetooth device found. Please pair HC-05 in Android Settings first using PIN 1234.");
                    return;
                }

                bluetoothAdapter.cancelDiscovery();

                BluetoothSocket socket = targetDevice.createRfcommSocketToServiceRecord(SPP_UUID);
                socket.connect();

                currentSocket = socket;
                outputStream = socket.getOutputStream();
                isRunning = true;

                // Start reader thread
                startReading(socket.getInputStream());

                final String connectedName = targetDevice.getName() != null ? targetDevice.getName() : "HC-05 Bluetooth";
                final String connectedAddr = targetDevice.getAddress();

                JSObject ret = new JSObject();
                ret.put("connected", true);
                ret.put("name", connectedName);
                ret.put("address", connectedAddr);
                call.resolve(ret);

            } catch (Exception e) {
                cleanup();
                call.reject("Failed to connect to HC-05: " + e.getMessage() + ". Ensure HC-05 is powered and paired in Android Bluetooth Settings.");
            }
        }).start();
    }

    private void startReading(InputStream inStream) {
        readThread = new Thread(() -> {
            BufferedReader reader = new BufferedReader(new InputStreamReader(inStream));
            while (isRunning) {
                try {
                    String line = reader.readLine();
                    if (line != null) {
                        String clean = line.trim();
                        if (!clean.isEmpty()) {
                            JSObject dataObj = new JSObject();
                            dataObj.put("line", clean);
                            notifyListeners("data", dataObj);
                        }
                    } else {
                        // End of stream / disconnected
                        break;
                    }
                } catch (IOException e) {
                    break;
                }
            }
            if (isRunning) {
                notifyListeners("disconnected", new JSObject());
                cleanup();
            }
        });
        readThread.start();
    }

    @PluginMethod
    public void write(PluginCall call) {
        String data = call.getString("data");
        if (outputStream == null || currentSocket == null || !currentSocket.isConnected()) {
            call.reject("Not connected to Bluetooth device");
            return;
        }

        try {
            if (data != null) {
                outputStream.write(data.getBytes());
                outputStream.flush();
            }
            call.resolve();
        } catch (IOException e) {
            call.reject("Failed to write to Bluetooth device: " + e.getMessage());
        }
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        cleanup();
        JSObject ret = new JSObject();
        ret.put("disconnected", true);
        call.resolve(ret);
    }

    private void cleanup() {
        isRunning = false;
        if (readThread != null) {
            readThread.interrupt();
            readThread = null;
        }
        if (outputStream != null) {
            try {
                outputStream.close();
            } catch (Exception ignored) {}
            outputStream = null;
        }
        if (currentSocket != null) {
            try {
                currentSocket.close();
            } catch (Exception ignored) {}
            currentSocket = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        cleanup();
        super.handleOnDestroy();
    }
}
