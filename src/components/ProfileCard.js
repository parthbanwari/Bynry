import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box, Skeleton, Chip, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const ProfileCard = ({ profile, onSummaryClick, loading, scrollToMap }) => {
  const navigate = useNavigate();
  
  const handleViewDetails = () => {
    navigate(`/profile/${profile.id}`);
  };
  
  const handleShowOnMap = () => {
    // First trigger the parent component's map update
    onSummaryClick(profile);
    
    // Then scroll to the map
    if (scrollToMap) {
      setTimeout(() => scrollToMap(), 100); // Short timeout to let state update
    }
  };
  
  if (loading) {
    return (
      <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3, height: '100%' }}>
        <Skeleton variant="rectangular" height={140} />
        <CardContent>
          <Skeleton variant="text" height={30} />
          <Skeleton variant="text" />
          <Skeleton variant="text" />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Skeleton variant="rectangular" width={100} height={36} />
            <Skeleton variant="rectangular" width={100} height={36} />
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
      <Card sx={{ 
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
        m: 0,
        boxShadow: 3, 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6,
        },
        maxWidth: { xs: '100%', sm: '345px' }
      }}>
      <CardMedia
        component="img"
        height="140"
        image={profile.image}
        alt={profile.name}
        sx={{ objectFit: 'cover',
          height: { xs: '120px', sm: '140px' }, // Responsive height
          width: '100%'
         }}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {profile.name}
        </Typography>
        
        {profile.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={profile.rating} readOnly size="small" precision={0.5} />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({profile.rating})
            </Typography>
          </Box>
        )}
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            mb: 1
          }}
        >
          {profile.description}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {profile.address}
          </Typography>
        </Box>
        
        {profile.interests && profile.interests.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {profile.interests.slice(0, 2).map((interest, index) => (
              <Chip key={index} label={interest} size="small" variant="outlined" />
            ))}
            {profile.interests.length > 2 && (
              <Chip label={`+${profile.interests.length - 2}`} size="small" />
            )}
          </Box>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto', pt:2 }}>
          <Button 
            size="small" 
            variant="contained" 
            onClick={handleShowOnMap}  // Changed from onSummaryClick to our new handler
            sx={{ 
              borderRadius: 2,
              boxShadow: 1,
              '&:hover': { boxShadow: 2 }
            }}
          >
            Show on Map
          </Button>
          <Button 
            size="small" 
            variant="outlined"
            onClick={handleViewDetails}
            sx={{ 
              borderRadius: 2,
              '&:hover': { boxShadow: 1 }
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;