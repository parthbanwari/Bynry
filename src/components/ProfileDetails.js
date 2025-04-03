import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Paper, Button, Chip, Divider, 
  Avatar, Card, CardContent, Grid, Skeleton, Tab, Tabs, Rating,
  List, ListItem, ListItemIcon, ListItemText, IconButton, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import MapComponent from './MapComponent';
import { getProfileById } from '../services/profileService';



const ProfileDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [mapError, setMapError] = useState(false);
  const GOOGLE_MAPS_API_KEY = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || 
                           process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfileById(Number(id));
        
        // Ensure profile has coordinates for the map
        if (data && !data.coordinates) {
          // If profile has no coordinates, add default ones or derived from address
          // This is a simple example - in a real app you might use geocoding
          data.coordinates = {
            lat: data.coordinates?.lat || 40.7128,
            lng: data.coordinates?.lng || -74.006
          };
        }
        
        setProfile(data);
        
        // Check if this profile is in favorites
        const favorites = JSON.parse(localStorage.getItem('favoriteProfiles') || '[]');
        setIsFavorite(favorites.includes(Number(id)));
      } catch (err) {
        setError("Failed to load profile details. The profile may not exist.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [id]);
  
  useEffect(() => {
    // Check if Google Maps API key is available
    if (!GOOGLE_MAPS_API_KEY) {
      setMapError(true);
      console.warn('Google Maps API key is missing. Map functionality will be limited.');
    }
  }, []);
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleToggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favoriteProfiles') || '[]');
    
    if (isFavorite) {
      const updatedFavorites = favorites.filter(profileId => profileId !== Number(id));
      localStorage.setItem('favoriteProfiles', JSON.stringify(updatedFavorites));
    } else {
      favorites.push(Number(id));
      localStorage.setItem('favoriteProfiles', JSON.stringify(favorites));
    }
    
    setIsFavorite(!isFavorite);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.name,
        text: `Check out ${profile.name}'s profile!`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Profile link copied to clipboard!'))
        .catch((err) => console.error('Could not copy text: ', err));
    }
  };

  // Render a fallback map display when Google Maps can't load
  const renderMapFallback = () => (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        backgroundColor: '#f5f5f5',
        borderRadius: 1
      }}
    >
      <LocationOnIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
      <Typography variant="h6" gutterBottom align="center">
        Location Information
      </Typography>
      <Typography variant="body1" align="center" paragraph>
        {profile.address}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        The interactive map cannot be displayed at this time. Please ensure you have a valid Google Maps API key configured.
      </Typography>
    </Box>
  );
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to profiles
        </Button>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Skeleton variant="rectangular" height={500} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Skeleton variant="rectangular" height={500} />
          </Grid>
        </Grid>
      </Container>
    );
  }
  
  if (error || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
          sx={{ mb: 3 }}
        >
          Back to profiles
        </Button>
        
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">{error || "Profile not found"}</Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBack}
        >
          Back to profiles
        </Button>
        
        <Box>
          <Tooltip title={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton onClick={handleToggleFavorite} color={isFavorite ? "primary" : "default"}>
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Share profile">
            <IconButton onClick={handleShare}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Main content grid - profile and map side by side */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: '600px', gap: 3 }}>
        {/* Profile card - left side */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '0 0 40%' }, 
          height: { xs: '50%', md: '100%' },
          mb: { xs: 2, md: 0 }
        }}>
          <Card sx={{ boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              justifyContent: 'center',
              background: 'linear-gradient(to right, #f5f7fa, #c3cfe2)'
            }}>
              <Avatar 
                src={profile.image} 
                alt={profile.name}
                sx={{ 
                  width: 150, 
                  height: 150,
                  border: '4px solid white',
                  boxShadow: 2
                }}
              />
            </Box>
            <CardContent sx={{ flexGrow: 1, overflow: 'auto' }}>
              <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
                {profile.name}
              </Typography>
              
              {profile.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={profile.rating} readOnly precision={0.5} />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    ({profile.rating})
                  </Typography>
                </Box>
              )}
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth" 
                sx={{ mb: 2 }}
              >
                <Tab label="Contact" />
                <Tab label="Interests" />
              </Tabs>
              
              {tabValue === 0 && (
                <Box>
                  <List dense disablePadding>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <EmailIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={profile.contact} 
                      />
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <LocationOnIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Address" 
                        secondary={profile.address} 
                      />
                    </ListItem>
                  </List>
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {profile.interests?.map((interest, index) => (
                    <Chip 
                      key={index} 
                      label={interest} 
                      sx={{ 
                        m: 0.5,
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 1
                        }
                      }} 
                    />
                  )) || <Typography>No interests listed</Typography>}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
        
        {/* Map - right side */}
        <Box sx={{ 
          flex: { xs: '1 1 100%', md: '0 0 60%' }, 
          height: { xs: '50%', md: '100%' } 
        }}>
          <Paper 
            sx={{ 
              p: 2, 
              boxShadow: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Location
            </Typography>
            <Box 
              sx={{ 
                flexGrow: 1,
                borderRadius: 1, 
                overflow: 'hidden',
                border: '1px solid #eee'
              }}
            >
              {(!GOOGLE_MAPS_API_KEY || mapError) ? (
                renderMapFallback()
              ) : (
                <MapComponent selectedProfile={profile} />
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
};

export default ProfileDetails;