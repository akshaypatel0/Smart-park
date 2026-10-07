import { ARDUINO_CODE } from '../components/ArduinoGuideModal';

export function downloadArduinoInoFile() {
  const blob = new Blob([ARDUINO_CODE], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'SmartParking_Lakhapar_Arduino.ino';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
