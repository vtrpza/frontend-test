import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine
} from 'recharts';
import { Box, useTheme, IconButton, Fade } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

// Mock data generator for the chart
const generateMockPriceData = (_symbolSeed: string, dataPoints: number = 24) => {
  // Use symbol as a seed for consistent randomization per symbol
  const seedValue = _symbolSeed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const basePrice = (seedValue % 100) * 250 + 5000; // Random starting price based on symbol
  const volatility = Math.random() * 0.05 + 0.01; // Random volatility between 1-6%
  
  return Array.from({ length: dataPoints }).map((_, index) => {
    // Generate a price that follows a random walk
    const change = basePrice * volatility * (Math.random() - 0.5);
    const price = basePrice + change * (index + 1);
    
    return {
      time: new Date(Date.now() - (dataPoints - index) * 3600 * 1000).toISOString().substring(11, 16),
      price
    };
  });
};

interface MiniChartProps {
  symbol: string;
  priceChange: string;
  height?: number;
  width?: number;
  showAxes?: boolean;
  showTooltip?: boolean;
  interactive?: boolean;
}

const MiniChart: React.FC<MiniChartProps> = ({
  symbol,
  priceChange,
  height = 80,
  width = '100%',
  showAxes = false,
  showTooltip = false,
  interactive = false
}) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);
  
  // Generate data only once for the symbol
  const data = useMemo(
    () => generateMockPriceData(symbol, zoomedIn ? 48 : 24),
    [symbol, zoomedIn]
  );
  
  const isPositive = parseFloat(priceChange) >= 0;
  
  const chartColor = isPositive 
    ? theme.palette.success.main 
    : theme.palette.error.main;
    
  // Calculate domain for Y axis
  const minPrice = useMemo(() => Math.min(...data.map(d => d.price)) * 0.999, [data]);
  const maxPrice = useMemo(() => Math.max(...data.map(d => d.price)) * 1.001, [data]);
  
  // Find the average price for reference line
  const avgPrice = useMemo(
    () => data.reduce((sum, item) => sum + item.price, 0) / data.length,
    [data]
  );
  
  return (
    <Box 
      sx={{ 
        height: zoomedIn ? height * 1.5 : height, 
        width, 
        mt: 1,
        position: 'relative',
        transition: 'height 0.3s ease'
      }}
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
    >
      {interactive && (
        <Fade in={hovered || zoomedIn}>
          <IconButton 
            size="small" 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              zIndex: 2,
              opacity: 0.7,
              backgroundColor: theme.palette.background.paper,
              '&:hover': { opacity: 1 }
            }}
            onClick={() => setZoomedIn(!zoomedIn)}
          >
            {zoomedIn ? <ZoomOutIcon fontSize="small" /> : <ZoomInIcon fontSize="small" />}
          </IconButton>
        </Fade>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 2, right: 0, left: 0, bottom: 0 }}
        >
          {showAxes && (
            <>
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                hide={!showAxes}
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
            </>
          )}
          
          {/* Always create Tooltip but conditionally activate it */}
          <Tooltip
            active={showTooltip || (interactive && (hovered || zoomedIn))}
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            labelStyle={{ color: theme.palette.text.primary }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => `Time: ${label}`}
            cursor={{ stroke: theme.palette.divider, strokeWidth: 1, strokeDasharray: '3 3' }}
          />
          
          {/* Reference line for average price */}
          {(showAxes || (interactive && zoomedIn)) && (
            <ReferenceLine 
              y={avgPrice} 
              stroke={theme.palette.divider} 
              strokeDasharray="3 3" 
              strokeWidth={1}
              label={{
                value: `Avg: $${avgPrice.toFixed(2)}`,
                position: 'insideTopLeft',
                fill: theme.palette.text.secondary,
                fontSize: 10
              }}
            />
          )}
          
          <defs>
            <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          
          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={2}
            fill={`url(#gradient-${symbol})`}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default MiniChart;
