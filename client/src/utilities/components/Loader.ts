 const showLoader = () => {
    localStorage.setItem('isLoading', 'true');
    window.dispatchEvent(new Event('loadingStatusChanged'));
  };
  
 const hideLoader = () => {
    localStorage.setItem('isLoading', 'false');
    window.dispatchEvent(new Event('loadingStatusChanged'));
  };
  
export { showLoader, hideLoader };