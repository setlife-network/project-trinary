import React from 'react'
import { render, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import LoginPage from '../pages/LoginPage'

let getByTestId

beforeEach(() => {
    const component = render(<LoginPage />);
    getByTestId = component.getByTestId
})

afterEach(() => {
    cleanup()
})

test('Log in button', () => {
    const buttonEl = getByTestId('button-h3');

    expect(buttonEl.textContent).toBe('Log in with your Github Account')
})