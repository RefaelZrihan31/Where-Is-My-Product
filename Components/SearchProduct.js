import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { Icon, Image, SearchBar } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { API } from "../utils/API";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SearchProduct({ route }) {
   const navigation = useNavigation();

   /* --  עבור שליפת נתונים API קישורי -- */
   // שליפת כל המוצרים
   const apiUrl = API.API_URL + "Products";

   const [search, setSearch] = useState("");

   const [productsAPIData, setProductsAPIData] = useState([]);

   // לשליפת הנתונים fetch פעולת
   const apiGetAction = async () => {
      const productsResponse = await fetch(apiUrl);
      const productsResponseData = await productsResponse.json();
      setProductsAPIData(productsResponseData);
   };

   // פעולה א-סינכרונית לשמירת פרטי המוצר בזכרון המכשיר
   const storeData = async (searchedValue) => {
      const searchedValueToStorage = { searchKey: searchedValue };
      try {
         await AsyncStorage.setItem(JSON.stringify(searchedValue), JSON.stringify(searchedValueToStorage));
      } catch (e) {}
   };

   useEffect(() => {
      apiGetAction();
      if (route.params?.searchStringToSearchPage) {
         setSearch(route.params?.searchStringToSearchPage);
      }
      return () => {};
   }, [route.params?.searchStringToSearchPage]);

   // פעולה המקבלת את הערך שהמשתמש חיפש ותבצע בדיקה אם
   // יש התאמה לאחד מן השדות של המוצר בשרת
   // במידה וכן תציג כרשימה את כל תוצאות החיפוש ותאפשר למשתמש מעבר לדף מוצר הרצוי
   //
   // כאשר יש התאמה בין שורת החיפוש לקלט מן המשתמש פרטי החיפוש ישמרו בזכרון המכשיר
   // עבור הסטוריית חיפושים
   const searchedProducts = (value) => {
      return productsAPIData.map((product) => {
         if (
            value != "" &&
            (product.UPC_Code == value ||
               product.Product_Name.toLowerCase().indexOf(value.toLowerCase()) == 0 ||
               product.Category_Name.toLowerCase().indexOf(value.toLowerCase()) == 0 ||
               product.Manufacturer_Name == value)
         ) {
            return (
               <TouchableOpacity
                  key={product.UPC_Code}
                  onPress={() => {
                     storeData(product.Product_Name);
                     navigation.navigate("ProductPage", {
                        productToProductPage: product,
                     });
                  }}
                  style={{
                     width: 375,
                     height: 55,
                     marginVertical: 8,
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
                           height: 50,
                           padding: 1,
                           justifyContent: "center",
                           alignItems: "center",
                        }}>
                        <Image
                           source={{ uri: "https://" + product.Product_Picture }}
                           style={{
                              width: 100,
                              height: 40,
                              resizeMode: "contain",
                           }}
                        />
                     </View>
                  </View>
                  <View
                     style={{
                        flex: 1,
                        height: 50,
                        justifyContent: "space-around",
                        marginLeft: 17,
                     }}>
                     <View>
                        <View
                           style={{
                              marginTop: 6,
                              flexDirection: "column",
                              alignItems: "center",
                           }}>
                           <Text
                              style={{
                                 fontSize: 15,
                                 width: 210,
                                 color: "rgb(4,207,146)",
                                 textAlign: "center",
                                 marginRight: 100,
                                 fontWeight: "bold",
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
                  <View>
                     <Icon name='arrow-back' size={30} color={"white"} />
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
                  <Text style={styles.title}>חפש מוצר</Text>
               </View>

               <View style={styles.viewContain}>
                  <Text style={styles.subTitle}>הקלד שם מוצר, מספר ברקוד, מותג</Text>
                  <Text style={styles.subTitle}>או כל מונח חיפוש אחר</Text>
               </View>
            </View>
            <View style={styles.searchStyleContain}>
               <SearchBar
                  platform='default'
                  containerStyle={{
                     backgroundColor: "rgb(40,47,59)",
                     borderBottomColor: "transparent",
                     borderTopColor: "transparent",
                  }}
                  inputContainerStyle={{
                     width: 370,
                     direction: "rtl",
                     backgroundColor: "#fff",
                  }}
                  inputStyle={{
                     direction: "rtl",
                     textAlign: "right",
                     color: "black",
                  }}
                  onChangeText={(newVal) => setSearch(newVal)}
                  onClearText={() => console.log(onClearText())}
                  placeholder='חפש מוצר'
                  placeholderTextColor='#888'
                  round
                  onCancel={() => console.log(onCancel())}
                  value={search}
               />
            </View>

            <View
               style={{
                  alignItems: "flex-start",
                  width: "100%",
                  paddingLeft: 15,
                  height: "10%",
               }}>
               <Text style={{ fontSize: 15, color: "gray" }}>תוצאות עבור</Text>
               <Text style={{ fontSize: 15, color: "gray" }}>{search}</Text>
            </View>
            {searchedProducts(search)}
            <View style={styles.bagIconStyleContain}>
               <Icon name='shopping-bag' color='rgba(214, 214, 214, 0.08)' size={250} zIndex={-1} />
            </View>
         </ScrollView>
      </SafeAreaView>
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
      fontSize: 20,
   },
   textView: {
      flex: 0.2,
   },
   bagIconStyleContain: {
      position: "absolute",
      marginLeft: 65,
      marginTop: 270,
      justifyContent: "center",
      zIndex: -1,
      flex: 0.5,
   },
   searchStyleContain: {
      flex: 0.1,
   },
});
