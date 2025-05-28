import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

const getDate = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date,
): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (
    timestamp &&
    typeof (timestamp as FirebaseFirestoreTypes.Timestamp).toDate === 'function'
  ) {
    return (timestamp as FirebaseFirestoreTypes.Timestamp).toDate();
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  try {
    return new Date(timestamp as any);
  } catch {
    return new Date();
  }
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isSameYear = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear();
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDate = (date: Date, includeTime: boolean = false): string => {
  const month = date.toLocaleString('default', {month: 'short'});
  const day = date.getDate();
  const year = date.getFullYear();
  const time = includeTime ? ` ${formatTime(date)}` : '';

  return `${month} ${day}${
    year !== new Date().getFullYear() ? `, ${year}` : ''
  }${time}`;
};

export const formatMessageTime = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date,
): string => {
  const date = getDate(timestamp);
  const now = new Date();

  if (isSameDay(date, now)) {
    return formatTime(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Yesterday ${formatTime(date)}`;
  }

  if (isSameYear(date, now)) {
    return formatDate(date, true);
  }

  return formatDate(date, true);
};

export const formatLastSeen = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date | null,
): string => {
  if (!timestamp) {
    return 'Online';
  }

  const date = getDate(timestamp);
  const now = new Date();

  if (isSameDay(date, now)) {
    return `Last seen today at ${formatTime(date)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return `Last seen yesterday at ${formatTime(date)}`;
  }

  if (isSameYear(date, now)) {
    return `Last seen on ${formatDate(date)} at ${formatTime(date)}`;
  }

  return `Last seen on ${formatDate(date)} at ${formatTime(date)}`;
};

export const formatConversationTime = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date,
): string => {
  const date = getDate(timestamp);
  const now = new Date();

  if (isSameDay(date, now)) {
    return formatTime(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  if (isSameYear(date, now)) {
    return formatDate(date);
  }

  return formatDate(date);
};
