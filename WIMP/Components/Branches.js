import { StyleSheet, Text, View, ScrollView, SafeAreaView } from "react-native";
import React, { useState, useEffect } from "react";
import { ListItem, Icon } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { API } from "../utils/API";

export default function Branches({ route }) {
   const navigation = useNavigation();
   const { companiesBranchesToSend, upcCode } = route.params;

   // עבור שליפת נתונים API קישורי
   // שליפת נתוני החנויות המוכרות את המוצר
   const apiUrl = API.API_Product_In_Branch_Comp + JSON.stringify(companiesBranchesToSend.Company_Code) + "/" + JSON.stringify(upcCode.UPC_Code);

   //שליפת נתוני הסניפים הרלוונטיים של כל חברה
   const apiUrlCompaniesBranches = API.API_URL + "Branches" + "/" + JSON.stringify(companiesBranchesToSend.Company_Code);

   const [companiesSellingProductBranchesAPIData, setCompaniesSellingProductBranchesAPIData] = useState([]);

   const [companiesBranchesAPIData, setCompaniesBranchesAPIData] = useState([]);

   // לשליפת הנתונים fetch פעולת
   const apiGetAction = async () => {
      const companiesSellingProductBranchesResponse = await fetch(apiUrl);

      const companiesBranchesResponse = await fetch(apiUrlCompaniesBranches);

      const companiesSellingProductBranchesData = await companiesSellingProductBranchesResponse.json();

      const companiesBranchesData = await companiesBranchesResponse.json();

      setCompaniesSellingProductBranchesAPIData(companiesSellingProductBranchesData);

      setCompaniesBranchesAPIData(companiesBranchesData);
   };

   useEffect(() => {
      apiGetAction();
      return () => { };
   }, []);

   // הגדרת כותרת מתאימה עבור הדף עם שם החברה
   React.useLayoutEffect(() => {
      navigation.setOptions({
         headerTitle: sliceQuotationMark(JSON.stringify(companiesBranchesToSend.Company_Name)) + " סניפי חברת",
      });
   }, []);

   // JSON -מחיקת מירכאות לאחר שליפת הנתונים מתוך ה
   const sliceQuotationMark = (value) => {
      return value.substring(1, value.length - 1);
   };

   // פעולה הבודקת האם המוצר זמין בסניפי החברה ומציירת אייקון מתאים
   const isProductInStock = (branchCode) => {
      for (let index = 0; index < companiesSellingProductBranchesAPIData.length; index++) {
         if (companiesSellingProductBranchesAPIData[index].Branch_Code === branchCode) {
            return <Icon name='check-circle' type='font-awesome' color='green' />;
         }
      }
      return <Icon name='times-circle' type='font-awesome' color='red' />;
   };

   return (
      <SafeAreaView style={styles.container}>
         <ScrollView>
            <View style={styles.viewContainTitle}>
               <Text style={styles.title}>{sliceQuotationMark(JSON.stringify(companiesBranchesToSend.Company_Name))} בדיקת זמינות מלאי בסניפי </Text>
            </View>

            <View style={{ marginTop: 20 }}>
               {/* הצגת כל סניפי החברה */}
               {companiesBranchesAPIData.map((branch) => (
                  <ListItem key={branch.Branch_Code} containerStyle={styles.containListItem}>
                     <ListItem.Content>
                        <ListItem.Title style={{ color: "white", marginLeft: 12 }}>{branch.Branch_Name}</ListItem.Title>
                     </ListItem.Content>
                     {isProductInStock(branch.Branch_Code)}
                  </ListItem>
               ))}
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
   },
   viewContainTitle: {
      alignItems: "center",
   },
   title: {
      marginTop: 30,
      fontWeight: "bold",
      textDecorationLine: "underline",
      color: "rgb(4,207,146)",
      textAlign: "right",
      fontSize: 20,
   },
   containListItem: {
      marginTop: 10,
      backgroundColor: "rgb(40,48,65)",
      borderColor: "rgb(4,207,146)",
      borderWidth: 0.5,
      borderRadius: 25,
      width: 290,
   },
});
