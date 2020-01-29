/* eslint-env jest */
import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import Login from '../../pages/Login'

jest.mock('react-router-dom', () => ({ Link: 'Link' }))

describe('With Snapshot Testing', () => {
  it('should match its empty snapshot', () => {
    const component = renderer.create(
      <Login />
    )
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})

describe('With Enzyme Testing', () => {
  it('renders without crashing', () => {
    shallow(<Login />)
  })
})
