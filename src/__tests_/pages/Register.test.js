/* eslint-env jest */
import React from 'react'
import renderer from 'react-test-renderer'
import { shallow } from 'enzyme'
import Register from '../../pages/Register'

describe('With Snapshot Testing', () => {
  it('should match its empty snapshot', () => {
    const component = renderer.create(
      <Register />
    )
    const tree = component.toJSON()

    expect(tree).toMatchSnapshot()
  })
})

describe('With Enzyme Testing', () => {
  it('renders without crashing', () => {
    shallow(<Register />)
  })
})
