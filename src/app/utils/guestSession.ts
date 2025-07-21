// Generate unique guest ID
export const generateGuestId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `guest_${timestamp}_${random}`;
};

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

// Get or create guest ID
export const getGuestId = (): string => {
  if (!isBrowser) return 'guest_ssr';
  
  let guestId = sessionStorage.getItem('guestId');
  if (!guestId) {
    guestId = generateGuestId();
    sessionStorage.setItem('guestId', guestId);
  }
  return guestId;
};

// Clear guest session
export const clearGuestSession = (): void => {
  if (!isBrowser) return;
  
  const guestId = sessionStorage.getItem('guestId');
  if (guestId) {
    localStorage.removeItem(`chatSessions_${guestId}`);
  }
  sessionStorage.removeItem('guestId');
};

// Check if current session is guest
export const isGuestSession = (): boolean => {
  if (!isBrowser) return true; // Default to guest on server
  return !localStorage.getItem('userId'); // Assume userId exists for logged users
};