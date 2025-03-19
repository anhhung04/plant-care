export interface BottomSheetModalProps {
    visible: boolean;
    onClose: () => void;
    notification: NotificationItem[];
    reminder: ReminderItem[];
  }

  export interface ChangeAreaModalProps {
    visible: boolean;
    onClose: () => void;
    areas: string[];
    current: string;
  }

  export interface CreateReminderModalProps {
    visible: boolean;
    onClose: () => void;
  }
  
  // Định nghĩa item thông báo
  export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    time: string;
  }
  
  // Định nghĩa item lời nhắc
 export interface ReminderItem {
    id: string;
    title: string;
    dueDate: string;
    completed: boolean;
  }