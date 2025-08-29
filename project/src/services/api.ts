// Lê a variável de ambiente VITE_API_URL. Se não existir, usa localhost como padrão.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('cedader_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('cedader_token', token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem('cedader_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateCredentials(newUsername: string, newPassword: string) {
    return this.request('/auth/credentials', {
      method: 'PUT',
      body: JSON.stringify({ newUsername, newPassword }),
    });
  }

  // Users endpoints
  async getUsers() {
    return this.request('/users');
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Transactions endpoints
  async getTransactions() {
    return this.request('/transactions');
  }

  async createTransaction(transactionData: any) {
    return this.request('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async updateTransaction(id: string, updates: any) {
    return this.request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTransaction(id: string) {
    return this.request(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // Registrations endpoints
  async getRegistrations() {
    return this.request('/registrations');
  }

  async createRegistration(registrationData: any) {
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async updateRegistration(id: string, updates: any) {
    return this.request(`/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteRegistration(id: string) {
    return this.request(`/registrations/${id}`, {
      method: 'DELETE',
    });
  }

  // Payments endpoints
  async getPayments() {
    return this.request('/payments');
  }

  async createPayment(paymentData: any) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePayment(id: string, updates: any) {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePayment(id: string) {
    return this.request(`/payments/${id}`, {
      method: 'DELETE',
    });
  }

  // Prebendas endpoints
  async getPrebendas() {
    return this.request('/prebendas');
  }

  async createPrebenda(prebendaData: any) {
    return this.request('/prebendas', {
      method: 'POST',
      body: JSON.stringify(prebendaData),
    });
  }

  async updatePrebenda(id: string, updates: any) {
    return this.request(`/prebendas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePrebenda(id: string) {
    return this.request(`/prebendas/${id}`, {
      method: 'DELETE',
    });
  }

  // Pastor Registrations endpoints
  async getPastorRegistrations() {
    return this.request('/pastor-registrations');
  }

  async createPastorRegistration(registrationData: any) {
    return this.request('/pastor-registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async updatePastorRegistration(id: string, updates: any) {
    return this.request(`/pastor-registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deletePastorRegistration(id: string) {
    return this.request(`/pastor-registrations/${id}`, {
      method: 'DELETE',
    });
  }

  // Document Ranges endpoints
  async getDocumentRanges() {
    return this.request('/document-ranges');
  }

  async createDocumentRange(rangeData: any) {
    return this.request('/document-ranges', {
      method: 'POST',
      body: JSON.stringify(rangeData),
    });
  }

  async updateDocumentRange(id: string, updates: any) {
    return this.request(`/document-ranges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteDocumentRange(id: string) {
    return this.request(`/document-ranges/${id}`, {
      method: 'DELETE',
    });
  }

  // Financial Goals endpoints
  async getFinancialGoals() {
    return this.request('/financial-goals');
  }

  async createFinancialGoal(goalData: any) {
    return this.request('/financial-goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async updateFinancialGoal(id: string, updates: any) {
    return this.request(`/financial-goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteFinancialGoal(id: string) {
    return this.request(`/financial-goals/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();

