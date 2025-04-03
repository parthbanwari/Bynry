import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Paper, Typography, Table, TableContainer, TableHead, 
  TableBody, TableRow, TableCell, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Chip, Avatar, Tooltip, Alert, TextField, InputAdornment,
  TablePagination, Skeleton, useTheme, useMediaQuery
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import { getProfiles, deleteProfile } from '../../services/profileService';
import Loading from '../Loading';

const AdminProfileList = ({ onEditProfile }) => {
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const fetchProfiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfiles();
      setProfiles(data);
      setFilteredProfiles(data);
    } catch (err) {
      setError("Failed to load profiles. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProfiles(profiles);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = profiles.filter(profile => 
        profile.name.toLowerCase().includes(lowercasedSearch) ||
        profile.address.toLowerCase().includes(lowercasedSearch) ||
        profile.contact.toLowerCase().includes(lowercasedSearch)
      );
      setFilteredProfiles(filtered);
    }
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, profiles]);
  
  const handleDeleteClick = (profile) => {
    setProfileToDelete(profile);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!profileToDelete) return;
    
    try {
      await deleteProfile(profileToDelete.id);
      setProfiles(profiles.filter(p => p.id !== profileToDelete.id));
      setDeleteDialogOpen(false);
      setProfileToDelete(null);
    } catch (err) {
      setError("Failed to delete profile. Please try again.");
      console.error(err);
    }
  };
  
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProfileToDelete(null);
  };
  
  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
  const handleRefresh = () => {
    fetchProfiles();
  };
  
  if (loading && profiles.length === 0) {
    return <Loading message="Loading profiles..." />;
  }
  
  // Calculate pagination
  const emptyRows = page > 0 
    ? Math.max(0, (1 + page) * rowsPerPage - filteredProfiles.length) 
    : 0;
  
  const paginatedProfiles = filteredProfiles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
          Manage Profiles ({filteredProfiles.length})
        </Typography>
        
        <TextField
          placeholder="Search profiles..."
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: isMobile ? '100%' : 250 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { borderRadius: 1 }
          }}
        />
      </Box>
      
      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{ borderRadius: 2, overflow: 'hidden' }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="profiles table">
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell>Profile</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Location</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Loading skeleton
              Array.from(new Array(rowsPerPage)).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width={150} />
                    </Box>
                  </TableCell>
                  <TableCell><Skeleton variant="text" width={180} /></TableCell>
                  <TableCell><Skeleton variant="text" width={200} /></TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Skeleton variant="circular" width={30} height={30} />
                      <Skeleton variant="circular" width={30} height={30} />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : paginatedProfiles.length > 0 ? (
              paginatedProfiles.map((profile) => (
                <TableRow 
                  key={profile.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={profile.image} 
                        alt={profile.name}
                        sx={{ width: 40, height: 40 }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{profile.name}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {profile.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">{profile.contact}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">{profile.address}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Edit profile">
                        <IconButton 
                          color="primary" 
                          onClick={() => onEditProfile(profile)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete profile">
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteClick(profile)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <PersonIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography variant="subtitle1" color="text.secondary">
                      {searchTerm ? 'No profiles match your search' : 'No profiles found'}
                    </Typography>
                    {searchTerm && (
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => setSearchTerm('')}
                      >
                        Clear Search
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            )}
            
            {emptyRows > 0 && (
              <TableRow style={{ height: 73 * emptyRows }}>
                <TableCell colSpan={4} />
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProfiles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the profile for <strong>{profileToDelete?.name}</strong>? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleDeleteCancel} 
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 1 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProfileList;