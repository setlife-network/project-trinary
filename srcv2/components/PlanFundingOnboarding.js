import React, { useEffect, useState } from 'react'

import OnboardingNextSection from './OnboardingNextSection'
import Selector from './Selector'
import Section from './Section'

import { CURRENCIES } from '../constants'

const FUNDING_PLAN_TIMEFRAME_AMOUNTS = ['Monthly amount', 'Total amount', 'Quarterly']

const PlanFundingOnboarding = (props) => {

    const {
        goToNextSection,
        project
    } = props

    const [budgetRange, setBudgetRange] = useState(null)
    const [currency, setCurrency] = useState(CURRENCIES[0])
    const [openCurrencyOpts, setOpenCurrencyOpts] = useState(false)
    const [timeframeAmount, setTimeFrameAmount] = useState(FUNDING_PLAN_TIMEFRAME_AMOUNTS[0])
    const [openTimeFrameOpts, setOpenTimeFrameOpts] = useState(false)

    useEffect(() => {
        console.log('project')
        console.log(project)
    }, [])

    const saveAndGoToNextSection = () => {
        return true
    }

    const renderCurrencies = () => {
        const optionClick = (currency) => {
            setOpenCurrencyOpts(false)
            setCurrency(currency)
        }
        return CURRENCIES.map(currency => {
            return (
                <button 
                    type='button'
                    onClick={() => optionClick(currency)}
                    className='text-gray-700 block px-4 py-2 text-sm text-ellipsis overflow-hidden'
                    role='menuitem'
                    tabIndex='-1'
                    id='menu-item-0'
                    key={currency.name}
                >
                    {currency.name}
                </button>    
            )
        })
    }

    const renderTimeFrameOpts = () => {
        const optionClick = (timeframe) => {
            setOpenTimeFrameOpts(false)
            setTimeFrameAmount(timeframe)
        }
        return FUNDING_PLAN_TIMEFRAME_AMOUNTS.map(timeframe => {
            return (
                <button 
                    type='button'
                    onClick={() => optionClick(timeframe)}
                    className='text-gray-700 block px-4 py-2 text-sm text-ellipsis overflow-hidden'
                    role='menuitem'
                    tabIndex='-1'
                    id='menu-item-0'
                    key={timeframe}
                >
                    {timeframe}
                </button>    
            )
        })
    }
    
    return (
        <div>
            <Section>
                <div className='grid grid-cols-1 gap-2'>
                    <p className='text-3xl text-center font-bold'>
                        Plan funding
                    </p>
                    <p>
                        Lorem Ipsum is simply dummy text of the printing and typesetting
                    </p>
                </div>
            </Section>
            <Section>
                <div className='grid grid-flow-col auto-cols-max gap-4'>
                    <div className='rounded-full bg-setlife w-fit px-2 mx-auto'>
                        <p className='p-2 text-lg'>
                            2
                        </p>
                    </div>
                    <p className='m-auto'>
                        Establish budget
                    </p>
                </div>
                <div className='grid grid-cols-1 gap-4 mt-4'>
                    <input 
                        type='text'
                        placeholder='Budget range'
                        className='
                        form-control
                        block
                        w-full
                        px-3
                        py-1.5
                        text-light
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
                    <Selector
                        title={currency.name}
                        renderOptions={renderCurrencies}
                        openOptions={openCurrencyOpts}
                        setOpenOptions={setOpenCurrencyOpts}
                        loadingOptions={false}
                    />
                    <Selector
                        title={timeframeAmount}
                        renderOptions={renderTimeFrameOpts}
                        openOptions={openTimeFrameOpts}
                        setOpenOptions={setOpenTimeFrameOpts}
                        loadingOptions={false}
                    />
                </div>
            </Section>
            <OnboardingNextSection goToNextSection={saveAndGoToNextSection} />
        </div>
    )
}

export default PlanFundingOnboarding