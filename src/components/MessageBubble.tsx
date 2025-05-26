import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {ChatMessage} from '../types/chat';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {icons} from '../constant/icons';
import {formatMessageTime} from '../utils/dateUtils';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  const renderMessageStatus = () => {
    if (!isOwnMessage) return null;

    switch (message.status) {
      case 'sent':
        return <Image source={icons.sent} style={styles.statusIcon} />;
      case 'delivered':
        return <Image source={icons.delivered} style={styles.statusIcon} />;
      case 'read':
        return (
          <View style={styles.statusContainer}>
            <Image source={icons.delivered} style={[styles.statusIcon, styles.readIcon]} />
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
          <Image
            source={{uri: message.metadata?.fileUrl}}
            style={styles.messageImage}
            resizeMode="cover"
          />
        );
      case 'file':
        return (
          <View style={styles.fileContainer}>
            <Text style={styles.fileName}>{message.metadata?.fileName}</Text>
            <Text style={styles.fileSize}>
              {(message.metadata?.fileSize || 0) / 1024} KB
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}>
      {renderMessageContent()}
      <View style={styles.footer}>
        <Text style={[
          styles.timestamp,
          isOwnMessage ? styles.ownTimestamp : styles.otherTimestamp
        ]}>
          {formatMessageTime(message.timestamp)}
        </Text>
        {renderMessageStatus()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    marginVertical: hp(0.5),
    padding: wp(3),
    borderRadius: hp(1.5),
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryColor,
    borderBottomRightRadius: hp(0.5),
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.placeHolder,
    borderBottomLeftRadius: hp(0.5),
  },
  messageText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
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
  },
  fileContainer: {
    backgroundColor: colors.white,
    padding: wp(3),
    borderRadius: hp(1),
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
    fontSize: fontSize(10),
    marginRight: wp(1),
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
