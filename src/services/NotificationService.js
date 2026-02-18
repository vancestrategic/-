import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  // Request permissions
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted!');
      return false;
    }
    return true;
  },

  // Schedule a local notification
  scheduleMedicineNotification: async (medicineName, time, medicineId) => {
    // time format: "HH:mm" (e.g., "14:30")
    const [hours, minutes] = time.split(':').map(Number);
    
    const triggerDate = new Date();
    triggerDate.setHours(hours);
    triggerDate.setMinutes(minutes);
    triggerDate.setSeconds(0);

    // If time has passed for today, schedule for tomorrow
    if (triggerDate <= new Date()) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: "İlaç Vakti!",
        body: `${medicineName} ilacınızı alma zamanı geldi.`,
        sound: true,
        data: { medicineId, medicineName },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        repeats: true,
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      },
    });

    return identifier;
  },

  // Cancel a specific notification
  cancelNotification: async (identifier) => {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  },

  // Cancel all notifications
  cancelAllNotifications: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
};
