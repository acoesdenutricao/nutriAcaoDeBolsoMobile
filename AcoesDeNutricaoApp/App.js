import React from 'react';
import { Appbar, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';


//Screens
import Home from './src/screens/Home.js';
import Favorites from './src/screens/Favorites.js';
import Documents from './src/screens/Documents.js';
import References from './src/screens/References.js';
import Information from './src/screens/Information.js';
import InformationOffline from './src/screens/InformationOffline.js';


//Tema configs
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#379F94',
    accent: '#f1c40f',
  },
};

//navigations
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

//pilha para navegação da aba documentos
function DocumentsStack() {
  return (
    <Stack.Navigator
      initialRouteName="Documents"
      screenOptions={{
        header: (props) => <CustomNavigationBar {...props} />,
      }}>
      <Stack.Screen name="Documents" component={Documents}
        options={{
          title: 'Documentos',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff'
        }} />
      <Stack.Screen name="Referencias" component={References}
        options={{
          title: 'Referências',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff'
        }} />
    </Stack.Navigator>
  );
}

//pilha para navegação da aba ações de nutrição (home)
function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        header: (props) => <CustomNavigationBar {...props} />,
        tabBarOptions: false,
      })
      }>
      <Stack.Screen name="Home" component={Home}
        options={{
          title: 'NutriAção de Bolso',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff'
          }}
        />
      <Stack.Screen name="Information" component={Information}
        options={{
          title: 'Ações Universais',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff'
          }} 
        />
      <Stack.Screen name="InformationOffline" component={InformationOffline}
        options={{
          title: 'Ações Universais',
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff'
          }} 
        />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="NutriAção de Bolso"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size}) => {
              let iconName;

              if (route.name === 'NutriAção de Bolso') {
                iconName = focused
                  ? 'clipboard'
                  : 'clipboard';
              }
              if (route.name === 'Documentos') {
                iconName = focused
                  ? 'document-text-outline'
                  : 'document-text-outline';
              }
              else if (route.name === 'Favoritos') {
                iconName = focused ? 'star' : 'star';
              }

              // You can return any component that you like here!
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
          tabBarOptions={{
            activeTintColor: '#3c9891',
            inactiveTintColor: 'gray',
            style:{
              height: 60,
              paddingBottom: 5,
            },
            labelStyle: {
              fontSize: 12,
            },
          }}
        >
          <Tab.Screen name="Favoritos" component={Favorites} />
          <Tab.Screen name="NutriAção de Bolso" component={HomeStack} />
          <Tab.Screen name="Documentos" component={DocumentsStack} />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

//configurações da app bar geral
function CustomNavigationBar({ navigation, previous }) {
  return (
    <Appbar.Header >
      {previous ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title="NutriAção de Bolso" />
    </Appbar.Header>
  );
}