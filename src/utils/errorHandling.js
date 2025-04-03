// src/utils/errorHandling.js
export const handleAsyncError = async (asyncFn, errorMessage = "An error occurred") => {
    try {
      return await asyncFn();
    } catch (error) {
      console.error(error);
      throw new Error(errorMessage);
    }
  };
  
  export const formatErrorMessage = (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return "An unexpected error occurred. Please try again.";
  };