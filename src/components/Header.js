
import React from 'react'
import { MDBJumbotron, MDBContainer } from 'mdbreact'

const Header = () => {
  return (
    <MDBJumbotron fluid>
      <MDBContainer className='text-center'>
        <h1 className='display-4'>Git Flow</h1>
        <p>This tool will open new tabs. Enable popups so it works properly.</p>
      </MDBContainer>
    </MDBJumbotron>
  )
}

export default Header
