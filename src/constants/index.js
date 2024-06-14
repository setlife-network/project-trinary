export const API_ROOT = process.env.REACT_APP_API_URL
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
export const EXPECTED_BUDGET_TIMEFRAME_OPTIONS = [
    {
        value: 'daily',
        label: 'daily'
    },
    {
        value: 'weekly',
        label: 'weekly'
    },
    {
        value: 'quarterly',
        label: 'quarterly'
    },
    {
        value: 'monthly',
        label: 'monthly'
    },
    {
        value: 'yearly',
        label: 'yearly'
    }
]
export const IS_PRODUCTION = process.env.NODE_ENV == 'production' ? true : false
export const ISSUES_LIMIT = 20
export const LOGO_URL = 'https://project-trinary.s3.amazonaws.com/images/Logo.png'
export const MAX_INT = 2147483647
export const NAV_ITEMS = [
    {
        text: 'Home',
        route: '/',
    },
    {
        text: 'LoginPage',
        route: '/login',
    },
    {
        text: 'Clients List Page',
        route: '/clients'
    },
    {
        text: 'ClientDetailPage',
        route: '/clients/1',
    },
    {
        text: 'AddClientPage',
        route: '/client/add',
    },
    {
        text: 'ProjectDetailPage',
        route: '/projects/1',
    },
    {
        text: 'AddProjectPage',
        route: '/project/add'
    }
]
export const NAV_TITLES = [
    {
        title: 'Add Client',
        locations: ['/client/add']
    },
    {
        title: 'Add Payment',
        locations: ['/payments/add']
    },
    {
        title: 'Add Project',
        locations: ['/project/add/']
    },
    {
        title: 'Client',
        locations: ['/clients/']
    },
    {
        title: 'Clients',
        locations: ['/home/clients']
    },
    {
        title: 'Contributor',
        locations: ['/contributor']
    },
    {
        title: 'Login',
        locations: ['/login']
    },
    {
        title: 'Projects',
        locations: ['/home/projects']
    },
    {
        title: '',
        locations: ['/']
    }
]
export const SMALL_LOGO_URL = 'https://project-trinary.s3.amazonaws.com/images/SmallLogo.png'
export const TIME_RANGES = [
    {
        description: 'This week',
        periodRange: 'weeks',
        since: 0
    }, {
        description: 'Last week',
        periodRange: 'weeks',
        since: 1
    }, {
        description: 'This month',
        periodRange: 'months',
        since: 0
    }, {
        description: 'Last month',
        periodRange: 'months',
        since: 1
    }, {
        description: 'This year',
        periodRange: 'years',
        since: 0
    }, {
        description: 'Last year',
        periodRange: 'years',
        since: 1
    }
]
export const INVALID_TOGGL_URL_ERROR_MESSAGE = 'Toggl URL is invalid, please use the following format https://track.toggl.com/###/projects/###'