import React, { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import {
    Icon,
    Snackbar
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { useHistory } from 'react-router-dom'

import Overlay from '../components/Overlay'
import Section from '../components/Section'
import Step from '../components/Step'
import WalletSimpleSetupOnboarding from '../components/WalletSimpleSetupOnboarding'

import { sessionUser } from '../reactivities/variables'

import { UPDATE_WALLET_ADDRESS } from '../operations/mutations/WalletMutations'

import { GET_CONTRIBUTOR_WALLETS } from '../operations/queries/ContributorQueries'

const WalletSimpleSetupPage = () => {

    const [btcAddress, setBtcAddress] = useState(sessionUser().wallet ? sessionUser().wallet.onchain_address : '')
    const [displayAlert, setDisplayAlert] = useState(false)
    const [onboardOverlayOpen, setOnboardOverlayOpen] = useState(false)
    const [onboardingScreenIndex, setOnboardingScreenIndex] = useState(0)

    const openOnboardingOverlay = () => {
        setOnboardingScreenIndex(0)
        setOnboardOverlayOpen(!onboardOverlayOpen)
    }

    const history = useHistory()

    const [
        updateWalletAddress,
        {
            data: updateWalletAddressData,
            loading: updateWalletAddressLoading,
            error: updateWalletAddressError
        }
    ] = useMutation(UPDATE_WALLET_ADDRESS, {
        errorPolicy: 'all',
        refetchQueries: [{
            query: GET_CONTRIBUTOR_WALLETS,
            variables: {
                id: Number(sessionUser().id)
            }
        }],
    })
    
    useEffect(() => {
        if (updateWalletAddressError != undefined || updateWalletAddressData != undefined) {
            setDisplayAlert(true)
        }
    }, [updateWalletAddressError, updateWalletAddressData])

    const handleAlertClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        setDisplayAlert(false)
    }

    const updateAddress = async (address) => {
        const variables = {
            address: address
        }
        await updateWalletAddress({ variables: variables })
    }

    return (
        <div className='WalletSimpleSetupPage h-full min-h-screen'>
            <Section backgroundColor={'bg-white-light'} className={'h-full min-h-screen'}>
                <p className='text-3xl font-bold'>
                    Simple Wallet Setup
                </p>
                <div className='grid grid-cols-6 gap-4 mt-4'>
                    <p className='col-span-5 text-xl font-bold mt-4'>
                        Enter your info below to set up your wallet
                    </p>
                    <div className='info'>
                        <Icon
                            className='icon fas fa-info-circle text-black my-auto'
                            fontSize='medium'
                            onClick={() => setOnboardOverlayOpen(true)}
                        />
                    </div>
                </div>
                <div className='mt-12'>
                    <input 
                        type='text'
                        placeholder='Paste BTC wallet address'
                        value={btcAddress}
                        onChange={(e) => setBtcAddress(e.target.value)}
                        className='
                            form-control
                            block
                            w-full
                            px-3
                            py-1.5
                            text-black
                            font-normal
                            bg-white bg-clip-padding
                            border border-solid border-light
                            rounded-lg
                            transition
                            ease-in-out
                            m-0
                            focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none
                        '
                    />
                </div> 
                <div className='grid absolute bottom-10 left-16 right-16 gap-4'>
                    <button type='button' onClick={() => history.push('/wallet/setup')}>
                        Cancel
                    </button>
                    <button
                        type='button'
                        className={`rounded-full py-2 w-full text-white font-bold ${updateWalletAddressLoading ? 'bg-gray' : 'bg-setlife'}`}
                        onClick={() => updateAddress(btcAddress)}
                        disabled={updateWalletAddressLoading}
                    >
                        Set Up Wallet
                    </button>
                </div>
            </Section>
            <Snackbar
                autoHideDuration={4000}
                open={displayAlert}
                onClose={handleAlertClose}
            >
                {updateWalletAddressError ? (
                    <Alert severity='error'>
                        {`${updateWalletAddressError.message}`}
                    </Alert>
                ) : (
                    <Alert>
                        {`Wallet updated`}
                    </Alert>
                )}
            </Snackbar>
            <Overlay
                open={onboardOverlayOpen}
                setOpen={openOnboardingOverlay}
                height={'h-4/5'}
                goBackAction={onboardingScreenIndex == 0 ? false : () => setOnboardingScreenIndex(onboardingScreenIndex - 1)}
            >
                <WalletSimpleSetupOnboarding
                    onboardingScreenIndex={onboardingScreenIndex}
                    setOnboardingScreenIndex={setOnboardingScreenIndex}
                    setOpen={openOnboardingOverlay}
                />
            </Overlay>
        </div>

    )
}

export default WalletSimpleSetupPage
