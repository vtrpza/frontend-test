import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  TextField,
  Button,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  InputAdornment,
  Avatar,
  Tooltip,
  CircularProgress,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FolderIcon from '@mui/icons-material/Folder';

import { useSymbolContext } from '../contexts/SymbolContext';

interface SymbolListProps {
  listId: string;
  name: string;
  symbols: string[];
  active: boolean;
  onSelect: () => void;
  disabled?: boolean;
}

const SymbolList: React.FC<SymbolListProps> = ({ 
  listId, 
  name, 
  symbols, 
  active, 
  onSelect,
  disabled = false
}) => {
  const theme = useTheme();
  const { removeSymbolFromList, deleteSymbolList, addSymbolsToList } = useSymbolContext();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  const handleRemoveSymbol = (symbol: string) => {
    removeSymbolFromList(listId, symbol);
  };

  const handleDeleteList = () => {
    deleteSymbolList(listId);
  };

  return (
    <Card 

      onClick={disabled ? undefined : onSelect}
      sx={{
        mb: 2,
        mt: 2,
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.2s ease-in-out',
        position: 'relative',
        overflow: 'visible',
        ...(disabled && {
          opacity: 0.7,
        }),
        ...(active ? {
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          boxShadow: `0 4px 12px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)'}`,
        } : {}),
        '&:hover': {
          transform: disabled ? 'none' : 'translateY(-2px)',
          boxShadow: disabled ? 'none' : (theme.palette.mode === 'dark' 
            ? '0 8px 16px rgba(0,0,0,0.6)' 
            : '0 8px 16px rgba(0,0,0,0.1)')
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {active && (
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -8, 
            left: 16, 
            bgcolor: theme.palette.primary.main,
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 700,
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          Active
        </Box>
      )}
      <CardHeader 
        avatar={
          <Avatar sx={{ 
            bgcolor: active ? theme.palette.primary.main : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }}>
            <FolderIcon />
          </Avatar>
        }
        title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{name}</Typography>}
        subheader={`${symbols.length} symbol${symbols.length !== 1 ? 's' : ''}`}
        action={
          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Add symbols">
              <IconButton 
                size="small" 
                color="primary"
                onClick={(e) => { e.stopPropagation(); setOpenAddDialog(true); }}
                disabled={disabled}
                sx={{ mr: 0.5 }}
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete list">
              <IconButton 
                size="small" 
                color="error"
                onClick={(e) => { e.stopPropagation(); handleDeleteList(); }}
                disabled={disabled}
                sx={{
                  opacity: hovered ? 1 : 0.5,
                  transition: 'opacity 0.2s'
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        }
      />
      <Divider sx={{ mx: 2, opacity: 0.6 }} />
      <CardContent sx={{ pt: 1.5 }}>
        {symbols.length === 0 ? (
          <Box 
            sx={{ 
              p: 2, 
              textAlign: 'center',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderRadius: 1,
              border: `1px dashed ${theme.palette.divider}`
            }}
          >
            <Typography variant="body2" color="textSecondary">
              No symbols added yet
            </Typography>
            <Button 
              startIcon={<AddIcon />}
              size="small" 
              variant="outlined" 
              sx={{ mt: 1, borderRadius: '50px' }}
              onClick={(e) => { e.stopPropagation(); setOpenAddDialog(true); }}
            >
              Add symbols
            </Button>
          </Box>
        ) : (
          <Box>
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 0.75,
                mb: symbols.length > 0 ? 2 : 0
              }}
            >
              {symbols.map((symbol) => (
                <Chip
                  key={symbol}
                  label={symbol}
                  size="small"
                  onDelete={(e) => {
                    e.stopPropagation();
                    handleRemoveSymbol(symbol);
                  }}
                  sx={{
                    fontWeight: 500,
                    borderRadius: '4px',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.08)' 
                        : 'rgba(0,0,0,0.08)'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
        {symbols.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              startIcon={<AddIcon />} 
              variant="text" 
              size="small"
              color="primary"
              onClick={(e) => { e.stopPropagation(); setOpenAddDialog(true); }}
              sx={{ 
                borderRadius: '50px', 
                px: 2,
                fontSize: '0.75rem',
                textTransform: 'none',
              }}
            >
              Add more
            </Button>
          </Box>
        )}
      </CardContent>
      
      <AddSymbolDialog 
        listId={listId} 
        open={openAddDialog} 
        onClose={() => setOpenAddDialog(false)} 
      />
    </Card>
  );
};

interface AddSymbolDialogProps {
  listId: string;
  open: boolean;
  onClose: () => void;
}

const AddSymbolDialog: React.FC<AddSymbolDialogProps> = ({ listId, open, onClose }) => {
  const theme = useTheme();
  const { symbols, addSymbolsToList, symbolLists } = useSymbolContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Get current watchlist symbols
  const currentWatchlistSymbols = useMemo(() => {
    const watchlist = symbolLists.find(list => list.id === listId);
    return watchlist ? watchlist.symbols : [];
  }, [symbolLists, listId]);
  
  useEffect(() => {
    if (!open) {
      setSelectedSymbols([]);
      setSearchTerm('');
    }
  }, [open]);
  
  const filteredSymbols = symbols.filter(symbol => 
    symbol.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSymbol = (symbolName: string) => {
    // Only allow toggling if the symbol is not already in the watchlist
    if (!currentWatchlistSymbols.includes(symbolName)) {
      setSelectedSymbols(prev => 
        prev.includes(symbolName)
          ? prev.filter(s => s !== symbolName)
          : [...prev, symbolName]
      );
    }
  };

  const handleAddSymbols = () => {
    if (selectedSymbols.length > 0) {
      setLoading(true);
      setTimeout(() => {
        addSymbolsToList(listId, selectedSymbols);
        onClose();
        setSelectedSymbols([]);
        setSearchTerm('');
        setLoading(false);
      }, 500); // Simulate loading for better UX
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      onClick={(e) => e.stopPropagation()}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { 
          borderRadius: 2,
          width: '100%',
          maxWidth: { xs: '100%', sm: 400 }
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Add Symbols to Watchlist</Typography>
          {selectedSymbols.length > 0 && (
            <Chip 
              size="small" 
              label={`${selectedSymbols.length} selected`} 
              color="primary" 
              variant="outlined"
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          margin="dense"
          placeholder="Search by symbol name..."
          fullWidth
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />
        
        <Box sx={{ 
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          mb: 2,
          minWidth: 0, // Prevent flex item overflow
          overflow: 'hidden' // Ensure content doesn't overflow
        }}>
          <List sx={{ 
            maxHeight: '300px', 
            overflow: 'auto',
            p: 0,
            WebkitOverflowScrolling: 'touch', // Better scrolling on mobile
          }}>
            {filteredSymbols.slice(0, 15).map((symbol) => (
              <React.Fragment key={symbol.symbol}>
                <ListItem 
                  sx={{ 
                    cursor: currentWatchlistSymbols.includes(symbol.symbol) ? 'not-allowed' : 'pointer',
                    py: 1.5, // Larger touch target for mobile
                    px: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: currentWatchlistSymbols.includes(symbol.symbol) ? 'inherit' : 
                      (theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.03)')
                    },
                    '&:active': {
                      bgcolor: currentWatchlistSymbols.includes(symbol.symbol) ? 'inherit' : 
                      (theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(0,0,0,0.05)')
                    },
                    ...(currentWatchlistSymbols.includes(symbol.symbol) ? {
                      opacity: 0.5,
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.05)'
                    } : {}),
                    ...(selectedSymbols.includes(symbol.symbol) ? {
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(129, 199, 132, 0.15)' 
                        : 'rgba(46, 125, 50, 0.08)',
                      borderLeft: `4px solid ${theme.palette.primary.main}`
                    } : {})
                  }}
                  onClick={() => handleToggleSymbol(symbol.symbol)}
                >
                  <ListItemText 
                    primary={
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        minWidth: 0, // Prevent flex item overflow
                      }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            flexGrow: 1,
                            minWidth: 0, // Prevent flex item overflow
                            ...(currentWatchlistSymbols.includes(symbol.symbol) ? {
                              textDecoration: 'line-through',
                              opacity: 0.7
                            } : {})
                          }}
                        >
                          {symbol.symbol}
                        </Typography>
                        {selectedSymbols.includes(symbol.symbol) && !currentWatchlistSymbols.includes(symbol.symbol) && (
                          <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1, flexShrink: 0 }} />
                        )}
                        {currentWatchlistSymbols.includes(symbol.symbol) && (
                          <Tooltip title="Already in watchlist">
                            <Box component="span" sx={{ ml: 1, display: 'flex', alignItems: 'center', color: 'text.disabled' }}>
                              <CheckCircleIcon fontSize="small" sx={{ flexShrink: 0 }} />
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {symbol.baseAsset}/{symbol.quoteAsset}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider component="li" sx={{ opacity: 0.6 }} />
              </React.Fragment>
            ))}
            {filteredSymbols.length === 0 && (
              <ListItem sx={{ py: 4 }}>
                <ListItemText 
                  sx={{ textAlign: 'center' }} 
                  primary="No symbols found" 
                  secondary={searchTerm ? `Try a different search term` : `Type to search for symbols`}
                />
              </ListItem>
            )}
          </List>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          {selectedSymbols.length > 0 && (
            <Button
              size="small"
              onClick={() => setSelectedSymbols([])}
              sx={{ mr: 1 }}
            >
              Clear
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button 
            onClick={onClose}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddSymbols}
            variant="contained"
            color="primary"
            disabled={selectedSymbols.length === 0 || loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ borderRadius: '8px' }}
          >
            {loading ? 'Adding...' : `Add ${selectedSymbols.length > 0 ? `(${selectedSymbols.length})` : ''}`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default SymbolList;
