import React, {useState, useRef} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Keyboard,
} from 'react-native';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {icons} from '../constant/icons';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onAttachmentPress: () => void;
  onTyping: (isTyping: boolean) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onAttachmentPress,
  onTyping,
}) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleTextChange = (text: string) => {
    setMessage(text);
    onTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      onTyping(false);
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.attachmentButton}
        onPress={onAttachmentPress}>
        <Image
          source={icons.attachment}
          style={styles.attachmentIcon}
          resizeMode="contain"
          tintColor={colors.primaryColor}
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={message}
        onChangeText={handleTextChange}
        placeholder="Type a message..."
        placeholderTextColor={colors.placeHolder}
        multiline
        maxLength={1000}
      />

      <TouchableOpacity
        style={[styles.sendButton]}
        onPress={handleSend}
        disabled={!message.trim()}>
        <Image
          source={icons.send}
          style={styles.sendIcon}
          resizeMode="contain"
          tintColor={colors.primaryColor}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  attachmentButton: {
    padding: wp(2),
    marginRight: wp(2),
  },
  attachmentIcon: {
    width: wp(6),
    height: wp(6),
    tintColor: colors.primaryColor,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.black,
    maxHeight: hp(12),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    backgroundColor: colors.inputBackground,
    borderRadius: hp(2),
    marginRight: wp(2),
  },
  sendButton: {
    padding: wp(2),
    backgroundColor: colors.primaryColor,
    borderRadius: wp(4),
    width: wp(10),
    height: wp(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: colors.white,
  },
  sendIconDisabled: {
    tintColor: colors.placeHolder,
  },
});

export default ChatInput;
