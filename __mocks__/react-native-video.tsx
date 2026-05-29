import React from 'react';
import { View } from 'react-native';

const Video = React.forwardRef((props: any, ref: any) => {
  return <View ref={ref} {...props} />;
});

Video.displayName = 'Video';

export default Video;
