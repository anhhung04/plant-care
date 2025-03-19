export interface ReminderType {
    id: string;
    title: string;
    higherThan: number;
    lowerThan: number;
    repeatAfter: number;
    active: boolean;
}

export interface ReminderCreate{
    title: string;
    higherThan: number;
    lowerThan: number;
    repeatAfter: number;
}