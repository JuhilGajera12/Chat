import moment from 'moment';

export const toMoment = (timestamp: any): moment.Moment => {
  if (timestamp instanceof Date) {
    return moment(timestamp);
  }
  if (typeof timestamp === 'number') {
    return moment(timestamp);
  }
  return moment(timestamp);
};

export const toTimestampNumber = (momentObj: moment.Moment): number => {
  return momentObj.valueOf();
}; 