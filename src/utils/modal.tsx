import { Greenhouse , Field } from "../context/GreenHouse";

export interface BottomSheetModalProps {
    visible: boolean;
    onClose: () => void;
  }

  export interface ChangeAreaModalProps {
    visible: boolean;
    onClose: (area?: number) => void;
    areas: Field[];
    current: number;
  }

  export interface ChangeGreenhouseModalProps {
    visible: boolean;
    onClose: (area?:Greenhouse) => void;
    areas: Greenhouse[];
    current: Greenhouse;
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