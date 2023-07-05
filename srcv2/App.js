import React from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import PublicRoute from './components/PublicRoute'
import PrivateRoute from './components/PrivateRoute'

import Authentication from './components/Authentication'

import CreateProjectPage from './pages/CreateProjectPage'
import AddPaymentPage from './pages/AddPaymentPage'
import DashboardPage from './pages/DashboardPage'
import EditPaymentPage from './pages/EditPaymentPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OnboardingPage from './pages/OnboardingPage'
import OnboardingContributorPage from './pages/OnboardingContributorPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import WalletSetupPage from './pages/WalletSetupPage'
import WalletSimpleSetupPage from './pages/WalletSimpleSetupPage'
import AdvancedWalletSetup from './components/AdvancedWalletSetup'

class App extends React.Component {
    render() {
        return (
            <div className='App'>
                <Authentication/>
                <div className='content'>
                    <PublicRoute
                        restricted
                        path='/'
                        component={LandingPage}
                        exact
                    />
                    <PublicRoute
                        restricted
                        path='/login'
                        component={LoginPage}
                        exact
                    />
                    <PrivateRoute
                        exact
                        path={'/dashboard'}
                        component={DashboardPage}
                    />
                    <PrivateRoute
                        exact
                        path='/onboarding'
                        component={OnboardingPage}
                    />
                    <PrivateRoute
                        exact
                        path='/onboarding-contributor'
                        component={OnboardingContributorPage}
                    />
                    <PrivateRoute
                        exact
                        path='/create-project'
                        component={CreateProjectPage}
                    />
                    <PrivateRoute
                        exact
                        path='/projects/:projectId'
                        component={ProjectDetailPage}
                    /> 
                    <PrivateRoute
                        exact
                        path='/add-payment/:projectId'
                        component={AddPaymentPage}
                    />
                    <PrivateRoute
                        exact
                        path='/payments/edit/:paymentId'
                        component={EditPaymentPage}
                    />     
                    <PrivateRoute 
                        exact
                        path='/wallet/setup'
                        component={WalletSetupPage}
                    />   
                    <PrivateRoute 
                        exact
                        path='/wallet/setup/simple'
                        component={WalletSimpleSetupPage}
                    />            
                    <PrivateRoute 
                        exact
                        path='/wallet/setup/advanced'
                        component={AdvancedWalletSetup}
                    />          
                </div>
            </div>
        )
    }
}

export default withRouter(App)
