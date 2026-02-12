import React, {useMemo, useRef, useState} from 'react';
import {PanResponder, StyleSheet, View} from 'react-native';
import Svg, {Polygon} from 'react-native-svg';
import {COLORS} from '../../constants/colors';

const HANDLE_SIZE = 22;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const PerspectiveOverlay = ({points, onChange, enabled = true}) => {
  const [layout, setLayout] = useState({width: 1, height: 1});
  const startPointsRef = useRef(points);

  const responders = useMemo(
    () =>
      points.map((_, index) =>
        PanResponder.create({
          onStartShouldSetPanResponder: () => enabled,
          onMoveShouldSetPanResponder: () => enabled,
          onPanResponderGrant: () => {
            startPointsRef.current = points;
          },
          onPanResponderMove: (_event, gesture) => {
            const start = startPointsRef.current[index];
            if (!start || !layout.width || !layout.height) {
              return;
            }

            const next = points.map((point, pointIndex) => {
              if (pointIndex !== index) {
                return point;
              }
              return {
                x: clamp(start.x + gesture.dx / layout.width, 0, 1),
                y: clamp(start.y + gesture.dy / layout.height, 0, 1),
              };
            });
            onChange(next);
          },
        }),
      ),
    [enabled, layout.height, layout.width, onChange, points],
  );

  const polygonPoints = points
    .map(point => `${Math.round(point.x * layout.width)},${Math.round(point.y * layout.height)}`)
    .join(' ');

  return (
    <View
      style={styles.container}
      onLayout={event => setLayout(event.nativeEvent.layout)}
      pointerEvents={enabled ? 'auto' : 'none'}>
      <Svg style={StyleSheet.absoluteFill}>
        <Polygon
          points={polygonPoints}
          fill="rgba(25, 118, 210, 0.24)"
          stroke={COLORS.primary}
          strokeWidth={2}
        />
      </Svg>

      {points.map((point, index) => (
        <View
          key={`handle-${index}`}
          {...responders[index].panHandlers}
          style={[
            styles.handle,
            {
              left: point.x * layout.width - HANDLE_SIZE / 2,
              top: point.y * layout.height - HANDLE_SIZE / 2,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  handle: {
    position: 'absolute',
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: COLORS.accent,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
});

export default PerspectiveOverlay;
