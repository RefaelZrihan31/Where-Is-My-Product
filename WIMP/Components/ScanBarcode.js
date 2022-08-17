import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "@rneui/base";
import { BarCodeScanner } from "expo-barcode-scanner";
import BarcodeMask from "react-native-barcode-mask";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { API } from "../utils/API";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function ScanBarcode() {
   const navigation = useNavigation();

   // עבור שליפת נתונים API קישורי
   // שליפת כל המוצרים
   const apiUrl = API.API_URL + "Products";

   const [hasPermission, setHasPermission] = useState(null);

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
      } catch (e) { }
   };




   useEffect(() => {
      (async () => {
         const { status } = await BarCodeScanner.requestPermissionsAsync();
         setHasPermission(status === "granted");
      })();
      apiGetAction();
   }, []);

   // פעולה המקבלת את הערך שנסרק ומבטלת את אפשרות הסריקה הנוספת עד ללחיצה על הכפתור המופיע על המסך
   const handleBarCodeScanned = ({ data }) => {
      setScanned(true);
      checkBarcodeExist(data);
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
   if (hasPermission === null) {
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
            <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={styles.scanStyle}>
               <BarcodeMask edgeColor='rgb(4,207,146)' animatedLineColor={"rgb(4,207,146)"} showAnimatedLine width={380} height={180} />
            </BarCodeScanner>
         </View>
         {scanned && <Button title={"סרוק שוב !"} color='rgb(4,207,146)' size='md' radius='lg' onPress={() => setScanned(false)} />}

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
      flex: 0.25,
   },
   scanIconStyleContain: {
      flex: 0.25,
   },
});
