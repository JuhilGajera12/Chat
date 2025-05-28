import React, {useState, useRef, useEffect} from 'react';
import {
  TextInput,
  StyleSheet,
  Image,
  Keyboard,
  Platform,
  Pressable,
  View,
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
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsFocused(true);
      },
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsFocused(false);
      },
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTextChange = (text: string) => {
    setMessage(text);
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

  const handleAttachmentPress = () => {
    onAttachmentPress();
  };

  return (
    <View style={styles.container}>
      {message.trim().length === 0 && (
        <View style={styles.attachmentButton}>
          <Pressable
            style={({pressed}) => [
              styles.attachmentButtonInner,
              pressed && styles.attachmentButtonPressed,
            ]}
            onPress={handleAttachmentPress}>
            <Image
              source={icons.attachment}
              style={styles.attachmentIcon}
              resizeMode="contain"
              tintColor={colors.primaryColor}
            />
          </Pressable>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={message}
          onChangeText={handleTextChange}
          placeholder="Type a message..."
          placeholderTextColor={colors.placeHolder}
          multiline
          maxLength={1000}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {message.trim().length > 0 && (
        <View style={styles.sendButtonContainer}>
          <Pressable
            style={({pressed}) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
            ]}
            onPress={handleSend}>
            <Image
              source={icons.send}
              style={styles.sendIcon}
              resizeMode="contain"
              tintColor={colors.white}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  attachmentButton: {
    width: wp(10),
    height: wp(10),
    marginRight: wp(2),
  },
  attachmentButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: wp(5),
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentButtonPressed: {
    opacity: 0.7,
  },
  attachmentIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: colors.primaryColor,
  },
  inputContainer: {
    flex: 1,
    marginRight: wp(2),
    backgroundColor: colors.inputBackground,
    borderRadius: hp(2),
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize(15),
    color: colors.black,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1),
    textAlignVertical: 'center',
  },
  sendButtonContainer: {
    width: wp(10),
    height: wp(10),
  },
  sendButton: {
    width: '100%',
    height: '100%',
    borderRadius: wp(5),
    backgroundColor: colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
  sendIcon: {
    width: wp(5),
    height: wp(5),
    tintColor: colors.white,
  },
});

export default ChatInput;
