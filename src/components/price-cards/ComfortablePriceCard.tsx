import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Tooltip,
  IconButton,
  CardHeader,
  Divider,
  useTheme,
  Switch,
  FormControlLabel,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatPrice, formatPercentChange, getPriceChangeClass, formatTimestamp } from '../../utils/formatters';
import MiniChart from '../MiniChart';
import type { BasePriceCardProps } from './types';
import type { TickerData } from '../../types';

const ComfortablePriceCard: React.FC<BasePriceCardProps> = ({ 
  symbol, 
  data, 
  refreshing,
  isFavorite = false,
  onFavoriteToggle
}) => {
  const theme = useTheme();
  const [animatePrice, setAnimatePrice] = useState(false);
  const [animateBid, setAnimateBid] = useState(false);
  const [animateAsk, setAnimateAsk] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevData = useRef<TickerData | null>(null);
  
  // Trigger price change animation when data changes
  useEffect(() => {
    if (prevData.current && data) {
      // Animate price change
      if (prevData.current.c !== data.c) {
        setAnimatePrice(true);
        setTimeout(() => setAnimatePrice(false), 800);
      }
      
      // Animate bid change
      if (prevData.current.b !== data.b) {
        setAnimateBid(true);
        setTimeout(() => setAnimateBid(false), 800);
      }
      
      // Animate ask change
      if (prevData.current.a !== data.a) {
        setAnimateAsk(true);
        setTimeout(() => setAnimateAsk(false), 800);
      }
    }
    
    prevData.current = data || null;
  }, [data]);

  if (!data || refreshing) {
    return null; // Skeleton handled by parent component
  }

  const isPositive = parseFloat(data.P) >= 0;
  const priceChangeClass = getPriceChangeClass(data.P);
  const PriceChangeIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  // Animation classes
  const priceAnimClass = animatePrice ? (isPositive ? 'highlight-positive' : 'highlight-negative') : '';
  const bidAnimClass = animateBid ? (parseFloat(data.b) > (prevData.current ? parseFloat(prevData.current.b) : 0) ? 'highlight-positive' : 'highlight-negative') : '';
  const askAnimClass = animateAsk ? (parseFloat(data.a) > (prevData.current ? parseFloat(prevData.current.a) : 0) ? 'highlight-positive' : 'highlight-negative') : '';

  return (
    <Card 
      ref={cardRef}
      tabIndex={0}
      aria-label={`Price card for ${symbol}`}
      sx={{ 
        mb: 2, 
        position: 'relative', 
        overflow: 'visible', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: { xs: 2, sm: 2 },
        transition: 'all 0.2s ease-in-out',
        outline: 'none',
        minWidth: { xs: '100%', sm: '320px' }, 
        width: '100%',
        maxWidth: { xs: '100%', sm: 'none' },
        '&:focus-visible': {
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
        },
        '&:hover': {
          transform: { xs: 'none', sm: 'translateY(-2px)' },
          boxShadow: { xs: theme.shadows[1], sm: theme.shadows[3] },
        },
        '&:active': {
          transform: { xs: 'scale(0.985)', sm: 'translateY(-1px)' },
          boxShadow: { xs: theme.shadows[1], sm: theme.shadows[2] },
          bgcolor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(0,0,0,0.01)'
        },
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
        isolation: 'isolate' // Create stacking context
      }}
    >
      
        
      <CardHeader
        sx={{
          p: { xs: 2, sm: 2 },
          pb: { xs: 1.5, sm: 1.75 },
          '& .MuiCardHeader-content': {
            overflow: 'hidden',
            minWidth: 0,
            flex: '1 1 auto'
          },
          '& .MuiCardHeader-action': {
            m: 0,
            alignSelf: 'center',
            display: 'flex',
            gap: 1,
            flexShrink: 0
          }
        }}
        title={
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: { xs: '1.15rem', sm: '1.25rem' },
              letterSpacing: { xs: '-0.3px', sm: '-0.25px' }
            }}
          >
            {symbol}
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', flexShrink: 0 }}>
            <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
              <IconButton 
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onFavoriteToggle && onFavoriteToggle(symbol, !isFavorite);
                }}
                color={isFavorite ? "primary" : "default"}
                sx={{ 
                  p: { xs: 1, sm: 0.75 },
                  minWidth: { xs: '48px', sm: 'auto' },
                  minHeight: { xs: '48px', sm: 'auto' },
                  borderRadius: '50%',
                  '&:active': {
                    transform: 'scale(0.92)',
                    bgcolor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.12)' 
                      : 'rgba(0,0,0,0.08)'
                  }
                }}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      
      <Divider sx={{ mx: { xs: 2, sm: 2.5 } }} />
      
      <CardContent sx={{ 
        pt: 1.75, 
        pb: { xs: 1.5, sm: 1.5 }, 
        flex: 1, 
        px: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Main Content Container */}
        <Box sx={{ 
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'column' },
          flexWrap: { xs: 'nowrap', sm: 'nowrap' },
          gap: { xs: 2, sm: 2 },
          height: '100%',
          overflow: 'visible'
        }}>
          {/* Price Section */}
          <Box sx={{ 
            overflow: 'hidden',
            minWidth: 0,
            display: 'flex',
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-start' },
            justifyContent: { xs: 'space-between', sm: 'flex-start' },
            width: '100%',
            order: { xs: 1, sm: 1 },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                letterSpacing: '-0.5px',
                lineHeight: 1.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: { xs: '1.75rem', sm: '2.1rem' },
                flexShrink: 0,
                order: { xs: 1, sm: 1 }
              }}
              className={`${priceChangeClass} ${priceAnimClass}`}
            >
              {formatPrice(data.c)}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.75, 
              mt: { xs: 0, sm: 0.5 },
              flexWrap: 'nowrap',
              minWidth: 0,
              order: { xs: 2, sm: 2 }
            }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600,
                  color: isPositive ? 'success.main' : 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <PriceChangeIcon fontSize="small" />
                {formatPercentChange(data.P)}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: '1 1 auto',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                24h Change
              </Typography>
            </Box>
          </Box>
          
          {/* Chart Section */}
          {showChart && (
            <Box sx={{ 
              width: '100%',
              height: { xs: 100, sm: 90 },
              position: 'relative',
              overflow: 'hidden',
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: { xs: 0, sm: 0.75 },
              order: { xs: 2, sm: 3 },
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              },
              '&:active': {
                transform: 'scale(0.98)',
              }
            }}>
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MiniChart 
                  symbol={symbol} 
                  priceChange={data.P}
                  showAxes={false}
                  showTooltip={false}
                  interactive={false}
                />
              </Box>
            </Box>
          )}

          {/* Price Info Grid */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: { xs: 2, sm: 2 },
            width: '100%',
            order: { xs: 3, sm: 2 },
            minWidth: 0, // Prevent overflow
            '& > div': {
              p: { xs: 1.75, sm: 1.75 },
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              },
              '&:active': {
                transform: 'scale(0.98)',
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
              },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflow: 'hidden'
            }
          }}>
            <Box>
              <Typography 
                variant="body2" 
                className={bidAnimClass}
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  width: '100%'
                }}
              >
                {formatPrice(data.b)}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  mt: 0.5,
                  display: 'block'
                }}
              >
                Best Bid
              </Typography>
            </Box>
            
            <Box>
              <Typography 
                variant="body2"
                className={askAnimClass}
                sx={{ 
                  fontWeight: 600, 
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  width: '100%'
                }}
              >
                {formatPrice(data.a)}
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  mt: 0.5,
                  display: 'block'
                }}
              >
                Best Ask
              </Typography>
            </Box>
          </Box>

          {/* Stats Grid */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: { xs: 1.5, sm: 0.75 },
            mt: { xs: 0, sm: 'auto' },
            width: '100%',
            order: { xs: 4, sm: 4 },
            '& > div': {
              borderRadius: { xs: 1.5, sm: 0 },
              p: { xs: 1.25, sm: 0 },
              bgcolor: { 
                xs: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)', 
                sm: 'transparent' 
              },
              overflow: 'hidden',
              display: 'flex',
              transition: 'all 0.15s ease-in-out',
              '&:active': {
                transform: { xs: 'scale(0.98)', sm: 'none' },
                bgcolor: { 
                  xs: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', 
                  sm: 'transparent' 
                }
              }
            }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  minWidth: { xs: '35px', sm: '45px' }, 
                  flexShrink: 0,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                High:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: '1 1 auto'
                }}
              >
                {formatPrice(data.h)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  minWidth: { xs: '35px', sm: '45px' }, 
                  flexShrink: 0,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                Low:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: '1 1 auto'
                }}
              >
                {formatPrice(data.l)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  minWidth: { xs: '35px', sm: '45px' }, 
                  flexShrink: 0,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                Vol:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: '1 1 auto'
                }}
              >
                {parseFloat(data.v).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  minWidth: { xs: '35px', sm: '45px' }, 
                  flexShrink: 0,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                }}
              >
                Trades:
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  fontSize: { xs: '0.875rem', sm: '0.875rem' }, 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  flex: '1 1 auto'
                }}
              >
                {data.n.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>

      {/* Footer */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        px: { xs: 2, sm: 2 },
        py: { xs: 1.5, sm: 1 },
        borderTop: `1px solid ${theme.palette.divider}`,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        gap: { xs: 1, sm: 1 },
        mt: 'auto',
        overflow: 'hidden'
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.7rem' },
            order: { xs: 2, sm: 1 },
            width: { xs: showChart ? '50%' : 'auto', sm: 'auto' },
            textAlign: { xs: 'left', sm: 'left' }
          }}
        >
          Updated: {formatTimestamp(data.E)}
        </Typography>
        <FormControlLabel
          control={
            <Switch 
              size="small" 
              checked={showChart}
              onChange={(e) => setShowChart(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase': {
                  padding: { xs: 0.75, sm: 0.5 },
                },
                '& .MuiSwitch-thumb': {
                  width: { xs: 16, sm: 12 },
                  height: { xs: 16, sm: 12 },
                },
                '& .MuiSwitch-track': {
                  borderRadius: { xs: 16, sm: 16 },
                  opacity: 0.5
                },
                mr: { xs: 0.75, sm: 0.5 }
              }}
            />
          }
          label={
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.7rem' },
                userSelect: 'none'
              }}
            >
              Chart
            </Typography>
          }
          sx={{ 
            ml: 0,
            order: { xs: 1, sm: 2 },
            width: { xs: showChart ? '50%' : 'auto', sm: 'auto' },
            mr: { xs: 0, sm: 0 },
            '& .MuiFormControlLabel-label': {
              marginLeft: { xs: 0.5, sm: 0.5 }
            },
            display: 'flex',
            alignItems: 'center'
          }}
        />
      </Box>
    </Card>
  );
};

export default ComfortablePriceCard;
