import React, { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, Alert } from "react-native";
import Slider from "@react-native-community/slider";
import { Image, Divider, Dialog } from "@rneui/themed";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { API } from "../utils/API";
import { FAB } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

import { UserContext } from '../Context/UserContext';


export default function ProductPage({ route }) {
   const isFocused = useIsFocused();
   const navigation = useNavigation();
   const { uuidUser, userPushToken } = useContext(UserContext);
   const { productToProductPage } = route.params;
   const [maxRadiusRange, setMaxRadiusRange] = useState(15);
   const [visible1, setVisible1] = useState(false);
   const toggleDialog1 = () => {
      setVisible1(!visible1);
   };

   // עבור שליפת נתונים API קישורי
   // שליפת נתוני החברות המוכרות את המוצר
   const apiUrl = API.API_URL + "Products_In_Branch" + "/" + JSON.stringify(productToProductPage.UPC_Code);

   // שליפת הסניפים עבור כל חברה המוכרת את המוצר
   const apiUrlProductInAllCompaniesBranches = API.API_Product_In_Branch_Comp + JSON.stringify(productToProductPage.UPC_Code);

   //Push Notification יצירת הקישור לטבלה השומרת ומעדכנת את פרטי המשתמש לצורך שליחת
   const apiUrlUpdateUserToken = API.API_URL + "userUUID";

   const [isSavedProduct, setIsSavedProduct] = useState(false);

   const [companiesSellingProductAPIData, setCompaniesSellingProductAPIData] = useState([]);

   const [productInAllCompaniesBranchesAPIData, setProductInAllCompaniesBranchesAPIData] = useState([]);

   // לשליפת הנתונים fetch פעולת
   const apiGetAction = async () => {
      const companiesSellingProductResponse = await fetch(apiUrl);

      const productInAllCompaniesBranchesResponse = await fetch(apiUrlProductInAllCompaniesBranches);

      const companiesSellingProductData = await companiesSellingProductResponse.json();

      const productInAllCompaniesBranchesData = await productInAllCompaniesBranchesResponse.json();

      setCompaniesSellingProductAPIData(companiesSellingProductData);

      setProductInAllCompaniesBranchesAPIData(productInAllCompaniesBranchesData);
   };

   const [location, setLocation] = useState(null);

   // פונקציה א-סינכרונית לשליפת נתוני המיקום הנוכחיים של המשתמש לאחר שנתן אישור לשימוש בשירותי מיקום
   const getCurrentLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
         return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
   };

   useEffect(() => {
      getCurrentLocation();
   }, []);

   // Mile פונקציה לחישוב מרחק בין המיקום הנוכחי של המשתמש לסניף - חישוב
   const haversine_distance = (mk1, mk1long, mk2, mk2long) => {
      const R = 3958.8; // Radius of the Earth in miles
      const rlat1 = mk1 * (Math.PI / 180); // Convert degrees to radians
      const rlat2 = mk2 * (Math.PI / 180); // Convert degrees to radians
      const difflat = rlat2 - rlat1; // Radian difference (latitudes)
      const difflon = (mk2long - mk1long) * (Math.PI / 180); // Radian difference (longitudes)

      const d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
      return d;
   };

   // פעולה הבודקת את המחיר המינימלי שיש למוצר מבין כל החברות המוכרות אותו
   const lowestPrice = () => {
      let priceMin;
      for (let index = 0; index < companiesSellingProductAPIData.length; index++) {
         priceMin = Math.min(companiesSellingProductAPIData[index].Product_Price, companiesSellingProductAPIData[0].Product_Price);
      }
      return priceMin;
   };


   // Post פונקציה א-סינכרונית המקבלת את המס' המזהה של המשתמש ושולחת פקודת
   // החדש token -היוצרת רשומה חדשה או מעדכנת את הרשומות עם ה
   const updateTableSavedTokenUsers = async () => {
      try {
         let objToSend = {
            User_UUID: uuidUser.replace(/"/g, ''),
            UPC_Code: JSON.stringify(productToProductPage.UPC_Code),
            User_Token: userPushToken
         }

         const newUserToken = {
            method: 'Post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objToSend)
         };
         let result = await fetch(apiUrlUpdateUserToken, newUserToken);
         let data = await result.json();
         alert(data);
      } catch (e) { }
   }

   useEffect(() => {
      apiGetAction();
      var savedProduct = AsyncStorage.getItem(JSON.stringify(productToProductPage.UPC_Code));

      savedProduct.then((product) => {
         product !== null ? setIsSavedProduct(true) : setIsSavedProduct(false);
      });

      return () => { };
   }, []);

   // פעולה א-סינכרונית לשמירת פרטי המוצר בזכרון המכשיר
   const storeData = async (lowestProductPrice) => {
      const productToStorage = {
         upcCode: productToProductPage.UPC_Code,
         lowPrice: lowestProductPrice,
      };
      try {
         await AsyncStorage.setItem(JSON.stringify(productToProductPage.UPC_Code), JSON.stringify(productToStorage));
      } catch (e) { }
   };

   // פעולה א-סינכרונית לשמירת טווח חיפוש בזכרון המכשיר
   const storeRangeData = async (value) => {
      try {
         if (maxRadiusRange != 15) await AsyncStorage.setItem("range", JSON.stringify(value));
         else await AsyncStorage.setItem(JSON.stringify("range"), JSON.stringify(15));
         setMaxRadiusRange(value);
         //console.log(value);
      } catch (e) { }
   };

   // פעולה א-סינכרונית להסרת המוצר שנשמר מזכרון המכשיר
   const removeItemValue = async (key) => {
      try {
         await AsyncStorage.removeItem(JSON.stringify(key));
         return true;
      } catch (exception) {
         return false;
      }
   };

   // פעולה המציירת בראש הדף מצד שמאל את הכוכב המייצג את שמירת המוצר ולהיפך
   // הסרת המוצר, עבור המוצרים השמורים
   React.useLayoutEffect(() => {
      navigation.setOptions({
         headerRight: () =>
            isSavedProduct ? (
               <MaterialCommunityIcons
                  name='star'
                  color={"rgb(4,207,146)"}
                  size={40}
                  onPress={() => {
                     setIsSavedProduct(false);
                     Alert.alert("המוצר הוסר בהצלחה!", `המוצר ${productToProductPage.Product_Name} הוסר רשימת המוצרים השמורים`);
                     removeItemValue(productToProductPage.UPC_Code);
                  }}
               />
            ) : (
               <MaterialCommunityIcons
                  name='star-outline'
                  color={"rgb(4,207,146)"}
                  size={40}
                  onPress={() => {
                     setIsSavedProduct(true);
                     Alert.alert("המוצר נשמר בהצלחה!", `המוצר ${productToProductPage.Product_Name}  נשמר ברשימת המוצרים השמורים`);
                     let lowestProductPrice = lowestPrice();
                     storeData(lowestProductPrice);
                     updateTableSavedTokenUsers()
                  }}
               />
            ),
      });
   }, [isSavedProduct, lowestPrice()]);

   // JSON -מחיקת מירכאות לאחר שליפת הנתונים מתוך ה
   const sliceQuotationMark = (value) => {
      return value.substring(1, value.length - 1);
   };

   // פעולה א-סינכרונית השולפת את המידע מתוך זיכרון המכשיר
   const importData = async () => {
      try {
         const key = await AsyncStorage.getItem("range");
         if (key != null || key != undefined) setMaxRadiusRange(parseInt(key));
      } catch (error) {
         console.error(error);
      }
   };

   useEffect(() => {
      if (isFocused) {
         importData();
      }
      return () => { };
   });

   const clearAll = async () => {
      try {
         await AsyncStorage.clear();
      } catch (e) { }
      console.log("Clear!");
   };

   // פעולה המקבלת קוד חברה וגם שם סניף\ מיקום ובודקת ומחזירה האם זמין באחד מסניפי החברות
   // המוכרות את המוצר הנמצאות בסביבת המשתמש
   const showInStock = (companyCode) => {
      for (let index = 0; index < productInAllCompaniesBranchesAPIData.length; index++) {
         if (companyCode === productInAllCompaniesBranchesAPIData[index].Company_Code) {
            if (location !== null) {
               let rangeKm = (
                  haversine_distance(
                     location.coords.latitude,
                     location.coords.longitude,
                     productInAllCompaniesBranchesAPIData[index].Branch_Cord_Latitude,
                     productInAllCompaniesBranchesAPIData[index].Branch_Cord_Longitude
                  ) * 1.609344
               ).toFixed(2);
               if (rangeKm <= maxRadiusRange) {
                  return (
                     <Text
                        onPress={() =>
                           navigation.navigate("NavigationToBranch", {
                              location: location,
                              rangeKm: rangeKm,
                              branchCordLatitude: productInAllCompaniesBranchesAPIData[index].Branch_Cord_Latitude,
                              branchCordLongitude: productInAllCompaniesBranchesAPIData[index].Branch_Cord_Longitude,
                              branchName: productInAllCompaniesBranchesAPIData[index].Branch_Name,
                              branchLink: productInAllCompaniesBranchesAPIData[index].Navigate_Link,
                              branchAddress: productInAllCompaniesBranchesAPIData[index].Address,
                              companyName: productInAllCompaniesBranchesAPIData[index].Company_Name,
                           })
                        }
                        style={{ textAlign: "center", color: "rgb(4,207,146)" }}>
                        קיים במלאי - סניף {productInAllCompaniesBranchesAPIData[index].Branch_Name}
                     </Text>
                  );
               }
            }
         }
      }
      return <Text style={{ textAlign: "center", color: "red" }}>המוצר אינו זמין באזורך</Text>;
   };

   // פעולה המציגה את החברות, מחיר, זמינות בסניף עבור המוצר
   const showList = () => {
      return companiesSellingProductAPIData.map((comp) => {
         return (
            <TouchableOpacity
               key={comp.Company_Code}
               onPress={() =>
                  navigation.navigate("Branches", {
                     companiesBranchesToSend: comp,
                     upcCode: productToProductPage,
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
                     width: "30%",
                     height: 100,
                     padding: 14,
                     justifyContent: "center",
                     alignItems: "center",
                     borderRadius: 10,
                     marginRight: 22,
                     marginTop: 5,
                  }}>
                  <Image
                     source={{ uri: "https://" + comp.Company_Logo_Pic }}
                     style={{
                        width: 100,
                        height: 100,
                        resizeMode: "contain",
                     }}
                  />
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
                           marginTop: 4,
                           flexDirection: "row",
                           alignItems: "center",
                        }}>
                        <Text
                           style={{
                              maxWidth: "85%",
                              marginLeft: 10,
                              color: "rgb(4,207,146)",
                              fontSize: 30,
                              fontWeight: "bold",
                           }}>
                           ₪{comp.Product_Price}
                        </Text>
                     </View>
                  </View>
               </View>

               <View
                  style={{
                     width: "30%",
                     height: 100,
                     padding: 14,
                     justifyContent: "center",
                     alignItems: "center",
                     marginRight: 5,
                  }}>
                  {showInStock(comp.Company_Code)}
               </View>
            </TouchableOpacity>
         );
      });
   };

   return (
      <SafeAreaView style={styles.container}>
         <ScrollView>
            <FAB icon='map-marker-distance' small color='rgb(4,207,146)' style={styles.fab} onPress={() => toggleDialog1()} />
            <Dialog
               isVisible={visible1}
               onBackdropPress={toggleDialog1}
               overlayStyle={{ backgroundColor: "rgb(92,96,106)", borderRadius: 20 }}
               animationType='slide'>
               <Text
                  style={{
                     color: "rgb(4,207,146)",
                     marginRight: 140,
                     fontSize: 17,
                     fontWeight: "bold",
                     textDecorationLine: "underline",
                  }}>
                  הגדר טווח חיפוש
               </Text>

               <Slider
                  style={{ width: 270, height: 40, alignItems: "center" }}
                  minimumValue={1}
                  maximumValue={250}
                  step={5}
                  thumbTintColor={"rgb(4,207,146)"}
                  value={maxRadiusRange}
                  onValueChange={(value) => {
                     storeRangeData(value);
                  }}
                  minimumTrackTintColor='#ccc'
                  maximumTrackTintColor='rgb(40,47,59)'
               />
               <Text
                  style={{
                     color: "rgb(4,207,146)",
                     fontSize: 22,
                     fontWeight: "bold",
                  }}>
                  {maxRadiusRange.toFixed(0)}km
               </Text>
            </Dialog>
            <View style={styles.viewContain}>
               <Text style={styles.productTitle}>{sliceQuotationMark(JSON.stringify(productToProductPage.Product_Name))}</Text>
            </View>
            <View style={styles.viewContainPic}>
               <Image
                  source={{
                     uri: "https://" + sliceQuotationMark(JSON.stringify(productToProductPage.Product_Picture)),
                  }}
                  style={styles.stretch}
               />
            </View>
            <View style={styles.viewContainProductDetails}>
               <Text style={styles.title}>מק״ט</Text>
               <Text style={styles.description}>{JSON.stringify(productToProductPage.UPC_Code)}</Text>
            </View>
            <Divider
               style={{ width: "90%", margin: 15 }}
               color='rgb(4,207,146)'
               insetType='left'
               subHeaderStyle={{}}
               width={1}
               orientation='horizontal'
            />
            <View style={styles.viewContainProductDetails}>
               <Text style={styles.title}>מידע נוסף</Text>
               <Text style={styles.descriptionMore}>{sliceQuotationMark(JSON.stringify(productToProductPage.Description))}</Text>
            </View>
            <Divider
               style={{ width: "90%", margin: 15 }}
               color='rgb(4,207,146)'
               insetType='left'
               subHeaderStyle={{}}
               width={1}
               orientation='horizontal'
            />
            <View style={styles.viewContainProductDetails}>
               <Text style={styles.title}>יצרן</Text>
               <Text style={styles.description}>{sliceQuotationMark(JSON.stringify(productToProductPage.Manufacturer_Name))}</Text>
            </View>
            <Divider
               style={{ width: "90%", margin: 15 }}
               color='rgb(4,207,146)'
               insetType='left'
               subHeaderStyle={{}}
               width={1}
               orientation='horizontal'
            />
            <View style={styles.viewContainProductDetails}>
               <Text style={styles.title}>חנויות</Text>
            </View>

            {showList()}
         </ScrollView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "rgb(40,47,59)",
      justifyContent: "center",
      paddingTop: StatusBar.currentHeight,
   },
   viewContain: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      marginTop: 25,
   },
   productTitle: {
      color: "rgb(4,207,146)",
      fontSize: 24,
      fontWeight: "bold",
   },
   stretch: {
      width: 350,
      height: 200,
      resizeMode: "contain",
   },
   viewContainPic: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
   },
   viewContainProductDetails: {
      alignItems: "flex-start",
      justifyContent: "flex-start",
   },
   title: {
      marginTop: 5,
      marginLeft: 20,
      color: "rgb(4,207,146)",
      textAlign: "right",
      fontSize: 18,
   },
   description: {
      marginTop: 3,
      marginLeft: 20,
      color: "white",
      textAlign: "right",
      fontSize: 14,
   },
   descriptionMore: {
      marginTop: 3,
      marginLeft: 20,
      color: "white",
      textAlign: "left",
      width: 355,
      fontSize: 14,
   },
   fab: {
      position: "absolute",
      margin: 16,
      right: 0,
      top: 275,
      zIndex: 5,
      backgroundColor: "rgb(92,96,106)",
   },
   contentView: {
      padding: 20,
      width: "100%",
      justifyContent: "center",
      alignItems: "stretch",
      textAlign: "rtl",
   },
});
