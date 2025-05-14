import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  CssBaseline, 
  ThemeProvider, 
  createTheme, 
  useMediaQuery, 
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const isMobile = useMediaQuery('(max-width:600px)');

  // Detect system preference changes
  useEffect(() => {
    setDarkMode(prefersDarkMode);
  }, [prefersDarkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#81c784' : '#2e7d32',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        'Roboto',
        'Arial',
        'sans-serif'
      ].join(','),
      h6: {
        fontWeight: 500,
        letterSpacing: '0.0075em',
      },
      subtitle1: {
        fontWeight: 400,
        letterSpacing: '0.00938em',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 4px 16px rgba(0, 0, 0, 0.25)' 
              : '0 2px 10px rgba(0, 0, 0, 0.08)',
            borderRadius: '10px',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode 
                ? '0 8px 20px rgba(0, 0, 0, 0.35)' 
                : '0 5px 15px rgba(0, 0, 0, 0.12)',
            },
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            transition: 'box-shadow 0.3s ease-in-out',
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '6px',
            fontWeight: 500,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: darkMode 
              ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
              : '0 1px 4px rgba(0, 0, 0, 0.1)',
          }
        }
      }
    },
    shape: {
      borderRadius: 8,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <AppBar position="fixed" color="default" elevation={0} sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.background.paper, darkMode ? 0.8 : 0.95),
          backdropFilter: 'blur(8px)',
          height: { xs: '56px', sm: '64px' }
        }}>
          <Toolbar sx={{ 
            minHeight: { xs: '56px', sm: '64px' },
            px: { xs: 1.5, sm: 2 }
          }}>
            <Box display="flex" alignItems="center">
              <CurrencyBitcoinIcon color="primary" sx={{ 
                mr: { xs: 1, sm: 1.5 },
                fontSize: { xs: '1.5rem', sm: '1.75rem' }
              }} />
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Binance Price Tracker
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton 
                onClick={() => setDarkMode(!darkMode)} 
                color="inherit"
                size={isMobile ? "medium" : "large"}
                sx={{ 
                  ml: { xs: 1, sm: 2 },
                  p: { xs: 1, sm: 1.25 }
                }}
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: '100%',
            height: { 
              xs: 'calc(100vh - 56px)', 
              sm: 'calc(100vh - 64px)'
            },
            mt: { xs: '56px', sm: '64px' },
            px: { xs: 0, sm: 2, md: 3 },
            py: { xs: 0, sm: 2 },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
