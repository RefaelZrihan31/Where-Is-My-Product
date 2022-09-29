import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Button } from "@rneui/base";
import { BarCodeScanner } from "expo-barcode-scanner";
import BarcodeMask from "react-native-barcode-mask";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { API } from "../utils/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import { useIsFocused } from "@react-navigation/native";

export default function ScanBarcode() {
   const navigation = useNavigation();

   //עבור מכשירי אנדרואיד בלבד -
   //מאתחל את המצלמה מחדש בכל פעם שעוברים שוב לדף סריקה
   //או מבצעים סריקה מחודשת
   const focused = useIsFocused();

   /* --  עבור שליפת נתונים API קישורי -- */
   // שליפת כל המוצרים
   const apiUrl = API.API_URL + "Products";

   const [hasPermission, setHasPermission] = useState(null); //IOS עבור מכשירי

   const [hasPermissionCameraAndroid, setHasPermissionCameraAndroid] = useState(null); //Android עבור מכשירי

   const [scanned, setScanned] = useState(false);

   const [productsAPIData, setProductsAPIData] = useState([]);

   // לשליפת הנתונים fetch פעולת
   const apiGetAction = async () => {
      const productsResponse = await fetch(apiUrl);

      const productsResponseData = await productsResponse.json();

      setProductsAPIData(productsResponseData);
   };

   // פעולה א-סינכרונית לשמירת פרטי המוצר בזכרון המכשיר
   const storeData = async (scannedValue) => {
      const searchedValueToStorage = { scanKey: scannedValue };
      try {
         await AsyncStorage.setItem(JSON.stringify(scannedValue), JSON.stringify(searchedValueToStorage));
      } catch (e) {}
   };

   useEffect(() => {
      (async () => {
         const { status } = await BarCodeScanner.requestPermissionsAsync(); //IOS עבור מכשירי
         const { statusCameraAndroid } = await Camera.requestCameraPermissionsAsync(); //Android עבור מכשירי
         setHasPermission(status === "granted"); //IOS עבור מכשירי
         setHasPermissionCameraAndroid(statusCameraAndroid === "granted"); //Android עבור מכשירי
      })();
      apiGetAction();
   }, []);

   // פעולה המקבלת את הערך שנסרק ומבטלת את אפשרות הסריקה הנוספת עד ללחיצה על הכפתור המופיע על המסך
   const handleBarCodeScanned = ({ data }) => {
      checkBarcodeExist(data);
      setScanned((prev) => !prev);
   };

   // פעולה המקבלת את הערך - ברקוד של המוצר שנסרק ובודקת האם הברקוד של המוצר קיים בשרת
   // במידה וכן תעביר אל דף המוצר המתאים
   // אחרת תאפשר למשתשמש לסרוק שנית
   const checkBarcodeExist = (data) => {
      for (let index = 0; index < productsAPIData.length; index++) {
         if (productsAPIData[index].UPC_Code == data) {
            storeData(data);
            navigation.navigate("ProductPage", {
               productToProductPage: productsAPIData[index],
            });
         }
      }
   };
   // בדיקה אם יש הרשאה לשימוש במצלמה
   if (hasPermission === null || hasPermissionCameraAndroid === null) {
      return <Text>Requesting for camera permission</Text>;
   }

   return (
      <View style={styles.container}>
         <View style={styles.textView}>
            <View style={styles.viewContain}>
               <Text style={styles.title}>סרוק מוצר</Text>
            </View>

            <View style={styles.viewContain}>
               <Text style={styles.subTitle}>יש לוודא שהברקוד בתוך המסגרת</Text>
               <Text style={styles.subTitle}>והמכשיר הנייד יציב</Text>
            </View>
         </View>

         <View style={styles.scanStyleContain}>
            {Platform.OS === "android" && focused ? (
               <Camera onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={styles.scanStyle} ratio='1:1'>
                  <BarcodeMask edgeColor='rgb(4,207,146)' animatedLineColor={"rgb(4,207,146)"} showAnimatedLine width={380} height={180} />
               </Camera>
            ) : (
               <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={styles.scanStyle}>
                  <BarcodeMask edgeColor='rgb(4,207,146)' animatedLineColor={"rgb(4,207,146)"} showAnimatedLine width={380} height={180} />
               </BarCodeScanner>
            )}
         </View>
         {scanned && <Button title={"סרוק שוב!"} color='rgb(4,207,146)' size='md' radius='lg' onPress={() => setScanned(false)} />}

         <View style={styles.scanIconStyleContain}>
            <MaterialCommunityIcons name='barcode-scan' color='rgba(214, 214, 214, 0.08)' size={150} />
         </View>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "rgb(40,47,59)",
      alignItems: "center",
      justifyContent: "center",
   },
   viewContain: {
      alignItems: "center",
      justifyContent: "center",
   },
   title: {
      color: "white",
      fontSize: 30,
      marginBottom: 50,
      fontWeight: "bold",
   },
   subTitle: {
      color: "rgb(4,207,146)",
      fontSize: 20,
   },
   scanStyle: {
      width: 380,
      height: 180,
   },
   textView: {
      flex: 0.25,
   },
   scanStyleContain: {
      flex: Platform.OS === "android" ? 0.3 : 0.25,
   },
   scanIconStyleContain: {
      flex: 0.25,
   },
});
