import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Icon } from "@rneui/themed";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { API } from "../utils/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function History() {
   const navigation = useNavigation();
   const isFocused = useIsFocused();

   /* --  עבור שליפת נתונים API קישורי -- */
   // שליפת כל המוצרים
   const apiUrl = API.API_URL + "Products";

   // עבור שליפת היסטוריית החיפושים מזיכרון המכשיר ושליפת המוצרים מהשרת states
   const [searchHistoryFromAsyncStorage, setSearchHistoryFromAsyncStorage] = useState([]);

   const [productsAPIData, setProductsAPIData] = useState([]);

   // לשליפת הנתונים fetch פעולת
   const apiGetAction = async () => {
      try {
         const productsResponse = await fetch(apiUrl);

         const productsResponseData = await productsResponse.json();

         setProductsAPIData(productsResponseData);
      } catch (error) {}
   };

   //  פעולה א-סינכרונית השולפת את המידע מתוך זיכרון המכשיר - היסטוריית חיפושים וסריקות
   const importData = async () => {
      try {
         const keys = await AsyncStorage.getAllKeys();
         const result = await AsyncStorage.multiGet(keys);
         setSearchHistoryFromAsyncStorage(result);
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

   // פעולה המציגה שורה מתוך הרשימה עבור כל המוצרים שנסרקו
   // הפעולה מקבלת מתוך זכרון המכשיר את הערך שנסרק ובודקת האם הוא קיים מתוך כל המוצרים הקיימים בשרת
   // במידה וכן תתווסף שורה עם אפשרות לחיצה ומעבר לדף מוצר
   const showUpcBarcode = (search) => {
      return productsAPIData.map((product) => {
         if (product.UPC_Code == search) {
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
                           padding: 15,
                           justifyContent: "center",
                           alignItems: "center",
                        }}>
                        <MaterialCommunityIcons name='barcode-scan' size={35} color={"white"} />
                        <Text
                           style={{
                              alignSelf: "center",
                              fontSize: 12,
                              color: "white",
                           }}>
                           {search}
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
                                 fontSize: 20,
                                 maxWidth: "85%",
                                 marginLeft: "5%",
                                 color: "rgb(4,207,146)",
                                 textAlign: "center",
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
                        }}></View>
                  </View>
               </TouchableOpacity>
            );
         }
      });
   };

   // פעולה המציגה שורה מתוך הרשימה עבור כל המוצרים שהמשתמש כתב בשורת החיפוש
   // הפעולה מקבלת מתוך זכרון המכשיר את הערך שחופש ובודקת האם הוא קיים בשרת
   // במידה וכן תתווסף שורה עם אפשרות לחיצה ומעבר לדף חיפוש מוצר עם הערך שנשמר
   const showSearchHistory = (search) => {
      return (
         <TouchableOpacity
            key={search}
            onPress={() =>
               navigation.navigate("SearchProduct", {
                  searchStringToSearchPage: search,
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
                     padding: 30,
                     justifyContent: "center",
                     alignItems: "center",
                  }}>
                  <Icon name='search' size={35} color={"white"} />
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
                           fontSize: 20,
                           maxWidth: "85%",
                           marginLeft: "5%",
                           color: "rgb(4,207,146)",
                           textAlign: "center",
                        }}>
                        {search}
                     </Text>
                  </View>
               </View>
               <View
                  style={{
                     flexDirection: "row",
                     justifyContent: "space-between",
                     alignItems: "center",
                  }}></View>
            </View>
         </TouchableOpacity>
      );
   };

   return (
      <SafeAreaView style={styles.container}>
         <ScrollView>
            <View style={styles.textView}>
               <View style={styles.viewContain}>
                  <Text style={styles.title}>היסטוריה</Text>
               </View>

               <View style={styles.viewContain}>
                  <Text style={styles.subTitle}>נזכרת במשהו?</Text>
                  <Text style={styles.subTitle}>כאן תמיד אפשר לחזור לאותה הנקודה בה הפסקת!</Text>
               </View>
            </View>
            {searchHistoryFromAsyncStorage.map((search) => {
               return showUpcBarcode(JSON.parse(search[1]).scanKey);
            })}

            {searchHistoryFromAsyncStorage.map((search) => {
               if (JSON.parse(search[1]).searchKey != null) return showSearchHistory(JSON.parse(search[1]).searchKey);
            })}
            <View style={styles.historyIconStyleContain}>
               <MaterialCommunityIcons name='history' color='rgba(214, 214, 214, 0.08)' size={250} />
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
      marginTop: 50,
      fontWeight: "bold",
   },
   subTitle: {
      color: "rgb(4,207,146)",
      fontSize: 17,
   },
   textView: {
      flex: 0.5,
      marginBottom: 50,
   },
   historyIconStyleContain: {
      position: "absolute",
      marginLeft: 85,
      marginTop: 270,
      justifyContent: "center",
      zIndex: -1,
      flex: 0.3,
   },
});
