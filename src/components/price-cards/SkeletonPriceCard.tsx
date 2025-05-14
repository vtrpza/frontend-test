import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Skeleton,
  CardHeader,
  CircularProgress
} from '@mui/material';
import type { CardViewMode } from './types';

interface SkeletonPriceCardProps {
  viewMode?: CardViewMode;
  refreshing?: boolean;
  symbol?: string;
}

const SkeletonPriceCard: React.FC<SkeletonPriceCardProps> = ({ 
  viewMode = 'comfortable',
  refreshing = false,
  symbol
}) => {
  // Different sizes based on view mode
  const minHeight = viewMode === 'compact' ? 90 : viewMode === 'detailed' ? 260 : 200;
  
  return (
    <Card sx={{ 
      mb: 2, 
      minHeight, 
      overflow: 'hidden', 
      position: 'relative',
      borderRadius: 2
    }}>
      {refreshing && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.04)', 
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress size={30} />
        </Box>
      )}
      
      <CardHeader
        title={<Typography variant="h6">{symbol || <Skeleton width={100} />}</Typography>}
        action={
          <Box sx={{ display: 'flex' }}>
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        }
      />
      
      <CardContent>
        <Box sx={{ pt: 0.5 }}>
          <Skeleton animation="wave" height={40} width="60%" />
          <Skeleton animation="wave" height={20} width="80%" style={{ marginBottom: 6 }} />
          <Skeleton animation="wave" height={20} width="40%" />
        </Box>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton animation="wave" height={30} width="30%" />
          <Skeleton animation="wave" height={30} width="30%" />
          <Skeleton animation="wave" height={30} width="30%" />
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonPriceCard;
