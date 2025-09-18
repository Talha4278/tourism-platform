// Configuration for the Tourism Platform
const CONFIG = {
    // Backend configuration
    BACKEND: {
        // ASP.NET Core backend only
        API_BASE_URL: 'http://localhost:5000/api'
    },
    
    // Application settings
    APP: {
        NAME: 'Tourism Platform',
        VERSION: '2.0.0',
        DESCRIPTION: 'A full-stack tourism platform with ASP.NET Core 8.0 Web API backend'
    },
    
    // Feature flags
    FEATURES: {
        ENABLE_SWAGGER: true,
        ENABLE_ANALYTICS: false,
        ENABLE_NOTIFICATIONS: true
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
