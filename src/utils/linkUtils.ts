import {Share} from 'react-native';

const APP_URL_SCHEME = 'exmaple://';

export const generateShareableLink = (type: 'task' | 'post', id: string) => {
  const baseUrl = APP_URL_SCHEME;

  const path = type === 'task' ? 'task' : 'post';
  return `${baseUrl}${path}/${id}`;
};

export const handleShare = async (type: 'task' | 'post', id: string) => {
  try {
    const shareableLink = generateShareableLink(type, id);
    const message =
      type === 'task'
        ? `Check out this task: ${shareableLink}`
        : `Check out this post: ${shareableLink}`;

    await Share.share({
      message,
      url: shareableLink,
      title: type === 'task' ? 'Share Task' : 'Share Post',
    });
  } catch (error) {
    console.error('Error sharing:', error);
  }
};
