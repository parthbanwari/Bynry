import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, Grid, 
  FormHelperText, Alert, Snackbar, CircularProgress
} from '@mui/material';
import { createProfile, updateProfile } from '../../services/profileService';
import { geocodeAddress } from '../../services/geocodingService';

const ProfileForm = ({ profile, onSubmitSuccess }) => {
  const isEditing = !!profile;
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    image: profile?.image || '',
    description: profile?.description || '',
    address: profile?.address || '',
    contact: profile?.contact || '',
    interests: profile?.interests 
      ? Array.isArray(profile.interests) 
        ? profile.interests.join(', ') 
        : profile.interests 
      : ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Reset form when profile prop changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        image: profile.image || '',
        description: profile.description || '',
        address: profile.address || '',
        contact: profile.contact || '',
        interests: Array.isArray(profile.interests) 
          ? profile.interests.join(', ') 
          : profile.interests || ''
      });
      setErrors({});
      setSubmitError(null);
    }
  }, [profile]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    } else if (!formData.image.match(/^https?:\/\/.+/)) {
      newErrors.image = 'Must be a valid URL starting with http:// or https://';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact information is required';
    } else if (!formData.contact.includes('@')) {
      newErrors.contact = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when field is being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // Get coordinates for the address
      const coordinates = await geocodeAddress(formData.address);
      
      // Process interests from comma-separated string to array
      const interests = typeof formData.interests === 'string' 
        ? formData.interests
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '')
        : formData.interests;
      
      const profileData = {
        ...formData,
        interests,
        coordinates
      };
      
      if (isEditing && profile?.id) {
        await updateProfile(profile.id, profileData);
      } else {
        await createProfile(profileData);
      }
      
      setSubmitSuccess(true);
      
      // Notify parent component
      setTimeout(() => {
        onSubmitSuccess();
      }, 1500);
      
    } catch (err) {
      setSubmitError("Failed to save profile. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSnackbarClose = () => {
    setSubmitSuccess(false);
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'medium' }}>
        {isEditing ? "Edit Profile" : "Add New Profile"}
      </Typography>
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              disabled={submitting}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Contact (Email)"
              name="contact"
              type="email"
              value={formData.contact}
              onChange={handleChange}
              error={!!errors.contact}
              helperText={errors.contact}
              disabled={submitting}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Image URL"
              name="image"
              value={formData.image}
              onChange={handleChange}
              error={!!errors.image}
              helperText={errors.image || "URL to profile image"}
              disabled={submitting}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
            {formData.image && !errors.image && (
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                <Box
                  component="img"
                  src={formData.image}
                  alt="Profile preview"
                  sx={{
                    height: 100,
                    width: 100,
                    objectFit: 'cover',
                    borderRadius: 1,
                    border: '1px solid #e0e0e0'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/100?text=Invalid+URL';
                  }}
                />
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              disabled={submitting}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
            <FormHelperText>
              Please enter a complete address for accurate mapping
            </FormHelperText>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              disabled={submitting}
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Interests"
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              disabled={submitting}
              helperText="Enter interests separated by commas"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                variant="outlined"
                onClick={onSubmitSuccess}
                disabled={submitting}
                sx={{ borderRadius: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ borderRadius: 1 }}
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {submitting ? 'Saving...' : isEditing ? 'Update Profile' : 'Add Profile'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar
        open={submitSuccess}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={`Profile ${isEditing ? 'updated' : 'created'} successfully`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Paper>
  );
};

export default ProfileForm;