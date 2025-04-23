/**
 * Get the authenticated user data from localStorage
 */
export const getUserData = () => {
  try {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) return null;
    
    const userData = JSON.parse(userDataString);
    return userData;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Get the authenticated user ID from localStorage
 * @returns The user ID from the stored userData, or null if not found
 */
export const getUserId = (): string | number | null => {
  const userData = getUserData();
  
  // Return user_id from the stored structure
  if (userData?.userData?.user_id) {
    return userData.userData.user_id;
  }
  
  // Alternative locations based on your API response structure
  if (userData?.user_id) {
    return userData.user_id;
  }
  
  if (userData?.userData?.id) {
    return userData.userData.id;
  }
  
  if (userData?.id) {
    return userData.id;
  }
  
  return null;
};

/**
 * Get the authenticated user ID with fallback to default value
 * @param defaultId Default ID to use if user ID is not available
 * @returns The user ID or the provided default
 */
export const getUserIdWithFallback = (defaultId: string | number = 1): string | number => {
  return getUserId() ?? defaultId;
};