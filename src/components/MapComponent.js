"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api"
import { MarkerClusterer } from "@react-google-maps/api"
import { Box, Paper, Typography, CircularProgress, Card, CardContent, CardMedia, Button, Chip, IconButton } from "@mui/material"
import { useNavigate } from "react-router-dom"
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

// Default map settings
const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.006, // New York City center
}

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
}

// Clustering options
const clusterOptions = {
  imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
  maxZoom: 15,
  minimumClusterSize: 2,
  gridSize: 50,
  zoomOnClick: true,
  averageCenter: true,
}

// Libraries we need to load
const libraries = ["places"];

const MapComponent = ({ selectedProfile, allProfiles = [], onError }) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [map, setMap] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(null)
  
  // Determine which profiles to show on the map
  const profilesToShow = allProfiles.length > 0 ? allProfiles : selectedProfile ? [selectedProfile] : []

  // IMPORTANT: Make sure this key is available and correctly formatted
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  // Reference to maintain map instance
  const mapRef = useRef()
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    setMap(map)
    setMapLoaded(true)
  }, [])

  // Pan to marker when selectedProfile changes
  useEffect(() => {
    if (selectedProfile && map && window.google) {
      // Make sure coordinates exist and are proper numbers
      if (selectedProfile.coordinates && 
          typeof selectedProfile.coordinates.lat === 'number' && 
          typeof selectedProfile.coordinates.lng === 'number') {
        map.panTo({ lat: selectedProfile.coordinates.lat, lng: selectedProfile.coordinates.lng });
        map.setZoom(15);
        setSelected(selectedProfile);
      } else {
        console.error("Invalid coordinates for selectedProfile:", selectedProfile);
      }
    }
  }, [selectedProfile, map]);

  // Fit bounds to show all markers when allProfiles changes
  useEffect(() => {
    if (allProfiles.length > 1 && map && window.google) {
      try {
        const bounds = new window.google.maps.LatLngBounds()
        allProfiles.forEach((profile) => {
          if (profile.coordinates && profile.coordinates.lat && profile.coordinates.lng) {
            bounds.extend(new window.google.maps.LatLng(profile.coordinates.lat, profile.coordinates.lng))
          }
        })
        
        if (!bounds.isEmpty()) {
          map.fitBounds(bounds)

          // Add a small padding
          const listener = window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
            map.setZoom(Math.min(map.getZoom(), 15))
          })

          return () => {
            window.google.maps.event.removeListener(listener)
          }
        }
      } catch (error) {
        console.error("Error fitting bounds:", error)
      }
    }
  }, [allProfiles, map])

  // Handle marker click
  const handleMarkerClick = (profile) => {
    setSelected(profile)
    if (map && profile.coordinates) {
      map.panTo({ lat: profile.coordinates.lat, lng: profile.coordinates.lng })
    }
  }

  // Navigate to profile details
  const handleViewDetails = (profileId) => {
    navigate(`/profile/${profileId}`)
  }

  // Custom marker icon based on profile type or status
  const getMarkerIcon = (profile) => {
    if (!window.google) return null;
    
    // You can customize this based on profile properties
    const isSelected = profile.id === selected?.id

    return {
      url: isSelected
        ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      scaledSize: new window.google.maps.Size(isSelected ? 50 : 40, isSelected ? 50 : 40),
      origin: new window.google.maps.Point(0, 0),
      anchor: new window.google.maps.Point(isSelected ? 25 : 20, isSelected ? 50 : 40),
      // Add animation for selected marker
      animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
    }
  }

  // Debug output for troubleshooting
  useEffect(() => {
    console.log("Google Maps API Key:", import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "Not found");
    console.log("isLoaded:", isLoaded);
    console.log("loadError:", loadError);
    console.log("window.google exists:", !!window.google);
    
    // Report error to parent component if provided
    if (loadError && onError) {
      onError(loadError);
    }
  }, [isLoaded, loadError, onError]);

  // Navigation for profiles in the map
  const navigateToNextProfile = () => {
    if (!selected || profilesToShow.length <= 1) return;
    
    const currentIndex = profilesToShow.findIndex(p => p.id === selected.id);
    const nextIndex = (currentIndex + 1) % profilesToShow.length;
    handleMarkerClick(profilesToShow[nextIndex]);
  };
  
  const navigateToPreviousProfile = () => {
    if (!selected || profilesToShow.length <= 1) return;
    
    const currentIndex = profilesToShow.findIndex(p => p.id === selected.id);
    const prevIndex = (currentIndex - 1 + profilesToShow.length) % profilesToShow.length;
    handleMarkerClick(profilesToShow[prevIndex]);
  };

  if (loadError) {
    console.error("Google Maps load error:", loadError);
    return (
      <Paper elevation={3} sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", p: 3 }}>
        <Typography color="error">
          Error loading Google Maps: {loadError.toString()}. Please check your API key and browser console for more details.
        </Typography>
      </Paper>
    )
  }

  if (!isLoaded) {
    return (
      <Paper elevation={3} sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2 }}>Loading Google Maps API...</Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={3} sx={{ height: "100%", overflow: "hidden", borderRadius: 1 }}>
      {profilesToShow.length === 0 ? (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "#f5f5f5",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography color="textSecondary">Select a profile to see its location</Typography>
          <Chip label="Or toggle 'Show all profiles on map'" variant="outlined" size="small" />
        </Box>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={
            selected && selected.coordinates
              ? { lat: selected.coordinates.lat, lng: selected.coordinates.lng }
              : defaultCenter
          }
          zoom={selected ? 15 : 10}
          options={options}
          onLoad={onMapLoad}
        >
          {/* Use MarkerClusterer when showing multiple profiles */}
          {window.google && profilesToShow.length > 1 ? (
            <MarkerClusterer options={clusterOptions}>
              {(clusterer) => (
                <>
                  {profilesToShow.map((profile) => (
                    profile.coordinates && (
                      <Marker
                        key={`marker-${profile.id}`} // Ensure unique keys
                        position={{ lat: profile.coordinates.lat, lng: profile.coordinates.lng }}
                        onClick={() => handleMarkerClick(profile)}
                        clusterer={clusterer}
                        animation={window.google?.maps?.Animation?.DROP}
                        icon={getMarkerIcon(profile)}
                        title={profile.name}
                      />
                    )
                  ))}
                </>
              )}
            </MarkerClusterer>
          ) : (
            // Single marker when only one profile is shown
            window.google && profilesToShow.map((profile) => (
              profile.coordinates && (
                <Marker
                  key={`marker-${profile.id}`}
                  position={{ lat: profile.coordinates.lat, lng: profile.coordinates.lng }}
                  onClick={() => handleMarkerClick(profile)}
                  animation={window.google?.maps?.Animation?.BOUNCE}
                  icon={getMarkerIcon(profile)}
                  title={profile.name}
                />
              )
            ))
          )}

          {/* Info window for selected profile */}
          {window.google && selected && selected.coordinates && (
            <InfoWindow
              position={{ lat: selected.coordinates.lat, lng: selected.coordinates.lng }}
              onCloseClick={() => setSelected(null)}
              options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
            >
              <Card sx={{ maxWidth: 280, boxShadow: "none" }}>
                {/* Navigation controls - only show when there are multiple profiles */}
                {profilesToShow.length > 1 && (
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {/* Previous button */}
                    <IconButton 
                      onClick={navigateToPreviousProfile}
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        left: 0, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                      }}
                    >
                      <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    
                    {/* Next button */}
                    <IconButton 
                      onClick={navigateToNextProfile}
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        right: 0, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                        backgroundColor: 'rgba(255,255,255,0.8)',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                      }}
                    >
                      <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                
                {selected.image && (
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={selected.image}
                      alt={selected.name}
                      sx={{ objectFit: "cover" }}
                    />
                    
                    {/* Profile counter if multiple profiles */}
                    {profilesToShow.length > 1 && (
                      <Chip
                        label={`${profilesToShow.findIndex(p => p.id === selected.id) + 1}/${profilesToShow.length}`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>
                )}
                <CardContent sx={{ p: 1.5 }}>
                  <Typography gutterBottom variant="h6" sx={{ mb: 0.5 }}>
                    {selected.name}
                  </Typography>

                  {selected.rating && (
                    <Chip
                      label={`Rating: ${selected.rating}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  )}

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {selected.address}
                  </Typography>

                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewDetails(selected.id)}
                    sx={{ mt: 0.5 }}
                  >
                    View Profile
                  </Button>
                </CardContent>
              </Card>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </Paper>
  )
}

export default MapComponent