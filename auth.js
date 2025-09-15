// Supabase configuration
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Note: Users will need to replace these with their actual Supabase credentials
let supabase;

try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (error) {
    console.warn('Supabase not configured. Using demo mode.');
    supabase = null;
}

// Authentication module
const Auth = {
    currentUser: null,
    isRegistering: false,
    
    init() {
        this.setupEventListeners();
        this.checkSession();
    },
    
    setupEventListeners() {
        const loginBtn = document.getElementById('loginBtn');
        const authForm = document.getElementById('authForm');
        const toggleAuthMode = document.getElementById('toggleAuthMode');
        const closeButtons = document.querySelectorAll('.close');
        
        loginBtn.addEventListener('click', () => this.showLoginModal());
        authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        toggleAuthMode.addEventListener('click', () => this.toggleAuthMode());
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });
        
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    },
    
    async checkSession() {
        if (!supabase) {
            this.updateUI();
            return;
        }
        
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                this.currentUser = session.user;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    },
    
    showLoginModal() {
        if (this.currentUser) {
            this.logout();
        } else {
            document.getElementById('loginModal').classList.remove('hidden');
        }
    },
    
    closeModals() {
        document.getElementById('loginModal').classList.add('hidden');
        document.getElementById('leaderboardModal').classList.add('hidden');
        this.clearMessage();
    },
    
    toggleAuthMode() {
        this.isRegistering = !this.isRegistering;
        const submitBtn = document.getElementById('submitBtn');
        const toggleBtn = document.getElementById('toggleAuthMode');
        
        if (this.isRegistering) {
            submitBtn.textContent = 'Register';
            toggleBtn.textContent = 'Already have an account? Login';
        } else {
            submitBtn.textContent = 'Login';
            toggleBtn.textContent = 'Need an account? Register';
        }
        
        this.clearMessage();
    },
    
    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (!supabase) {
            this.handleDemoAuth(email);
            return;
        }
        
        try {
            if (this.isRegistering) {
                await this.register(email, password);
            } else {
                await this.login(email, password);
            }
        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    },
    
    async register(email, password) {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        if (data.user) {
            this.showMessage('Registration successful! Please check your email for verification.', 'success');
            // Don't auto-login until email is verified
        }
    },
    
    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) throw error;
        
        this.currentUser = data.user;
        this.updateUI();
        this.closeModals();
        this.showMessage('Login successful!', 'success');
        
        // Clear the message after a short delay
        setTimeout(() => this.clearMessage(), 2000);
    },
    
    handleDemoAuth(email) {
        // Demo mode - simulate authentication
        this.currentUser = {
            id: 'demo-user',
            email: email,
            user_metadata: { full_name: email.split('@')[0] }
        };
        
        this.updateUI();
        this.closeModals();
        this.showMessage('Demo login successful!', 'success');
        
        setTimeout(() => this.clearMessage(), 2000);
    },
    
    async logout() {
        if (supabase && this.currentUser && this.currentUser.id !== 'demo-user') {
            try {
                await supabase.auth.signOut();
            } catch (error) {
                console.error('Error signing out:', error);
            }
        }
        
        this.currentUser = null;
        this.updateUI();
    },
    
    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        
        if (this.currentUser) {
            const displayName = this.currentUser.user_metadata?.full_name || 
                              this.currentUser.email.split('@')[0];
            loginBtn.textContent = `Logout (${displayName})`;
            loginBtn.title = 'Click to logout';
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.title = 'Click to login or register';
        }
    },
    
    showMessage(text, type) {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
    },
    
    clearMessage() {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = '';
        messageEl.className = 'message';
    }
};

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});