import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  Typography, 
  Box,
  useTheme,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatPrice, formatPercentChange } from '../../utils/formatters';
import type { BasePriceCardProps } from './types';
import type { TickerData } from '../../types';

const CompactPriceCard: React.FC<BasePriceCardProps> = ({ 
  symbol, 
  data, 
  refreshing, 
  isFavorite = false,
  onFavoriteToggle
}) => {
  const theme = useTheme();
  const [animatePrice, setAnimatePrice] = useState(false);
  const [hovered, setHovered] = useState(false);
  const prevData = useRef<TickerData | null>(null);
  
  // Trigger price change animation when data changes
  useEffect(() => {
    if (prevData.current && data && prevData.current.c !== data.c) {
      setAnimatePrice(true);
      setTimeout(() => setAnimatePrice(false), 800); // Reduced from 1500ms to 800ms
    }
    
    prevData.current = data || null;
  }, [data]);

  if (!data || refreshing) {
    return null; // Skeleton handled by parent component
  }

  const isPositive = parseFloat(data.P) >= 0;
  const PriceChangeIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;
  const priceAnimClass = animatePrice ? (isPositive ? 'highlight-positive' : 'highlight-negative') : '';

  return (
    <Card
      tabIndex={0}
      role="button"
      aria-label={`${symbol} price card. Last price: ${formatPrice(data.c)}. Change: ${formatPercentChange(data.P)}`}
      sx={{
        mb: 1.5,
        minHeight: { xs: 70, sm: 74 },
        maxWidth: { xs: '100%', sm: 180 },
        width: '100%',
        p: { xs: 1.25, sm: 1.5 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        boxShadow: theme.shadows[1],
        borderRadius: { xs: 1.5, sm: 2 },
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: theme.palette.mode === 'dark' 
          ? alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.05)
          : alpha(isPositive ? theme.palette.success.light : theme.palette.error.light, 0.03),
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: isPositive ? theme.palette.success.main : theme.palette.error.main,
          opacity: 0,
          transition: 'opacity 0.2s',
        },
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
          transform: 'translateY(-2px)',
        },
        '&:hover': { 
          boxShadow: theme.shadows[4],
          transform: { xs: 'none', sm: 'translateY(-2px)' },
          '&:before': {
            opacity: 1,
          },
        },
        '@media (hover: none)': {
          // Show favorite icon on touch devices even without hover
          '& .favorite-icon': {
            opacity: 1,
            visibility: 'visible',
          },
          // Add active state for touch devices
          '&:active': {
            transform: 'scale(0.98)',
            boxShadow: theme.shadows[2],
            '&:before': {
              opacity: 1,
            },
          }
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        width: '100%',
        minWidth: 0 // Prevent flex items from overflowing
      }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.18rem' },
            letterSpacing: '0.3px',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.grey[900],
            minWidth: 0 // Prevent text from overflowing
          }}
        >
          {symbol}
        </Typography>
        {(hovered || isFavorite) && onFavoriteToggle && (
          <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onFavoriteToggle(symbol, !isFavorite);
              }}
              className="favorite-icon"
              sx={{ 
                ml: 0.5,
                opacity: { xs: 1, sm: hovered || isFavorite ? 1 : 0 },
                visibility: { xs: 'visible', sm: hovered || isFavorite ? 'visible' : 'hidden' },
                transition: 'opacity 0.2s, visibility 0.2s',
                p: { xs: 0.5, sm: 0.75 },
                flexShrink: 0 // Prevent button from shrinking
              }}
            >
              {isFavorite ? <StarIcon color="primary" fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between', 
        mt: 1,
        minWidth: 0 // Prevent flex items from overflowing
      }}>
        <Typography
          variant="h6"
          className={priceAnimClass}
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.18rem', md: '1.32rem' },
            color: theme.palette.mode === 'dark' ? theme.palette.grey[50] : theme.palette.grey[900],
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
            transition: 'color 0.2s',
            wordBreak: 'break-word',
            maxWidth: '60%',
            minWidth: 0, // Prevent text from overflowing
            mr: 0.5 // Add some margin to prevent text from touching the percentage
          }}
        >
          {formatPrice(data.c)}
        </Typography>
        
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            color: isPositive ? theme.palette.success.main : theme.palette.error.main,
            ml: 1,
            fontSize: { xs: '0.82rem', sm: '0.89rem', md: '0.97rem' },
            minWidth: { xs: 45, sm: 52 },
            textAlign: 'right',
            transition: 'color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            flexShrink: 0 // Prevent from shrinking
          }}
        >
          <PriceChangeIcon fontSize="small" />
          {formatPercentChange(data.P)}
        </Typography>
      </Box>
    </Card>
  );
};

export default CompactPriceCard;
