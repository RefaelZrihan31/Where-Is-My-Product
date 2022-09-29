import { I18nManager } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Navbar from "./Components/Navbar";
import ProductPage from "./Components/ProductPage";
import Branches from "./Components/Branches";
import NavigationToBranch from "./Components/NavigationToBranch";
import * as Notifications from 'expo-notifications';
import UserContextProvider from './Context/UserContext';

I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <UserContextProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Navbar"
            component={Navbar}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="ProductPage"
            component={ProductPage}
            options={{
              headerStyle: {
                backgroundColor: "#rgb(40,47,59)",
              },
              headerTitle: "",
              headerBackTitleVisible: false,
            }}
          />

          <Stack.Screen
            name="Branches"
            component={Branches}
            screenOptions={{ presentation: "modal" }}
            options={{
              headerStyle: {
                backgroundColor: "#rgb(40,47,59)",
              },
              headerTintColor: "rgb(4,207,146)",
              headerBackTitleVisible: false,
            }}
          />

          <Stack.Screen
            name="NavigationToBranch"
            component={NavigationToBranch}
            screenOptions={{ presentation: "modal" }}
            options={{

              headerStyle: {
                backgroundColor: "#rgb(40,47,59)",
              },
              headerTintColor: "rgb(4,207,146)",
              headerBackTitleVisible: false,
              title: "נווט לסניף"
            }}
          />

        </Stack.Navigator>
      </NavigationContainer>
    </UserContextProvider>
  );
}
