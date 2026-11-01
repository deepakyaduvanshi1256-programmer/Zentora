import { Capacitor } from "@capacitor/core";
// true only inside the Android (Capacitor) app, false in a normal browser
export const isNative = () => Capacitor.isNativePlatform();
