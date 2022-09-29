/*
    של המשתמש Token -לצורך שמירת ה UseContext קומפוננטה בשימוש של
    ויצירת מס' מזהה ייחודי של מכשיר המשתמש לשימוש כאשר תהיה ירידת מחיר
    למכשיר Push עבור מוצר שנשמר ותשלח הודעת
*/
import React, { useState, useEffect, createContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export const UserContext = createContext();

export default function UserContextProvider({ children }) {
   const [uuidUser, SetUuid] = useState(null);
   const [userPushToken, SetPushUserToken] = useState(null);

   const createUserUUID = async () => {
      try {
         await AsyncStorage.removeItem("userUUID");
         let userUUID = await AsyncStorage.getItem("userUUID");
         if (userUUID == null || userUUID == undefined) userUUID = JSON.stringify(uuid.v4());
         await AsyncStorage.setItem("userUUID", userUUID);
         SetUuid(userUUID);
      } catch (e) {}
   };

   // Push Notification פונקציה לרישום המשתמש לצורך שליחת
   const registerForPushNotificationsAsync = async () => {
      let token;
      if (Device.isDevice) {
         const { status: existingStatus } = await Notifications.getPermissionsAsync();
         let finalStatus = existingStatus;
         if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
         }
         if (finalStatus !== "granted") {
            alert("Failed to get push token for push notification!");
            return;
         }
         token = (await Notifications.getExpoPushTokenAsync()).data;
         SetPushUserToken(token);
      } else {
         alert("Must use physical device for Push Notifications");
      }

      if (Platform.OS === "android") {
         Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
         });
      }
      return token;
   };

   useEffect(() => {
      createUserUUID();
      registerForPushNotificationsAsync();
   }, []);

   const value = {
      uuidUser,
      userPushToken,
   };

   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
