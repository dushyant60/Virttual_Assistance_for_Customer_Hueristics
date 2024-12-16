import React from 'react';
import { ResponsiveContainer, Sector, Text } from 'recharts';

const data = [
  { value: 50, color: '#8884d8' }, // You can set your desired value here
];

const Charts = (props) => {
  const centerX = 100;
  const centerY = 100;
  const radius = 100;

  const renderSector = (startAngle, endAngle, fill) => {
    return (
      <Sector
        cx={centerX}
        cy={centerY}
        innerRadius={90}
        outerRadius={radius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        key={fill}
      />
    );
  };

  const totalValue = 100; // The total value of the gauge (0 to 100)
  const value = props.value;
  const startAngleValue = 0; // Start angle for 0% value
  const endAngleValue = (value / totalValue) * 180; // Calculate the end angle based on the value

  const startAngleRest = endAngleValue; // Start angle for the remaining part of the gauge
  const endAngleRest = 180; // End angle for the remaining part of the gauge

  return (
    <ResponsiveContainer width="100%" height={250} style={{ marginBottom: '-80px' }}>
      <svg width="100%" height="100%">
        {renderSector(startAngleValue, endAngleValue, props.color)}
        {renderSector(startAngleRest, endAngleRest, 'lightgray')} {/* Color for the remaining part */}
        <Text x={centerX} y={centerY} textAnchor="middle" fontSize={20} fill="black">
          {props.value}
        </Text>
        <Text x={centerX} y={centerY + 30} textAnchor="middle" fontSize={12} fill="black">
          {props.text}
        </Text>
      </svg>
    </ResponsiveContainer>
  );
};

export default Charts;
