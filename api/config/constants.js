require('dotenv').config()

module.exports = {
    GITHUB_OAUTH_URL: 'https://github.com/login/oauth/access_token',
    INVOICELY_CSV_PATH: `${process.env.INVOICELY_CSV_PATH}`,
    SITE_ROOT: process.env.NODE_ENV == 'production'
        ? process.env.SITE_URL
        : 'http://localhost:6002',
    USER_AGENT: `${process.env.USER_AGENT}`,
    GITHUB_PERMISSIONS: [
        {
            github_permission_level: 'read',
            project_permission_level: 'read'
        },
        {
            github_permission_level: 'triage',
            project_permission_level: 'read'
        },
        {
            github_permission_level: 'write',
            project_permission_level: 'write'
        },
        {
            github_permission_level: 'maintain',
            project_permission_level: 'write'
        },
        {
            github_permission_level: 'admin',
            project_permission_level: 'write'
        },
    ],
    STRIPE_PRODUCT_PLACEHOLDER_ID: process.env.STRIPE_PRODUCT_PLACEHOLDER_ID || '',
    DEFAULT_STRIPE_CURRENCY: 'USD',
    STRIPE_SUPPORTED_CURRENCIES: [
        'USD',
        'MXN',
        'EUR'
    ]
}
