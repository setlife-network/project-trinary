export const API_ROOT = process.env.REACT_APP_API_URL
export const IS_PRODUCTION = process.env.NODE_ENV == 'production' ? true : false
export const GITHUB_LOGO_URL = 'https://project-trinary.s3.us-east-1.amazonaws.com/images/github-icon.png'
export const HERO_IMAGE_URL = 'https://project-trinary.s3.us-east-1.amazonaws.com/images/landing-banner.png'
export const IPHONE_IMAGE_URL = 'https://project-trinary.s3.us-east-1.amazonaws.com/images/iphone-landing-mockup.png'
export const BUDGETING_IMAGE_URL = 'https://project-trinary.s3.us-east-1.amazonaws.com/images/budget-landing-mockup.png'
export const CURRENCIES = [
    {
        name: 'USD',
        symbol: '$',
        decimal: '.',
        thousand: ',',
        precision: 2,
    },
    {
        name: 'MXN',
        symbol: '$',
        decimal: '.',
        thousand: ',',
        precision: 2,
    },
    {
        name: 'EUR',
        symbol: '€',
        decimal: ',',
        thousand: '.',
        precision: 2,
    },
    {
        name: 'BTC',
        symbol: '₿',
        decimal: '.',
        thousand: ',',
        precision: 2,
    },
    {
        name: 'SATS',
        symbol: 's ',
        decimal: '.',
        thousand: ',',
        precision: 0,
    },
    {
        name: '',
        symbol: '',
        decimal: '.',
        thousand: ',',
        precision: 2,
    }
]
export const FOOTER_LINKS = [
    {
        type: 'GitHub',
        logo: GITHUB_LOGO_URL,
        url: 'https://github.com/setlife-network'
    },
    {
        type: 'YouTube',
        logo: 'https://project-trinary.s3.us-east-1.amazonaws.com/images/youtube-icon.png',
        url: ''
    },
    {
        type: 'Twitter',
        logo: 'https://project-trinary.s3.us-east-1.amazonaws.com/images/twitter-icon.png',
        url: ''
    },
    {
        type: 'LinkedIn',
        logo: 'https://project-trinary.s3.us-east-1.amazonaws.com/images/linkedin-vector.png',
        url: 'https://www.linkedin.com/company/setlife-network/'
    }
]