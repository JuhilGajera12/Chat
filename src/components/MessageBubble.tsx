import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import {ChatMessage} from '../types/chat';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {icons} from '../constant/icons';
import {formatMessageTime} from '../utils/dateUtils';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
  onLongPress?: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  onLongPress,
}) => {
  const renderMessageStatus = () => {
    if (!isOwnMessage) {
      return null;
    }

    switch (message.status) {
      case 'sent':
        return <Image source={icons.sent} style={styles.statusIcon} />;
      case 'delivered':
        return <Image source={icons.delivered} style={styles.statusIcon} />;
      case 'read':
        return (
          <View style={styles.statusContainer}>
            <Image
              source={icons.delivered}
              style={[styles.statusIcon, styles.readIcon]}
            />
            <Text style={styles.readText}>Read</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const renderMessageContent = () => {
    switch (message.type) {
      case 'text':
        return (
          <Text
            style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
            ]}>
            {message.text}
          </Text>
        );
      case 'image':
        return (
          <Pressable onLongPress={onLongPress}>
            <Image
              source={{uri: message.metadata?.fileUrl}}
              style={styles.messageImage}
              resizeMode="cover"
            />
          </Pressable>
        );
      case 'file':
        return (
          <Pressable onLongPress={onLongPress} style={styles.fileContainer}>
            <View style={styles.fileIconContainer}>
              <Image source={icons.file} style={styles.fileIcon} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {message.metadata?.fileName}
              </Text>
              <Text style={styles.fileSize}>
                {(message.metadata?.fileSize || 0) / 1024} KB
              </Text>
            </View>
          </Pressable>
        );
      default:
        return null;
    }
  };

  return (
    <Pressable
      onLongPress={onLongPress}
      style={({pressed}) => [
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
        pressed && styles.pressed,
      ]}>
      {renderMessageContent()}
      <View style={styles.footer}>
        <Text
          style={[
            styles.timestamp,
            isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp,
          ]}>
          {formatMessageTime(message.timestamp)}
        </Text>
        {renderMessageStatus()}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: hp(0.5),
    padding: wp(3),
    borderRadius: hp(2),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    opacity: 0.8,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryColor,
    borderBottomRightRadius: hp(0.5),
    marginLeft: wp(15),
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.inputBackground,
    borderBottomLeftRadius: hp(0.5),
    marginRight: wp(15),
  },
  messageText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(15),
    lineHeight: fontSize(22),
    letterSpacing: 0.2,
  },
  ownMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.black,
  },
  messageImage: {
    width: wp(60),
    height: wp(40),
    borderRadius: hp(1),
    backgroundColor: colors.border,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: wp(3),
    borderRadius: hp(1),
    minWidth: wp(50),
  },
  fileIconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  fileIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: colors.primaryColor,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: fonts.bold,
    fontSize: fontSize(14),
    color: colors.black,
  },
  fileSize: {
    fontFamily: fonts.regular,
    fontSize: fontSize(12),
    color: colors.placeHolder,
    marginTop: hp(0.5),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: hp(0.5),
  },
  timestamp: {
    fontFamily: fonts.regular,
    fontSize: fontSize(11),
    marginRight: wp(1),
    opacity: 0.8,
  },
  ownTimestamp: {
    color: colors.white,
  },
  otherTimestamp: {
    color: colors.placeHolder,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: wp(4),
    height: wp(4),
    tintColor: colors.white,
  },
  readIcon: {
    tintColor: colors.success,
  },
  readText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(10),
    color: colors.success,
    marginLeft: wp(1),
  },
});

export default MessageBubble;
