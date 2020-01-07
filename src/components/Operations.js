
import React, { Component } from 'react'
import GithubData from '../data/Github'
import { MDBJumbotron, MDBContainer, MDBCol, MDBRow } from 'mdbreact'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
class Operations extends Component {
  constructor (props) {
    super(props)
    this.state = {
      data: new GithubData(props.token),
      repos: [],
      selectedRepo: JSON.parse(localStorage.getItem('repository')) || {},
      operationType: localStorage.getItem('operationType') || '',
      branchType: localStorage.getItem('branchType') || '',
      branchName: localStorage.getItem('branchName') || ''
    }
    this.setOperationData()
  }

  UNSAFE_componentWillMount () {
    this._asyncRequest = this.state.data.getRepos()
      .then(repos => {
        this.setState({ repos: repos })
        try {
          if (this.repoIsSelected) {
            const updatedRepo = repos.find(r => r.name === this.state.selectedRepo.name)
            this.selectRepo(null, updatedRepo)
          }
        }
        catch(e) {}
      })
  }

  componentWillUnmount () {
    if (this._asyncRequest) {
      try {
        this._asyncRequest.cancel()
      }
      catch(e) {}
    }
  }

  getBranchName () {
    let name = this.state.branchName
    if (this.state.operationType === 'Create Branch') {
      name =`${this.state.branchType}/${name}`
    }
    return name
  }

  getBranchByName() {
    if (this.repoIsSelected() && this.state.selectedRepo.branches && this.getBranchName()) {
      return this.state.selectedRepo.branches.find(b => b.name === this.getBranchName())
    }
    return {name: ''}
  }

  getValidBranches () {
    if (this.state.selectedRepo && this.state.selectedRepo.branches && this.state.selectedRepo.branches.length > 0) {
      return this.state.selectedRepo.branches.filter(b => b.name !== 'master' && b.name !== 'develop')
    }
    return [{name: ''}]
  }

  getMergeTargets () {
    if (this.state.branchType) {      
      let mergeTargets = ['develop']
      if (this.state.branchType === 'release' || this.state.branchType === 'hotfix') {
        mergeTargets.push('master')
      }
      return mergeTargets
    }
  }

  getCreateTarget () {
    if (this.state.branchType === 'hotfix') {
      return 'master'
    }
    return 'develop'
  }

  getButtonText () {
    if (this.state.operationType === 'Merge Branch') {
      return `Merging: ${this.getBranchName()}  -->  ${this.getMergeTargets().join(' and ')}`
    }
    else {
      return `Branching: ${this.getBranchName()}  from  ${this.getCreateTarget()}`
    }
  }

  repoIsSelected () {
    return (this.state.selectedRepo && this.state.selectedRepo.name)
  }

  setOperationData() {
    const branchType = this.state.branchType || ''
    const operationType = this.state.operationType || ''
    const operationData = {
      operationType: operationType.split(' ')[0].toLocaleLowerCase(),
      branchType: branchType.toLocaleLowerCase(),
      branchName: this.getBranchName()
    }
    this.props.onSetOperationData(operationData)
  }

  selectRepo = (event, value = {}) => {
    if (value && value.name) {
      if (this.state.selectedRepo && value.name !== this.state.selectedRepo.name) {
        this.setState({ selectedRepo: value, operationType: '', branchType: '', branchName: '' }, this.setOperationData)
      }
      else {
        this.setState({ selectedRepo: value}, this.setOperationData)
      }
      this.state.data.getBranches(value).then(() => {
        localStorage.setItem('repository', JSON.stringify(value))
        this.setState({ selectedRepo: value }, this.setOperationData)
      })
    } else {
      this.setState({ selectedRepo: value, operationType: '', branchType: '', branchName: '' }, this.setOperationData)

      localStorage.removeItem('repository')
      localStorage.removeItem('operationType')
      localStorage.removeItem('branchType')
      localStorage.removeItem('branchName')
    }
  }

  selectOperation = (event, value) => {
    this.setState({ operationType: value, branchName: '' }, this.setOperationData)
    localStorage.setItem('operationType', value)
    localStorage.removeItem('branchName')
  }

  selectBranchType = (event, value) => {
    this.setState({ branchType: value }, this.setOperationData)
    localStorage.setItem('branchType', value, this.setOperationData)
  }

  selectRepoBranch = (event, value) => {
    if (!value) { value = {name: ''}}
    this.setState({branchName: value.name}, this.setOperationData)

    localStorage.setItem('branchName', value.name)
  }

  setBranchName = (event) => {
    const name = event.target.value.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
    this.setState({ branchName: name }, this.setOperationData)
    localStorage.setItem('branchName', name)
  }

  onOperationButtonClick = () => {
    console.log('clicking the button')
    this.state.data.performGitFlowOperation(
      this.state.selectedRepo, 
      this.state.operationType, 
      this.state.branchType, 
      this.getBranchName()
    ).then(() => {
      this.state.data.getBranches(this.state.selectedRepo)
    }).then(() => {
        localStorage.setItem('repository', JSON.stringify(this.state.selectedRepo))
    })
  }

  renderOperationType () {
    if (this.repoIsSelected()) {
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
        <TextField id="branch-name" label="Branch Name" variant="outlined" value={this.state.branchName} onChange={this.setBranchName} fullWidth />
      </MDBCol>
    )
  }

  renderRepoBranches () {
    return (
      <MDBCol>
        <Autocomplete
          options={this.getValidBranches()}
          getOptionLabel={option => option.name}
          id='repo-branches'
          renderInput={params => (
            <TextField {...params} label='Select Branch' variant='outlined' fullWidth />
          )}
          onChange={this.selectRepoBranch}
          loading={this.state.selectedRepo.branches === undefined || this.state.selectedRepo.branches.length === 0}
          value={this.getBranchByName()}
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
    if (this.getBranchName() !== '') {
      return (
      <Button variant="contained" onClick={this.onOperationButtonClick} >
        {this.getButtonText()}
      </Button>
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
                    loading={this.state.repos.length === 0 || !this.repoIsSelected()}
                    onChange={this.selectRepo}
                    value={this.repoIsSelected() ? this.state.selectedRepo : {}}
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
