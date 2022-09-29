import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Button } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Image } from "@rneui/themed";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { API } from "../utils/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SavedProducts() {
   const isFocused = useIsFocused();
   const navigation = useNavigation();

   /* --  עבור שליפת נתונים API קישורי -- */
   // שליפת כל המוצרים
   const apiUrl = API.API_URL + "Products";

   // שליפת פרטי הסניפים שתבצע בדיקה ותשלח התראה למתשמש על ירידת מחיר
   const apiUrlProductInAllProductsInBranch = API.API_URL + "Products_In_Branch";

   const [productsAPIData, setProductsAPIData] = useState([]);

   const [savedProductsFromAsyncStorage, setSavedProductsFromAsyncStorage] = useState([]);

   const [productsInAllCompaniesBranchesAPIData, setProductsInAllCompaniesBranchesAPIData] = useState([]);

   // לשליפת הנתונים fetch פעולת
   const apiGetAction = async () => {
      try {
         const productsResponse = await fetch(apiUrl);

         const productInAllCompaniesBranchesResponse = await fetch(apiUrlProductInAllProductsInBranch);

         const productsResponseData = await productsResponse.json();

         const productInAllCompaniesBranchesData = await productInAllCompaniesBranchesResponse.json();

         setProductsInAllCompaniesBranchesAPIData(productInAllCompaniesBranchesData);

         setProductsAPIData(productsResponseData);
      } catch (error) {}
   };

   //   פעולה א-סינכרונית השולפת את המידע מתוך זיכרון המכשיר - מוצרים שמורים
   const importData = async () => {
      try {
         const keys = await AsyncStorage.getAllKeys();
         const result = await AsyncStorage.multiGet(keys);
         setSavedProductsFromAsyncStorage(result);
      } catch (error) {}
   };

   useEffect(() => {
      apiGetAction();
      return () => {};
   }, []);

   useEffect(() => {
      if (isFocused) {
         importData();
      }
      return () => {};
   });

   // פעולה המקבלת את מחיר המוצר שנשמר מתוך זיכרון המכשיר ומחיר מוצר הנשלף מתוך השרת
   // ותבצע בדיקה אם התבצע שינוי מחיר עבור המוצר
   // במידה וכן תציג את המחיר החדש ואת המחיר הישן עם קו החוצה אותו
   // 'אחרת יוצג המחיר שנשמר ולצידו הודעה 'עדיין אין ירידת מחיר
   const checkPrice = (productPrice, checkedProductPrice) => {
      if (checkedProductPrice !== productPrice) {
         return (
            <View
               style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: "10%",
               }}>
               <Text style={{ fontSize: 15, color: "rgb(4,207,146)" }}>₪{checkedProductPrice}</Text>
               <View
                  style={{
                     marginLeft: "50%",
                     padding: 4,
                  }}>
                  <Text
                     style={{
                        fontSize: 15,
                        color: "gray",
                        textDecorationLine: "line-through",
                     }}>
                     ₪{productPrice}
                  </Text>
               </View>
            </View>
         );
      }
      return (
         <View
            style={{
               flexDirection: "row",
               alignItems: "center",
               marginLeft: "10%",
            }}>
            <Text style={{ fontSize: 15, color: "rgb(4,207,146)" }}>₪{productPrice}</Text>
            <View
               style={{
                  marginLeft: 20,
                  padding: 4,
               }}>
               <Text style={{ fontSize: 12, color: "rgb(4,207,146)" }}>עדיין אין ירידת מחיר</Text>
            </View>
         </View>
      );
   };

   // פעולה הבודקת את המחיר המינימלי שיש למוצר מבין כל החברות המוכרות אותו
   const lowestPrice = (upcCode, lowPrice) => {
      let priceMin = lowPrice;
      for (let index = 0; index < productsInAllCompaniesBranchesAPIData.length; index++) {
         if (upcCode == productsInAllCompaniesBranchesAPIData[index].UPC_Code) {
            priceMin = Math.min(productsInAllCompaniesBranchesAPIData[index].Product_Price, priceMin);
         }
      }
      return priceMin;
   };

   // פעולה המקבלת קוד מוצר ואת מחירו שנשמר בזכרון המכשיר
   // ומציגה רשימה של כל המוצרים שנשמרו במכשיר
   // עבור כל שורה של מוצר שנשמר עם אפשרות לחיצה ומעבר לדף מוצר
   const showSavedProducts = (upcCode, lowPrice) => {
      return productsAPIData.map((product) => {
         if (product.UPC_Code == upcCode) {
            return (
               <TouchableOpacity
                  key={product.UPC_Code}
                  onPress={() =>
                     navigation.navigate("ProductPage", {
                        productToProductPage: product,
                     })
                  }
                  style={{
                     width: "95%",
                     height: 65,
                     marginVertical: 6,
                     flexDirection: "row",
                     alignItems: "center",
                     backgroundColor: "rgb(92,96,106)",
                     borderRadius: 15,
                     marginLeft: 10,
                  }}>
                  <View
                     style={{
                        flexDirection: "column",
                     }}>
                     <View
                        style={{
                           width: "100%",
                           height: 90,
                           padding: 25,
                           justifyContent: "center",
                           alignItems: "center",
                        }}>
                        <Image
                           source={{ uri: "https://" + product.Product_Picture }}
                           style={{
                              width: 100,
                              height: "100%",
                              resizeMode: "contain",
                           }}
                        />
                        <Text
                           style={{
                              alignSelf: "center",
                              fontSize: 12,
                              color: "rgb(4,207,146)",
                           }}>
                           {product.UPC_Code}
                        </Text>
                     </View>
                  </View>
                  <View
                     style={{
                        flex: 1,
                        height: "100%",
                        justifyContent: "space-around",
                     }}>
                     <View style={{}}>
                        <View
                           style={{
                              marginTop: 10,
                              marginLeft: "16.5%",
                              flexDirection: "column",
                              alignItems: "flex-start",
                           }}>
                           <Text
                              style={{
                                 fontSize: 17,
                                 maxWidth: "100%",
                                 marginRight: 4,
                                 fontWeight: "bold",
                                 color: "rgb(4,207,146)",
                              }}>
                              {product.Product_Name}
                           </Text>
                        </View>
                     </View>
                     <View
                        style={{
                           flexDirection: "row",
                           justifyContent: "space-between",
                           alignItems: "center",
                        }}>
                        {checkPrice(lowPrice, lowestPrice(product.UPC_Code, lowPrice))}
                     </View>
                  </View>
               </TouchableOpacity>
            );
         }
      });
   };

   return (
      <SafeAreaView style={styles.container}>
         <ScrollView>
            <View style={styles.textView}>
               <View style={styles.viewContain}>
                  <Text style={styles.title}>מוצרים שמורים</Text>
               </View>
               <View style={styles.viewContain}>
                  <Text style={styles.subTitle}>כל המוצרים ששמרת נמצאים כאן ברשימה,</Text>
                  <Text style={styles.subTitle}>כאשר תהיה ירידת מחיר נתריע לך!</Text>
               </View>
            </View>
            {savedProductsFromAsyncStorage
               ? savedProductsFromAsyncStorage.map((p) => showSavedProducts(JSON.parse(p[1]).upcCode, JSON.parse(p[1]).lowPrice))
               : null}
            <View style={styles.ListIconStyleContain}>
               <MaterialCommunityIcons name='text-box-check-outline' color='rgba(214, 214, 214, 0.08)' size={200} />
            </View>
         </ScrollView>
      </SafeAreaView>
   );
}
const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "rgb(40,47,59)",
      justifyContent: "center",
   },
   viewContain: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
   },
   title: {
      color: "white",
      fontSize: 30,
      fontWeight: "bold",
      marginTop: 50,
   },
   subTitle: {
      color: "rgb(4,207,146)",
      fontSize: 17,
   },
   textView: {
      flex: 0.5,
      marginBottom: 50,
   },
   ListIconStyleContain: {
      position: "absolute",
      marginLeft: 100,
      marginTop: 270,
      justifyContent: "center",
      zIndex: -1,
      flex: 0.3,
   },
});
