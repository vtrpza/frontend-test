import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  InputAdornment,
  useTheme,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  useMediaQuery,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap';
import { useSymbolContext } from '../contexts/SymbolContext';
import { BinanceWebsocketService } from '../services/websocket';
import SymbolList from '../components/SymbolList';
import PriceTickerCard from '../components/PriceTickerCard';

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const { 
    symbolLists, 
    activeListId, 
    createSymbolList, 
    setActiveList,
    tickerData,
    isLoading,
    isConnecting,
    error
  } = useSymbolContext();

  const [openCreateListDialog, setOpenCreateListDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  
  // Desktop UI state
  const [viewMode, setViewMode] = useState<'compact' | 'comfortable' | 'detailed'>('comfortable');
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Mobile UI state
  const [mobileView, setMobileView] = useState<'prices' | 'watchlists'>('prices');
  
  // Memoized values - must be declared before using them in callbacks
  const activeList = useMemo(() => 
    symbolLists.find(list => list.id === activeListId),
    [symbolLists, activeListId]
  );
  
  const activeSymbols = useMemo(() => 
    activeList?.symbols || [],
    [activeList]
  );
  
  // All callback hooks need to be declared in the same order on every render
  const handleRefresh = useCallback(() => {
    // Get the active list's symbols
    const activeList = symbolLists.find(list => list.id === activeListId);
    
    if (activeList && activeList.symbols.length > 0) {
      try {
        // Reconnect the WebSocket with the current symbols
        console.log('Reconnecting WebSocket with symbols:', activeList.symbols);
        
        // In a real implementation, this would reconnect the WebSocket from the context
        // We can simulate this by disconnecting and reconnecting
        const websocketService = new BinanceWebsocketService();
        websocketService.disconnect();
        websocketService.connect(activeList.symbols);
        
        
      } catch (error) {
        console.error('Failed to reconnect WebSocket:', error);
      }
    }
  }, [activeListId, symbolLists]);
  
  // Regular functions can be defined after hooks
  const handleCreateList = () => {
    if (newListName.trim()) {
      createSymbolList(newListName.trim());
      setNewListName('');
      setOpenCreateListDialog(false);
    }
  };
  
  // useEffect must be declared after all other hooks
  useEffect(() => {
    // Initial connection when component mounts or active list changes
    if (activeListId && activeSymbols.length > 0) {
      handleRefresh();
    }
  }, [activeListId, activeSymbols.length, handleRefresh]);
  
  
  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={isMobile ? 50 : 60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 500, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Loading data...</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, px: 2, textAlign: 'center' }}>Fetching symbols from Binance</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ 
      height: '100%', 
      overflow: 'hidden', 
      display: 'flex', 
      flexDirection: 'column',
      pb: { xs: 0, md: 2 } 
    }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 0, 
            width: '100%',
            fontSize: { xs: '0.85rem', sm: '0.9rem' }
          }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        pt: { xs: 1.5, sm: 2 }, 
        px: { xs: 1.5, sm: 2, md: 3, lg: 4 } 
      }}>
        <Box 
          sx={{ 
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
            mb: { xs: 1.5, sm: 1 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon color="primary" sx={{ mr: 1, fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              Binance Price Tracker
            </Typography>
          </Box>
      
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
            maxWidth: { sm: '80%', md: '60%' }
          }}
        >
          Create and manage your watchlists to track cryptocurrency prices in real-time.
        </Typography>
        <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />
      </Box>

      {/* Mobile view toggle - only visible on mobile */}
      {!isDesktop && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 1,
          px: 2,
          flexDirection: 'column',
          gap: 1
        }}>
          <ToggleButtonGroup
            value={mobileView}
            exclusive
            onChange={(_, newView) => newView && setMobileView(newView)}
            aria-label="mobile view"
            size="small"
            sx={{
              width: '100%',
              '& .MuiToggleButtonGroup-grouped': {
                flex: 1,
                borderRadius: 1,
                py: 0.75
              }
            }}
          >
            <ToggleButton value="prices" aria-label="prices view">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TrendingUpIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Prices</Typography>
              </Box>
            </ToggleButton>
            <ToggleButton value="watchlists" aria-label="watchlists view">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <ViewModuleIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>Watchlists</Typography>
              </Box>
            </ToggleButton>
          </ToggleButtonGroup>
          
          {/* Card density toggle - only visible when in prices view on mobile */}
          {mobileView === 'prices' && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              width: '100%',
              bgcolor: theme.palette.background.paper,
              borderRadius: 1,
              p: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                Card Density:
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={viewMode}
                exclusive
                onChange={(_, newMode) => newMode && setViewMode(newMode)}
                aria-label="card density"
              >
                <ToggleButton value="compact" aria-label="compact view">
                  <Tooltip title="Compact View">
                    <ZoomInMapIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value="comfortable" aria-label="comfortable view">
                  <Tooltip title="Comfortable View">
                    <ViewModuleIcon fontSize="small" />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </Box>
      )}

      {/* Layout configuration controls - only visible on desktop */}
      {isDesktop && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 2, 
          gap: 2,
          px: { xs: 1.5, sm: 2, md: 3, lg: 4 }
        }}>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Density:
            </Typography>
            <ToggleButtonGroup
              size="small"
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              aria-label="card density"
            >
              <ToggleButton value="compact" aria-label="compact view">
                <Tooltip title="Compact View">
                  <ZoomInMapIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="comfortable" aria-label="comfortable view">
                <Tooltip title="Comfortable View">
                  <ViewModuleIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      )}
      
      <Box sx={{
        display: 'flex', 
        flexDirection: {
          xs: 'column',
          md: 'row'
        }, 
        gap: { xs: 0, md: 2 }, 
        height: { 
          xs: 'calc(100vh - 180px)', 
          sm: 'calc(100vh - 200px)', 
          md: 'calc(100vh - 240px)' 
        },
        flexGrow: 1,
        overflow: 'hidden',
        px: { xs: 0, md: 2, lg: 4 }
      }}>
        {/* Symbol Lists Section - Hidden on mobile when in prices view */}
        <Box sx={{
          width: { 
            xs: '100%', 
            md: '25%',
            lg: '20%' 
          }, 
          flexShrink: 0, 
          order: { xs: 2, md: 1 },
          height: { xs: '100%', md: '100%' },
          display: { xs: mobileView === 'watchlists' ? 'block' : 'none', md: 'block' }
        }}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              mb: { xs: 0, md: 0 }, 
              height: '100%',
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: theme.shadows[1],
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            elevation={0}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography 
                variant="h6" 
                component="h2" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                My Watchlists
              </Typography>
              <Button 
                startIcon={<AddIcon />} 
                variant="contained" 
                size="small"
                onClick={() => setOpenCreateListDialog(true)}
                disabled={isConnecting}
                sx={{ 
                  borderRadius: '8px',
                  py: { xs: 0.5, sm: 0.75 },
                  px: { xs: 1, sm: 1.5 }
                }}
              >
                Create List
              </Button>
            </Box>
            
            {symbolLists.length === 0 ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                  border: `1px dashed ${theme.palette.divider}`,
                  transition: 'all 0.3s ease'
                }}
              >
                <InfoIcon color="action" sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  No watchlists yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 2 }}>
                  Create your first list to start tracking cryptocurrency prices.
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setOpenCreateListDialog(true)}
                  disabled={isConnecting}
                  sx={{ borderRadius: '8px' }}
                >
                  Create Your First List
                </Button>
              </Box>
            ) : (
              <Fade in={true}>
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', position: 'relative' }}>
                  {/* Connection loading overlay */}
                  {isConnecting && (
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                      zIndex: 10,
                      backdropFilter: 'blur(2px)'
                    }}>
                      <CircularProgress size={36} thickness={4} />
                      <Typography variant="body2" sx={{ mt: 2, fontWeight: 500, textAlign: 'center', px: 2 }}>
                        Connecting to price feed...
                      </Typography>
                    </Box>
                  )}
                  
                  {symbolLists.map(list => (
                    <SymbolList
                      key={list.id}
                      listId={list.id}
                      name={list.name}
                      symbols={list.symbols}
                      active={list.id === activeListId}
                      onSelect={() => setActiveList(list.id)}
                      disabled={isConnecting}
                    />
                  ))}
                </Box>
              </Fade>
            )}
          </Paper>
        </Box>

        {/* Price Tickers Section - Hidden on mobile when in watchlists view */}
        <Box sx={{
          width: { 
            xs: '100%', 
            md: '75%',
            lg: '80%'
          }, 
          flexDirection: 'column', 
          order: { xs: 1, md: 2 }, 
          mb: { xs: 0, md: 0 },
          height: { xs: '100%', md: '100%' },
          display: { xs: mobileView === 'prices' ? 'flex' : 'none', md: 'flex' }
        }}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 },
              flexGrow: 1,
              borderRadius: { xs: 0, sm: 1 },
              boxShadow: theme.shadows[1],
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            elevation={0}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.primary.main,
                    fontSize: { xs: '1.1rem', sm: '1.25rem' }
                  }}
                >
                  Price Updates
                </Typography>
              </Box>
            </Box>

            {activeListId === null ? (
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  py: { xs: 6, sm: 8 },
                  px: 2,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                  border: `1px dashed ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                  No watchlist selected
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select a watchlist to view real-time price updates.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ 
                display: 'grid', 
                gap: { xs: 1, sm: 1.5, md: 2 }, 
                gridTemplateColumns: { 
                  xs: 'repeat(auto-fill, minmax(140px, 1fr))',
                  sm: viewMode === 'compact' 
                    ? 'repeat(auto-fill, minmax(180px, 1fr))'
                    : 'repeat(auto-fill, minmax(290px, 1fr))'
                },
                width: '100%',
                flexGrow: 1,
                transition: 'all 0.3s ease',
                overflow: 'auto',
                maxHeight: '100%',
                pb: 2,
                px: { xs: 0.5, sm: 0 },
                position: 'relative',
                // Add pull-to-refresh indicator styling
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                }
              }}>
                {/* Connection loading overlay */}
                {isConnecting && (
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
                    zIndex: 10,
                    backdropFilter: 'blur(2px)'
                  }}>
                    <CircularProgress size={40} thickness={4} />
                    <Typography variant="body2" sx={{ mt: 2, fontWeight: 500, textAlign: 'center', px: 2 }}>
                      Connecting to price feed...
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center', px: 2, maxWidth: 300 }}>
                      Please wait while we establish the websocket connection
                    </Typography>
                  </Box>
                )}
                {activeSymbols.map(symbol => {
                  const ticker = tickerData[symbol.toLowerCase()] || undefined;
                  return (
                    <Fade in={true} key={symbol} timeout={300}>
                      <div>
                        <PriceTickerCard symbol={symbol} data={ticker} viewMode={viewMode} />
                      </div>
                    </Fade>
                  );
                })}

                {activeSymbols.length === 0 && (
                  <Box 
                    sx={{ 
                      gridColumn: '1/-1',
                      textAlign: 'center',
                      py: 4,
                      borderRadius: 2,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                      border: `1px dashed ${theme.palette.divider}`
                    }}
                  >
                    <InfoIcon color="action" sx={{ fontSize: 36, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                      No symbols in this watchlist
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Add symbols to this watchlist to track their prices
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Create List Dialog */}
      <Dialog 
        open={openCreateListDialog} 
        onClose={() => !isConnecting && setOpenCreateListDialog(false)}
        maxWidth="xs"
        fullWidth
        fullScreen={isMobile}
        disableEscapeKeyDown={isConnecting}
        PaperProps={{
          elevation: 5,
          sx: { 
            borderRadius: { xs: isMobile ? 0 : 1, sm: 2 },
            mx: { xs: 2, sm: 'auto' },
            width: { xs: 'calc(100% - 32px)', sm: '100%' },
            maxHeight: { xs: 'calc(100% - 64px)', sm: '100%' }
          }
        }}
      >
        {isMobile && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 1,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <IconButton edge="start" color="inherit" onClick={() => !isConnecting && setOpenCreateListDialog(false)} aria-label="close" disabled={isConnecting}>
              <CloseIcon />
            </IconButton>
            <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 500 }}>
              Create New Watchlist
            </Typography>
            <IconButton edge="end" color="inherit" sx={{ visibility: 'hidden' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        
        {!isMobile && (
          <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, pt: { xs: 2, sm: 3 } }}>
            Create New Watchlist
          </DialogTitle>
        )}
        
        <DialogContent sx={{ pt: isMobile ? 2 : 1 }}>
          <Box sx={{ pt: isMobile ? 0 : 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Watchlist Name"
              placeholder="Enter a name for your watchlist"
              fullWidth
              variant="outlined"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TrendingUpIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                mt: 1, 
                display: 'block', 
                mb: 1,
                fontSize: { xs: '0.7rem', sm: '0.75rem' }
              }}
            >
              Create a watchlist to group symbols you want to track together.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: { xs: 1.5, sm: 2 }, 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 1 
        }}>
          <Button 
            variant="outlined" 
            onClick={() => !isConnecting && setOpenCreateListDialog(false)} 
            disabled={isConnecting}
            fullWidth
            sx={{ 
              borderRadius: '8px',
              width: { sm: 'auto' }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateList} 
            disabled={isConnecting || !newListName.trim()}
            color="primary"
            startIcon={<AddIcon />}
            fullWidth
            sx={{ 
              borderRadius: '8px',
              width: { sm: 'auto' }
            }}
          >
            Create Watchlist
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fixed bottom navigation for mobile */}
      {!isDesktop && activeListId && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            borderRadius: 0,
            boxShadow: theme.shadows[3],
            display: { xs: 'flex', md: 'none' },
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 0.75,
            px: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
          elevation={3}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5
            }}
          >
            <ViewModuleIcon fontSize="small" color="primary" />
            {activeList?.name || 'No list selected'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              startIcon={<AddIcon fontSize="small" />}
              onClick={() => setOpenCreateListDialog(true)}
              sx={{ 
                borderRadius: '8px',
                py: 0.5,
                fontSize: '0.8rem'
              }}
            >
              New List
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;
