import moment from 'moment';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';

const getMomentDate = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date,
): moment.Moment => {
  if (timestamp instanceof Date) {
    return moment(timestamp);
  }
  if (timestamp && typeof (timestamp as any).toDate === 'function') {
    return moment((timestamp as FirebaseFirestoreTypes.Timestamp).toDate());
  }
  return moment(timestamp);
};

export const formatMessageTime = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date,
): string => {
  const momentDate = getMomentDate(timestamp);
  const now = moment();

  if (momentDate.isSame(now, 'day')) {
    return momentDate.format('h:mm A');
  }

  if (momentDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return `Yesterday ${momentDate.format('h:mm A')}`;
  }

  if (momentDate.isSame(now, 'year')) {
    return momentDate.format('MMM D, h:mm A');
  }

  return momentDate.format('MMM D, YYYY h:mm A');
};

export const formatLastSeen = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date | null,
): string => {
  if (!timestamp) {
    return 'Online';
  }

  const momentDate = getMomentDate(timestamp);
  const now = moment();

  if (momentDate.isSame(now, 'day')) {
    return `Last seen today at ${momentDate.format('h:mm A')}`;
  }

  if (momentDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return `Last seen yesterday at ${momentDate.format('h:mm A')}`;
  }

  if (momentDate.isSame(now, 'year')) {
    return `Last seen on ${momentDate.format('MMM D')} at ${momentDate.format(
      'h:mm A',
    )}`;
  }

  return `Last seen on ${momentDate.format(
    'MMM D, YYYY',
  )} at ${momentDate.format('h:mm A')}`;
};

export const formatConversationTime = (
  timestamp: FirebaseFirestoreTypes.Timestamp | number | Date,
): string => {
  const momentDate = getMomentDate(timestamp);
  const now = moment();

  if (momentDate.isSame(now, 'day')) {
    return momentDate.format('h:mm A');
  }

  if (momentDate.isSame(now.clone().subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }

  if (momentDate.isSame(now, 'year')) {
    return momentDate.format('MMM D');
  }

  return momentDate.format('MMM D, YYYY');
};
