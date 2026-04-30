/**
 * Notification Service
 * Handles push notifications and daily reminders
 * Gracefully handles web platform where notifications aren't supported
 */
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Set notification handler to show notifications even when app is active
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Register for push notifications
 * Only works on physical devices, gracefully skips on web/emulator
 */
export async function registerForPushNotificationsAsync() {
  // Push notifications don't work on web
  if (Platform.OS === 'web') {
    console.log('Push notifications are not supported on web');
    return null;
  }

  let token = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Push notification permission not granted');
        return null;
      }

      // Use the project ID from Expo constants
      const projectId = Constants.expoConfig?.extra?.eas?.projectId 
        || Constants.easConfig?.projectId 
        || undefined;

      token = (await Notifications.getExpoPushTokenAsync({
        projectId,
      })).data;
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  } catch (error) {
    console.warn('Push notification registration failed:', error?.message);
  }

  return token;
}

/**
 * Schedule a daily reminder notification
 * Gracefully handles web and errors
 */
export async function scheduleDailyReminder() {
  // Skip on web — notifications not supported
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Cancel all previously scheduled notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your Future Self is Calling 🔮",
        body: "Take 5 minutes to chart your course for today. What's your next move?",
        sound: true,
      },
      trigger: {
        type: 'daily',
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  } catch (error) {
    // Non-critical failure — don't crash the app
    console.warn('Failed to schedule daily reminder:', error?.message);
  }
}
