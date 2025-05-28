import React, {useEffect} from 'react';
import {View, StyleSheet, Text, ActivityIndicator} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {SafeAreaView} from 'react-native-safe-area-context';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {fetchPostById, clearCurrentPost} from '../store/slices/postSlice';

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
      <View style={styles.content}>
        <Text style={styles.title}>Post Details</Text>
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
  content: {
    flex: 1,
    padding: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
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
