import { jwtDecode } from 'jwt-decode';

class AuthService {
  // Get user profile from decoded token
  getProfile() {
    return jwtDecode(this.getToken());
  }

  // Check if user is logged in by verifying token existence and expiration
  loggedIn() {
    const token = this.getToken();
    return token && !this.isTokenExpired(token);
  }

  // Check if token is expired
  isTokenExpired(token) {
    if (!token) {
      // If token is not available, consider it as expired
      localStorage.removeItem('id_token');
      return true;
    }
    const decoded = jwtDecode(token);
    if (decoded.exp < Date.now() / 1000) {
      localStorage.removeItem('id_token');
      this.logout();
      return true;
    }
    return false;
  }

  // Get token from local storage
  getToken() {
    return localStorage.getItem('id_token');
  }

  // Store token in local storage and redirect to home page
  login(idToken) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  // Remove token from local storage and reload page
  logout(callback) {
    localStorage.removeItem('id_token');
    if (callback) {
      callback();
    }
    window.location.reload();
  }
}

// Create an instance of AuthService
const authService = new AuthService();

// Export the instance variable
export default authService;
