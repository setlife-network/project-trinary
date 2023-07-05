import React, { useState, useEffect } from 'react'
import CurrencyTextField from '@unicef/material-ui-currency-textfield'
import { Icon } from '@material-ui/core'

import { selectCurrencyInformation } from '../scripts/selectors'

const SendBonusEqualy = (props) => {

    const {
        setSelectedContributors,
        project,
        setBonusAmount
    } = props

    const [selectedContributorsIdx, setSelectedContributorsIdx] = useState([])

    useEffect(() => {
        const contributors = project.contributors.filter((c, idx) => selectedContributorsIdx.includes(idx))
        setSelectedContributors(contributors)
    }, [selectedContributorsIdx])

    const currencyInformation = 
        selectCurrencyInformation({
            currency: 'USD'
        }) 

    const selectContributor = (idx) => {
        if (selectedContributorsIdx.includes(idx)) {
            setSelectedContributorsIdx(
                selectedContributorsIdx.filter(c => c != idx)
            )
            return
        }
        setSelectedContributorsIdx([...selectedContributorsIdx, idx])
    }

    const handleBonusAmountChange = (amount) => {
        if (amount.includes('.')) {
            setBonusAmount(amount.slice(0, amount.indexOf('.')))
            return
        }
        setBonusAmount(amount)
    }

    const allContributorsSelected = selectedContributorsIdx.length == project.contributors.length

    const renderContributors = (contributors) => {
        return contributors.map((c, idx) => {
            const isSelected = selectedContributorsIdx.includes(idx)
            return (
                <div className='contributor mb-3 flex'>
                    <button
                        type='button'
                        onClick={() => selectContributor(idx)}
                        className={`mr-4 rounded-full border-solid border-2 border-setlife text-center h-6 w-6 text-sm col-span-1 my-auto ${isSelected ? 'bg-setlife' : 'bg-white'}`}
                    >
                        <Icon className='icon fa-solid fa-check text-white text-center w-full h-full m-auto align-middle' fontSize='inherit'/>
                    </button>
                    <div className='my-auto rounded-full h-10 w-10 bg-light text-4xl text-center col-span-1'>
                        <Icon className='icon fas fa-user text-gray text-center w-full h-full mt-2.5' fontSize='medium'/>
                    </div>
                    <div className='my-auto col-span-6 pl-4'>
                        <p className='truncate'>
                            {c.name}
                        </p>
                    </div>
                </div>
            )
        })
    }

    const indicesArray = Array.from({ length: project.contributors.length }, (value, index) => index);

    return (
        <div className='SendBonusEqualy'>
            <div className='mt-10'>
                <CurrencyTextField
                    fullWidth
                    label='Payment amount'
                    variant='outlined'
                    currencySymbol={`${currencyInformation['symbol']}`}
                    minimumValue='0'
                    outputFormat='string'
                    decimalCharacter={`${currencyInformation['decimal']}`}
                    digitGroupSeparator={`${currencyInformation['thousand']}`}
                    onChange={(event) => handleBonusAmountChange(event.target.value)}
                />
            </div>
            <div className='mt-10'>
                <p className='font-bold text-md mb-4'>
                    Active contributors for this project
                </p>
                <button
                    type='button'
                    onClick={() => setSelectedContributorsIdx(allContributorsSelected ? [] : indicesArray)}
                    className={`rounded-full border-solid border-2 border-med-gray bg-med-gray text-center text-sm my px-4 py-1 mb-4`}
                >
                    {allContributorsSelected ? 'Select None' : 'Select All'}
                </button>
                <div className='overflow-scroll h-80'>
                    {renderContributors(project.contributors)}
                </div>
            </div> 
        </div>
    )
}

export default SendBonusEqualy