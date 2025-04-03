import React, { useState, useCallback } from 'react';
import { 
  Container, Box, Typography, Tabs, Tab, Button, 
  Paper, Breadcrumbs, Link, useMediaQuery, useTheme 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AdminProfileList from './AdminProfileList';
import ProfileForm from './ProfileForm';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editingProfile, setEditingProfile] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      setEditingProfile(null); // Reset editing profile when switching to list tab
    }
  };
  
  const handleEditProfile = useCallback((profile) => {
    setEditingProfile(profile);
    setTabValue(1); // Switch to edit tab
  }, []);
  
  const handleFormSubmit = useCallback(() => {
    setTabValue(0); // Go back to list after submission
    setEditingProfile(null);
  }, []);
  
  const handleAddNewProfile = useCallback(() => {
    setEditingProfile(null);
    setTabValue(1);
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link 
            underline="hover" 
            color="inherit" 
            href="/" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Typography 
            color="text.primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <DashboardIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Admin Dashboard
          </Typography>
        </Breadcrumbs>
      </Paper>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {tabValue === 0 && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleAddNewProfile}
              startIcon={<PersonAddIcon />}
              sx={{ borderRadius: 1 }}
            >
              Add New Profile
            </Button>
          )}
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 1 }}
          >
            Back to Website
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              aria-label="admin dashboard tabs"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem'
                }
              }}
            >
              <Tab 
                label="Profile List" 
                icon={<DashboardIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={editingProfile ? "Edit Profile" : "Add New Profile"} 
                icon={editingProfile ? <EditIcon /> : <PersonAddIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={tabValue !== 0} 
            id="tabpanel-profile-list"
            aria-labelledby="tab-profile-list"
          >
            {tabValue === 0 && (
              <AdminProfileList onEditProfile={handleEditProfile} />
            )}
          </Box>
          
          <Box 
            role="tabpanel" 
            hidden={tabValue !== 1}
            id="tabpanel-profile-form"
            aria-labelledby="tab-profile-form"
          >
            {tabValue === 1 && (
              <ProfileForm 
                profile={editingProfile || undefined} 
                onSubmitSuccess={handleFormSubmit} 
              />
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;