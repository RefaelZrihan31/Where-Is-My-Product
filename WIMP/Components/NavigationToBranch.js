import { StyleSheet, Text, View, SafeAreaView, Linking } from "react-native";
import React from "react";
import { Divider } from "@rneui/themed";
import { Button } from "@rneui/base";
import { useNavigation } from "@react-navigation/native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import * as Device from "expo-device";

export default function NavigationToBranch({ route }) {
   const navigation = useNavigation();

   const { location, rangeKm, branchCordLatitude, branchCordLongitude, branchName, branchLink, branchAddress, companyName } = route.params;

   return (
      <SafeAreaView style={styles.container}>
         {location ? (
            <MapView
               style={styles.map}
               provider={PROVIDER_GOOGLE}
               region={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.0911,
                  longitudeDelta: 0.0911,
               }}
               showsUserLocation={true}>
               <Marker
                  coordinate={{
                     latitude: branchCordLatitude,
                     longitude: branchCordLongitude,
                  }}
                  title={companyName + " " + branchName}
               />
               <Polyline
                  coordinates={[
                     {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                     },
                     { latitude: branchCordLatitude, longitude: branchCordLongitude },
                  ]}
                  strokeColor='#0f4d6d'
                  strokeWidth={6}
               />
            </MapView>
         ) : null}
         <Divider
            style={{ width: "90%", margin: 15 }}
            color='rgb(4,207,146)'
            insetType='left'
            subHeaderStyle={{}}
            width={1}
            orientation='horizontal'
         />
         <View>
            <View
               style={{
                  width: 380,
                  height: 200,
                  marginVertical: 6,
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "rgb(92,96,106)",
                  borderRadius: 15,
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
                        justifyContent: "flex-start",
                        alignItems: "flex-start",
                     }}>
                     <Text
                        style={{
                           fontSize: 20,
                           color: "rgb(4,207,146)",
                           textAlign: "center",
                           justifyContent: "flex-start",
                           fontWeight: "bold",
                        }}>
                        סניף {branchName} של חברת {companyName} כ- {rangeKm}km ממיקומך
                     </Text>
                  </View>
               </View>
               <View
                  style={{
                     flex: 1,
                     justifyContent: "space-around",
                  }}>
                  <Text
                     style={{
                        alignSelf: "center",
                        fontSize: 14,
                        color: "white",
                     }}>
                     כתובת : {branchAddress}
                  </Text>

                  <View
                     style={{
                        flexDirection: "column",
                        alignItems: "center",
                     }}>
                     <Button
                        title={"ניווט לסניף"}
                        color='rgb(4,207,146)'
                        size='lg'
                        radius='lg'
                        onPress={() => Linking.openURL("https://" + branchLink)}
                     />
                  </View>
               </View>
            </View>
         </View>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: "rgb(40,47,59)",
      alignItems: "center",
   },
   map: {
      width: 380,
      height: Platform.OS === "android" ? 480 : 520,
   },
});
