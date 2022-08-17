import React from "react";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ScanBarcode from "./ScanBarcode";
import SearchProduct from "./SearchProduct";
import History from "./History";
import SavedProducts from "./SavedProducts";

const Tab = createMaterialBottomTabNavigator();
// תפריט ניווט בתחתית המסך המשמש למעבר בין הדפי האפליקציה
export default function Navbar() {
   return (
      <Tab.Navigator initialRouteName='ScanBarcode' activeColor='#3CD9A4' barStyle={{ backgroundColor: "#3E4655" }}>
         <Tab.Screen
            name='ScanBarcode'
            component={ScanBarcode}
            options={{
               tabBarLabel: "סריקה",
               tabBarIcon: ({ color }) => <MaterialCommunityIcons name='barcode-scan' color={color} size={26} />,
            }}
         />
         <Tab.Screen
            name='SearchProduct'
            component={SearchProduct}
            options={{
               tabBarLabel: "חיפוש",
               tabBarIcon: ({ color }) => <MaterialCommunityIcons name='card-search-outline' color={color} size={26} />,
            }}
         />
         <Tab.Screen
            name='History'
            component={History}
            options={{
               tabBarLabel: "היסטוריה",
               tabBarIcon: ({ color }) => <MaterialCommunityIcons name='history' color={color} size={26} />,
            }}
         />
         <Tab.Screen
            name='SavedProducts'
            component={SavedProducts}
            options={{
               tabBarLabel: "שמורים",
               tabBarIcon: ({ color }) => <MaterialCommunityIcons name='star-outline' color={color} size={26} />,
            }}
         />
      </Tab.Navigator>
   );
}
