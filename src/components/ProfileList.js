import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Grid, Typography, Container, FormControlLabel, Switch, Paper, 
  Tabs, Tab, Divider, Button, Fade, useMediaQuery, useTheme, Chip,
  IconButton, Tooltip, Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProfileCard from './ProfileCard';
import MapComponent from './MapComponent';
import SearchFilter from './SearchFilter';
import Loading from './Loading';
import { getProfiles } from '../services/profileService';

const ProfileList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllOnMap, setShowAllOnMap] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [tabValue, setTabValue] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [activeFilters, setActiveFilters] = useState([]);
  
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
      
      // Apply any active filters and sorting
      if (activeFilters.length > 0 || sortBy !== 'name') {
        applyFiltersAndSort(data, activeFilters, sortBy, sortDirection);
      }
    } catch (err) {
      setError("Failed to load profiles. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, sortBy, sortDirection]);
  
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
  
  const handleSummaryClick = (profile) => {
    setSelectedProfile(profile);
    setShowAllOnMap(false); // Switch to single profile view
    
    // On mobile, scroll to map
    if (isMobile) {
      const mapElement = document.getElementById('map-container');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      // Reset to current filtered state based on active filters
      applyFiltersAndSort(profiles, activeFilters, sortBy, sortDirection);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const searchFiltered = profiles.filter(profile => 
      profile.name.toLowerCase().includes(term) || 
      profile.address.toLowerCase().includes(term) ||
      profile.description.toLowerCase().includes(term) ||
      (profile.interests && profile.interests.some(interest => 
        interest.toLowerCase().includes(term)
      ))
    );
    
    // Apply any active filters and sorting to search results
    applyFiltersAndSort(searchFiltered, activeFilters, sortBy, sortDirection);
  };
  
  const applyFiltersAndSort = (profilesArray, filters, sort, direction) => {
    // Apply filters first
    let result = [...profilesArray];
    
    if (filters.includes('favorites')) {
      const favorites = JSON.parse(localStorage.getItem('favoriteProfiles') || '[]');
      result = result.filter(profile => favorites.includes(profile.id));
    }
    
    // Then sort
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sort) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
    
    setFilteredProfiles(result);
  };
  
  const handleMapViewToggle = (event) => {
    setShowAllOnMap(event.target.checked);
    if (event.target.checked) {
      setSelectedProfile(null); // Clear selected profile when showing all
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Handle tab-specific actions
    if (newValue === 0) { // All profiles
      const newFilters = activeFilters.filter(f => f !== 'favorites');
      setActiveFilters(newFilters);
      applyFiltersAndSort(profiles, newFilters, sortBy, sortDirection);
    } else if (newValue === 1) { // Favorites
      const newFilters = [...activeFilters, 'favorites'];
      if (!newFilters.includes('favorites')) {
        newFilters.push('favorites');
      }
      setActiveFilters(newFilters);
      applyFiltersAndSort(profiles, newFilters, sortBy, sortDirection);
    }
  };
  
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };
  
  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };
  
  const handleSortClose = () => {
    setSortAnchorEl(null);
  };
  
  const handleSortSelect = (sort) => {
    if (sort === sortBy) {
      // Toggle direction if same sort field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSortDirection(newDirection);
      applyFiltersAndSort(profiles, activeFilters, sortBy, newDirection);
    } else {
      // New sort field
      setSortBy(sort);
      applyFiltersAndSort(profiles, activeFilters, sort, sortDirection);
    }
    handleSortClose();
  };
  
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleFilterSelect = (filter) => {
    let newFilters;
    
    if (activeFilters.includes(filter)) {
      newFilters = activeFilters.filter(f => f !== filter);
    } else {
      newFilters = [...activeFilters, filter];
    }
    
    setActiveFilters(newFilters);
    applyFiltersAndSort(profiles, newFilters, sortBy, sortDirection);
    
    // Update tab if favorites filter changes
    if (filter === 'favorites') {
      setTabValue(newFilters.includes('favorites') ? 1 : 0);
    }
    
    handleFilterClose();
  };
  
  const handleRefresh = () => {
    fetchProfiles();
  };
  
  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          {error}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button 
            variant="contained" 
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" sx={{ my: 4 }}>
        Profile Directory
      </Typography>
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Profiles" />
          <Tab 
            label="Favorites" 
            icon={<FavoriteIcon fontSize="small" />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap',
        gap: 2,
        mb: 3 
      }}>
        <SearchFilter onSearch={handleSearch} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="View options">
            <Box sx={{ display: 'flex', border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <IconButton 
                size="small"
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => handleViewModeChange('grid')}
              >
                <ViewModuleIcon />
              </IconButton>
              <IconButton 
                size="small"
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => handleViewModeChange('list')}
              >
                <ViewListIcon />
              </IconButton>
            </Box>
          </Tooltip>
          
          <Tooltip title="Sort profiles">
            <IconButton onClick={handleSortClick}>
              <SortIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={sortAnchorEl}
            open={Boolean(sortAnchorEl)}
            onClose={handleSortClose}
          >
            <MenuItem 
              onClick={() => handleSortSelect('name')}
              selected={sortBy === 'name'}
            >
              <ListItemText 
                primary="Name" 
                secondary={sortBy === 'name' ? (sortDirection === 'asc' ? 'A to Z' : 'Z to A') : null} 
              />
            </MenuItem>
            <MenuItem 
              onClick={() => handleSortSelect('rating')}
              selected={sortBy === 'rating'}
            >
              <ListItemText 
                primary="Rating" 
                secondary={sortBy === 'rating' ? (sortDirection === 'asc' ? 'Low to High' : 'High to Low') : null} 
              />
            </MenuItem>
          </Menu>
          
          <Tooltip title="Filter profiles">
            <IconButton onClick={handleFilterClick}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => handleFilterSelect('favorites')}>
              <ListItemIcon>
                <FavoriteIcon fontSize="small" color={activeFilters.includes('favorites') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Favorites" />
            </MenuItem>
          </Menu>
          
          <FormControlLabel
            control={
              <Switch
                checked={showAllOnMap}
                onChange={handleMapViewToggle}
                color="primary"
                size="small"
              />
            }
            label="Show all on map"
            sx={{ ml: 1 }}
          />
        </Box>
      </Box>
      
      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {activeFilters.map(filter => (
            <Chip 
              key={filter}
              label={filter === 'favorites' ? 'Favorites' : filter}
              onDelete={() => handleFilterSelect(filter)}
              color="primary"
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        mt: 3,
        gap: 3
      }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Profiles ({filteredProfiles.length})
            </Typography>
            <Tooltip title="Refresh profiles">
              <IconButton onClick={handleRefresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Paper>
          
          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map(item => (
                <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 6 : 12} key={item}>
                  <ProfileCard loading={true} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Fade in={!loading}>
              <Grid container spacing={2}>
                {filteredProfiles.length > 0 ? (
                  filteredProfiles.map(profile => (
                    <Grid item xs={12} sm={6} md={viewMode === 'grid' ? 6 : 12} key={profile.id}>
                      <ProfileCard 
                        profile={profile} 
                        onSummaryClick={handleSummaryClick} 
                      />
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography sx={{ mb: 2 }}>
                        No profiles match your search criteria.
                      </Typography>
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setActiveFilters([]);
                          handleSearch('');
                        }}
                      >
                        Clear filters
                      </Button>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Fade>
          )}
        </Box>
        
        <Box 
          id="map-container"
          sx={{ 
            flex: 1, 
            height: { xs: '400px', md: '600px' }, 
            width: '100%',
            position: 'relative'
          }}
        >
          <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Location Map
            </Typography>
            {selectedProfile && (
              <Chip 
                label={`Viewing: ${selectedProfile.name}`}
                onDelete={() => setSelectedProfile(null)}
                size="small"
                color="primary"
              />
            )}
          </Paper>
          <MapComponent 
            selectedProfile={selectedProfile} 
            allProfiles={showAllOnMap ? filteredProfiles : []}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default ProfileList;
