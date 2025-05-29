import React, {useEffect} from 'react';
import {View, StyleSheet, Text, ActivityIndicator, TouchableOpacity} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {fetchPostById, clearCurrentPost} from '../store/slices/postSlice';
import {handleShare} from '../utils/linkUtils';

type PostDetailsRouteProp = RouteProp<RootStackParamList, 'PostDetails'>;

const PostDetails = () => {
  const route = useRoute<PostDetailsRouteProp>();
  const {postId} = route.params;
  const dispatch = useAppDispatch();
  const {currentPost, loading, error} = useAppSelector(state => state.posts);

  useEffect(() => {
    dispatch(fetchPostById(postId));
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, postId]);

  const onShare = () => {
    if (currentPost) {
      handleShare('post', currentPost.id);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentPost) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Post Details</Text>
        <TouchableOpacity onPress={onShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.idText}>Post ID: {currentPost.id}</Text>
        <Text style={styles.creatorText}>Creator: {currentPost.creator}</Text>
        <Text style={styles.postText}>{currentPost.post}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  shareButton: {
    padding: wp(2),
    backgroundColor: colors.primaryColor,
    borderRadius: wp(2),
  },
  shareButtonText: {
    color: colors.white,
    fontSize: fontSize(14),
    fontFamily: fonts.regular,
  },
  content: {
    flex: 1,
    padding: wp(4),
  },
  title: {
    fontSize: fontSize(24),
    fontFamily: fonts.bold,
    color: colors.black,
    marginBottom: hp(2),
  },
  idText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: hp(1),
  },
  creatorText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.gray,
    marginBottom: hp(1),
  },
  postText: {
    fontSize: fontSize(18),
    fontFamily: fonts.regular,
    color: colors.black,
    marginTop: hp(2),
    textAlign: 'center',
  },
  errorText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.error,
    textAlign: 'center',
  },
});

export default PostDetails;
