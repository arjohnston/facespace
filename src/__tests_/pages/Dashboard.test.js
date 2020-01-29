/* eslint-env jest */
import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'

import Dashboard from '../../pages/Dashboard'

describe('With Snapshot Testing', () => {
  it('should match its empty snapshot', () => {
    const component = renderer.create(<Dashboard />)
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})

describe('With Enzyme Testing', () => {
  it('renders without crashing', () => {
    shallow(<Dashboard />)
  })
})
