
import React, { Component } from 'react'
import GithubData from '../data/Github'
import { MDBJumbotron, MDBContainer, MDBCol, MDBRow } from 'mdbreact'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button';

class Operations extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: new GithubData(props.token),
      repos: [],
      selectedRepo: {},
      operationType: '',
      branchType: '',
      branchName: ''
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

  getBranchName () {
    return `${this.state.branchType}/${this.state.branchName}`
  }

  selectRepo = (event, value) => {
    this.setState({ selectedRepo: value, operationType: '', branchType: '', branchName: '' }, () => {
      if (value && JSON.stringify(value) !== '{}') {
        this.state.data.getBranches(this.state.selectedRepo)
      }
    })
  }

  selectOperation = (event, value) => {
    this.setState({ operationType: value, branchName: '' })
  }

  selectBranchType = (event, value) => {
    this.setState({ branchType: value })
  }

  selectRepoBranch = (event, value) => {
    if (!value) { value = {name: ''}}
    this.setState({branchName: value.name})
  }

  setBranchName = (event) => {
    const name = event.target.value.replace(/[^a-zA-Z0-9]/g, '-');
    this.setState({ branchName: name })
  }

  renderOperationType () {
    if (this.state.selectedRepo && JSON.stringify(this.state.selectedRepo) !== '{}') {
      return (
        <Autocomplete
          options={['Create Branch', 'Merge Branch']}
          getOptionLabel={option => option}
          id='operation-type'
          renderInput={params => (
            <TextField {...params} label='Select Operation' variant='outlined' fullWidth />
          )}
          onChange={this.selectOperation}
          value={this.state.operationType}
        />
      )
    }
  }

  renderBranchType () {
    return (
      <MDBCol className="col-4">
        <Autocomplete
          options={['bugfix', 'feature', 'release', 'hotfix']}
          getOptionLabel={option => option}
          id='branch-type'
          renderInput={params => (
            <TextField {...params} label='Branch Type' variant='outlined' fullWidth />
          )}
          onChange={this.selectBranchType}
          value={this.state.branchType}
        />       
      </MDBCol>
    )
  }

  renderBranchName () {
    return (
      <MDBCol>              
        <TextField id="branch-name" label="Branch Name" variant="outlined" onChange={this.setBranchName} fullWidth />
      </MDBCol>
    )
  }

  renderRepoBranches () {
    return (
      <MDBCol>
        <Autocomplete
          options={this.state.selectedRepo.branches}
          getOptionLabel={option => option.name}
          id='repo-branches'
          renderInput={params => (
            <TextField {...params} label='Select Branch' variant='outlined' fullWidth />
          )}
          onChange={this.selectRepoBranch}
          loading={this.state.selectedRepo.branches === undefined || this.state.selectedRepo.branches.length === 0}
        />       
      </MDBCol>
    )
  }

  renderOperationParams () {
    if (this.state.operationType === 'Create Branch') {
      return (
        <MDBRow>
          {this.renderBranchType()}
          {this.renderBranchName()}
        </MDBRow>
      )
    }
    if (this.state.operationType === 'Merge Branch') {
      return (
        <MDBRow>
          {this.renderBranchType()}
          {this.renderRepoBranches()}
        </MDBRow>
      )
    }
  }

  renderSubmit () {
    if (this.state.branchName !== '') {
      return (
      <Button variant="contained">{this.state.operationType}: {this.getBranchName()}</Button>
      )
    }
  }

  render () {
    return (
      <MDBJumbotron fluid>
        <MDBContainer className='text-center'>
          <MDBRow>
            <MDBCol>
              <MDBRow>
                <MDBCol>
                  <Autocomplete
                    options={this.state.repos}
                    getOptionLabel={option => option.name}
                    id='repository-list'
                    renderInput={params => (
                      <TextField {...params} label='Choose Repository' variant='outlined' fullWidth />
                    )}
                    loading={this.state.repos.length === 0}
                    onChange={this.selectRepo}
                    value={this.state.selectedRepo.name}
                  />
                </MDBCol>
                <MDBCol>  
                  {this.renderOperationType()}
                </MDBCol>
              </MDBRow>
            </MDBCol>
            <MDBCol>
              {this.renderOperationParams()}
            </MDBCol>
          </MDBRow>
          <MDBRow>
            {this.renderSubmit()}
          </MDBRow>
        </MDBContainer>
      </MDBJumbotron>
    )
  }
}

export default Operations
