
import React, { Component } from 'react'
import GithubData from '../data/Github'
import { MDBJumbotron, MDBContainer } from 'mdbreact'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'

class Operations extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: new GithubData(props.token),
      repos: []
    }
  }

  componentWillMount () {
    this._asyncRequest = this.state.data.getRepos()
      .then(repos => {
        this.setState({ repos: repos })
      })
  }

  componentWillUnmount () {
    if (this._asyncRequest) {
      this._asyncRequest.cancel()
    }
  }

  logValue (value) {
    console.log(value)
  }

  render () {
    return (
      <MDBJumbotron fluid>
        <MDBContainer className='text-center'>
          <Autocomplete
            options={this.state.repos}
            getOptionLabel={option => option.name}
            id='input'style={{ width: 300 }}
            renderInput={params => (
              <TextField {...params} label='Choose Repository' variant='outlined' fullWidth />
            )}
          />
        </MDBContainer>
      </MDBJumbotron>
    )
  }
}

export default Operations
