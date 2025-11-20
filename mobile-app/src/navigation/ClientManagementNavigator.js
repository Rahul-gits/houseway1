import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';

// Import screens - we'll create these next
import HomeDashboardScreen from '../screens/clientManagement/HomeDashboardScreen';
import ClientsListScreen from '../screens/clientManagement/ClientsListScreen';
import ClientProfileScreen from '../screens/clientManagement/ClientProfileScreen';
import ProjectListScreen from '../screens/clientManagement/ProjectListScreen';
import ProjectDetailScreen from '../screens/clientManagement/ProjectDetailScreen';
import AddTimelineEventScreen from '../screens/clientManagement/AddTimelineEventScreen';
import UploadMediaScreen from '../screens/clientManagement/UploadMediaScreen';
import CreateInvoiceScreen from '../screens/clientManagement/CreateInvoiceScreen';

// Import theme
import { colors, typography } from '../styles/theme';

const Stack = createStackNavigator();

// Custom header button component
const HeaderButton = ({ onPress, title, color = colors.blue[500] }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.beige[100],
    }}
  >
    <Text style={{
      fontFamily: typography.fontFamily.medium,
      fontSize: typography.fontSizes.sm,
      color: color,
      fontWeight: '600',
    }}>
      {title}
    </Text>
  </TouchableOpacity>
);

const ClientManagementNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.beige[100],
          borderBottomWidth: 1,
          borderBottomColor: colors.beige[300],
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.text.primary,
        headerTitleStyle: {
          fontFamily: typography.fontFamily.heading,
          fontSize: typography.fontSizes.lg,
          fontWeight: '700',
        },
        headerBackTitleVisible: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 250,
              useNativeDriver: true,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 200,
              useNativeDriver: true,
            },
          },
        },
      }}
    >
      <Stack.Screen
        name="HomeDashboard"
        component={HomeDashboardScreen}
        options={{
          title: 'Client Management',
          headerStyle: {
            backgroundColor: colors.blue[500],
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: colors.text.white,
          headerTitleStyle: {
            fontFamily: typography.fontFamily.display,
            fontSize: typography.fontSizes.xl,
            fontWeight: '800',
          },
          headerLeft: null,
          gestureEnabled: false,
        }}
      />

      <Stack.Screen
        name="ClientsList"
        component={ClientsListScreen}
        options={{
          title: 'Clients',
          headerRight: () => (
            <HeaderButton title="Add" />
          ),
        }}
      />

      <Stack.Screen
        name="ClientProfile"
        component={ClientProfileScreen}
        options={{
          title: 'Client Profile',
          headerRight: () => (
            <HeaderButton title="Edit" />
          ),
        }}
      />

      <Stack.Screen
        name="ProjectList"
        component={ProjectListScreen}
        options={{
          title: 'Projects',
          headerRight: () => (
            <HeaderButton title="Create" />
          ),
        }}
      />

      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{
          title: 'Project Details',
          headerRight: () => (
            <HeaderButton title="Options" />
          ),
        }}
      />

      <Stack.Screen
        name="AddTimelineEvent"
        component={AddTimelineEventScreen}
        options={{
          title: 'Add Update',
          presentation: 'modal',
          headerShown: true,
          headerRight: () => (
            <HeaderButton title="Save" />
          ),
        }}
      />

      <Stack.Screen
        name="UploadMedia"
        component={UploadMediaScreen}
        options={{
          title: 'Upload Media',
          presentation: 'modal',
          headerRight: () => (
            <HeaderButton title="Upload" />
          ),
        }}
      />

      <Stack.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{
          title: 'Create Invoice',
          presentation: 'modal',
          headerRight: () => (
            <HeaderButton title="Send" />
          ),
        }}
      />
    </Stack.Navigator>
  );
};

export default ClientManagementNavigator;