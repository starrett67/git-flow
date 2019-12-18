import React, { Component } from 'react'
import Github from './components/Github'
import Header from './components/Header'
import Operations from './components/Operations'
import Cookies from 'universal-cookie'
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'

import './App.css'

const cookies = new Cookies()

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      github: cookies.get('github') || null
    }
    console.log(this.state)
  }

  onSuccess (response) {
    cookies.set('github', response, { path: '/' })
    this.setState({ github: response })
  }

  onFailure (response) { console.log(response) }

  renderLogin () {
    if (this.state.github) {
      return (<Operations token={this.state.github._token.accessToken} />)
    } else {
      return (<Github onSuccess={(res) => this.onSuccess(res)} onFailure={(res) => this.onFailure(res)} />)
    }
  }

  render () {
    return (
      <MDBContainer fluid>
        <MDBRow>
          <MDBCol>
            <Header />
          </MDBCol>
        </MDBRow>
        <MDBRow className='mt-1'>
          <MDBCol className='text-center'>
            {this.renderLogin()}
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    )
  }
}

export default App
