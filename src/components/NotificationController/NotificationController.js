import React, { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useToast } from '../../contexts/ToastContext';
import MedicineReminderModal from '../MedicineReminderModal/MedicineReminderModal';

const NotificationController = () => {
  const { showToast } = useToast();
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderMedicineName, setReminderMedicineName] = useState('');

  useEffect(() => {
    // Listener for foreground notifications
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      const { data } = notification.request.content;
      
      // Check if it's a medicine notification
      if (data && (data.medicineId || data.medicineName)) {
         setReminderMedicineName(data.medicineName || 'İlaç');
         setReminderVisible(true);
      }
    });

    // Listener for user interacting with notification (tapping it)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { data } = response.notification.request.content;
      
      if (data && (data.medicineId || data.medicineName)) {
         setReminderMedicineName(data.medicineName || 'İlaç');
         setReminderVisible(true);
      }
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const handleTaken = () => {
    setReminderVisible(false);
    showToast('İlaç alındı olarak işaretlendi', 'success');
    // Note: Actual data update happens when user opens app or we could add a service method to update storage here
  };

  const handleSnooze = () => {
    setReminderVisible(false);
  };

  return (
    <MedicineReminderModal
      visible={reminderVisible}
      medicineName={reminderMedicineName}
      onTaken={handleTaken}
      onSnooze={handleSnooze}
    />
  );
};

export default NotificationController;
