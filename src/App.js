import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import ProfileList from './components/ProfileList';
import ProfileDetails from './components/ProfileDetails';
import AdminDashboard from './components/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Profile Map App
          </Typography>
          <Button color="inherit" component="a" href="/">Profiles</Button>
          <Button color="inherit" component="a" href="/admin">Admin</Button>
        </Toolbar>
      </AppBar>
      
      <Box component="main">
        <Routes>
          <Route path="/" element={<ProfileList />} />
          <Route path="/profile/:id" element={<ProfileDetails />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
      
      <Box component="footer" sx={{ py: 3, bgcolor: '#f5f5f5', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            Profile Map Application © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App;