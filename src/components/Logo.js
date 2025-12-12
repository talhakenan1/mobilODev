import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, G, Path } from 'react-native-svg';

const Logo = ({ width = 150, height = 150 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 512 512">
      <Defs>
        <LinearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#4CAF50" stopOpacity="1" />
          <Stop offset="100%" stopColor="#00897B" stopOpacity="1" />
        </LinearGradient>
      </Defs>

      {/* Background Layer */}
      <Rect width="512" height="512" rx="115" ry="115" fill="url(#bgGradient)" />

      {/* Foreground Group (Centered) */}
      <G transform="translate(256, 256)">
        
        {/* Ring: 12 drops/lines */}
        <G id="ring" fill="white">
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(0)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(30)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(60)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(90)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(120)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(150)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(180)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(210)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(240)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(270)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(300)" />
            <Rect x="-6" y="-160" width="12" height="40" rx="6" ry="6" transform="rotate(330)" />
        </G>

        {/* Center Icon: Checkmark */}
        <Path 
          d="M -60 10 L -15 65 L 75 -55" 
          stroke="white" 
          strokeWidth="28" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </G>
    </Svg>
  );
};

export default Logo;

