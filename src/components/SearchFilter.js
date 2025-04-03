import React, { useState } from 'react';
import { Paper, InputBase, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const SearchFilter = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = () => {
    onSearch(searchTerm);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <Paper
      component="div"
      sx={{ 
        p: '2px 4px', 
        display: 'flex', 
        alignItems: 'center', 
        width: { xs: '100%', sm: '400px' } 
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search profiles by name, address, or description"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {searchTerm && (
        <IconButton size="small" onClick={handleClear}>
          <ClearIcon />
        </IconButton>
      )}
      <IconButton onClick={handleSearch}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchFilter;