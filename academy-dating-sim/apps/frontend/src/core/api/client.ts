// API service for backend communication
const API_BASE_URL = 'http://localhost:3001';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  // Test API endpoint
  async testApi() {
    try {
      const response = await fetch(`${this.baseUrl}/api/test`);
      return await response.json();
    } catch (error) {
      console.error('API test failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(email: string, username: string, password: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
      return await response.json();
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  // Game data endpoints (future use)
  async saveGame(saveData: any) {
    try {
      const response = await fetch(`${this.baseUrl}/api/game/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(saveData),
      });
      return await response.json();
    } catch (error) {
      console.error('Save game failed:', error);
      throw error;
    }
  }

  async loadGame() {
    try {
      const response = await fetch(`${this.baseUrl}/api/game/load`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });
      return await response.json();
    } catch (error) {
      console.error('Load game failed:', error);
      throw error;
    }
  }

  // Token management
  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  removeToken() {
    localStorage.removeItem('authToken');
  }
}

export const apiService = new ApiService();
export default ApiService;