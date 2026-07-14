import React, { memo, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Text } from '../components/I18nPrimitives';

function AutoMarqueeText({ children, style, textStyle, duration = 6000 }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  const shouldScroll = textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);

    if (!shouldScroll) return undefined;

    const distance = textWidth - containerWidth + 18;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(translateX, {
          toValue: -distance,
          duration: Math.max(duration, distance * 90),
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(700),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [containerWidth, duration, shouldScroll, textWidth, translateX]);

  return (
    <View
      style={[styles.container, style]}
      onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
    >
      <Animated.Text
        numberOfLines={1}
        style={[textStyle, shouldScroll && { transform: [{ translateX }] }]}
      >
        {children}
      </Animated.Text>
      <Text
        numberOfLines={1}
        pointerEvents="none"
        onLayout={event => setTextWidth(event.nativeEvent.layout.width)}
        style={[textStyle, styles.measureText]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  measureText: {
    opacity: 0,
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default memo(AutoMarqueeText);
