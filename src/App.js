import React from 'react'
import { Route, withRouter, Redirect } from 'react-router-dom'
import { ThemeProvider } from '@material-ui/core/styles'

import theme from './styles/theme'

import AddClientPage from './pages/AddClientPage'
import AddProjectPage from './pages/AddProjectPage'
import Authentication from './components/Authentication'
import ClientDetailPage from './pages/ClientDetailPage'
import ClientsListPage from './pages/ClientsListPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import Navigation from './components/Navigation'
import ProjectDetailPage from './pages/ProjectDetailPage'
import ProjectsListPage from './pages/ProjectsListPage'

import { API_ROOT } from './constants'

class App extends React.Component {

    render() {
        return (
            <div className='App'>
                <Authentication/>
                <Navigation/>
                <ThemeProvider theme={theme}>
                    <Route
                        exact
                        path={['/home', '/']}
                        component={() => <Redirect to={`/home/clients`} />}
                    />
                    <Route
                        path='/home/:list'
                        render={(props) => <HomePage {...props} />}
                    />
                    <Route
                        path='/login'
                        render={(props) => <LoginPage {...props} />}
                    />

                    <Route
                        path='/clients/:clientId'
                        render={(props) => <ClientDetailPage {...props} />}
                    />
                    <Route
                        path='/client/add'
                        render={(props) => <AddClientPage {...props} />}
                    />
                    <Route
                        path='/projects/:projectId'
                        render={(props) => <ProjectDetailPage {...props} />}
                    />
                    <Route
                        path='/project/add/:clientId'
                        render={(props) => <AddProjectPage {...props} />}
                    />
                </ThemeProvider>
            </div>
        )
    }
}

export default withRouter(App)
