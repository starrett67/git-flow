import React, { Component } from 'react'
import Github from './components/Github'
import Header from './components/Header'
import Operations from './components/Operations'
import GitGraph from './components/GitGraph'
import Cookies from 'universal-cookie'
import { MDBContainer, MDBRow, MDBCol } from 'mdbreact'

import './App.css'

const cookies = new Cookies()

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      github: cookies.get('github') || null,
      selectedRepo: {},
      operationData: {
        operationType: '',
        branchName: '',
        branchType: ''
      }
    }
    console.log(this.state)
  }

  onSuccess (response) {
    cookies.set('github', response, { path: '/' })
    this.setState({ github: response })
  }

  onFailure (response) { console.log(response) }

  onSetOperationData = (data) => {
    this.setState({ operationData: data })
  }

  renderLogin () {
    if (this.state.github) {
      return (<Operations token={this.state.github._token.accessToken}  onSetOperationData={this.onSetOperationData} />)
    } else {
      return (<Github onSuccess={(res) => this.onSuccess(res)} onFailure={(res) => this.onFailure(res)} />)
    }
  }

  renderGitGraph () {
    if (this.state.operationData.operationType && this.state.operationData.branchName && this.state.operationData.branchType) {
      return (
        <GitGraph operationData={this.state.operationData} />
      )
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
          {this.renderGitGraph()}
        <MDBRow />
      </MDBContainer>
    )
  }
}

export default App
