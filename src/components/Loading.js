import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';

const Loading = ({ message = 'Loading...', fullPage = false }) => {
  const content = (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      p: 4 
    }}>
      <CircularProgress 
        size={fullPage ? 60 : 40} 
        thickness={fullPage ? 4 : 5}
        sx={{ 
          color: (theme) => theme.palette.primary.main,
          animation: 'pulse 1.5s ease-in-out infinite',
          '@keyframes pulse': {
            '0%': { opacity: 1 },
            '50%': { opacity: 0.7 },
            '100%': { opacity: 1 },
          }
        }}
      />
      <Typography 
        variant={fullPage ? "h6" : "body1"} 
        sx={{ 
          mt: 2,
          fontWeight: fullPage ? 500 : 400,
          animation: 'fadeInOut 2s ease-in-out infinite',
          '@keyframes fadeInOut': {
            '0%': { opacity: 0.7 },
            '50%': { opacity: 1 },
            '100%': { opacity: 0.7 },
          }
        }}
      >
        {message}
      </Typography>
    </Box>
  );

  if (fullPage) {
    return (
      <Box sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999
      }}>
        <Paper elevation={3} sx={{ borderRadius: 2, py: 3, px: 6 }}>
          {content}
        </Paper>
      </Box>
    );
  }

  return content;
};

export default Loading;
