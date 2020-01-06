
import * as React from 'react'
import { Gitgraph } from '@gitgraph/react'
import { GitgraphCore } from '@gitgraph/core'
import { MDBJumbotron, MDBContainer } from 'mdbreact'

class GitGraph extends React.Component {
  constructor (props) {
    super()
    this.state = {
      operationData: props.operationData
    }
    this.graphs = {}
    this.commitOptions = {
      style: {
        hasTooltipInCompactMode: false,
        message: {
          display: false
        }
      }
    }
  }

  branchOptions (name) {
    return {
      name: name,
      style: {
        label: {
          borderRadius: 1,
          pointerWidth: 1,
          display: true
        },
        spacing: 50,
        lineWidth: 5
      }
    }
  }

  mergeOptions (branch) {
    return {
      branch: branch,
      fastForward: false,
      commitOptions: this.commitOptions
    }
  }

  UNSAFE_componentWillReceiveProps (newProps) {
    this.setState({ operationData: newProps.operationData })
  }

  renderFeature (gitgraph) {
    gitgraph.branch(this.branchOptions('master'))
    const develop = gitgraph.branch(this.branchOptions('develop')).commit(this.commitOptions)
    const feature = gitgraph.branch(this.branchOptions(this.state.operationData.branchName)).commit(this.commitOptions).commit(this.commitOptions)
    develop.commit(this.commitOptions)
    if (this.isMerge()) {
      develop.merge(this.mergeOptions(feature))
    } else {
      develop.commit(this.commitOptions)
    }
  }

  renderRelease (gitgraph) {
    const master = gitgraph.branch(this.branchOptions('master')).commit(this.commitOptions)
    const develop = gitgraph.branch(this.branchOptions('develop')).commit(this.commitOptions).commit(this.commitOptions)
    master.commit(this.commitOptions)
    const release = develop.branch(this.branchOptions(this.state.operationData.branchName)).commit(this.commitOptions).commit(this.commitOptions)
    if (this.isMerge()) {
      master.merge(this.mergeOptions(release))
      develop.merge(this.mergeOptions(release))
    } else {
      master.commit(this.commitOptions)
      develop.commit(this.commitOptions)
    }
  }

  renderHotfix (gitgraph) {
    const master = gitgraph.branch(this.branchOptions('master')).commit(this.commitOptions)
    const develop = gitgraph.branch(this.branchOptions('develop'))
    master.commit(this.commitOptions)
    const hotfix = gitgraph.branch(this.branchOptions(this.state.operationData.branchName)).commit(this.commitOptions).commit(this.commitOptions)
    develop.commit(this.commitOptions)
    if (this.isMerge()) {
      master.merge(this.mergeOptions(hotfix))
      develop.merge(this.mergeOptions(hotfix))
    } else {
      master.commit(this.commitOptions)
    }
  }

  isMerge () {
    return this.state.operationData.operationType === 'merge'
  }

  getKey () {
    return `${this.state.operationData.branchType}.${this.state.operationData.branchName.substring(5)}`
  }

  renderGraph () {
    const key = this.getKey()
    const graph = new GitgraphCore({ mode: 'compact', orientation: 'horizontal' })
    const gitgraph = graph.getUserApi()
    if (this.state.operationData.branchType === 'hotfix') {
      this.renderHotfix(gitgraph)
    } else if (this.state.operationData.branchType === 'release') {
      this.renderRelease(gitgraph)
    } else {
      this.renderFeature(gitgraph)
    }
    this.graphs[key] = gitgraph
    return (<Gitgraph key={key} graph={graph} />)
  }

  render () {
    return (
      <MDBJumbotron fluid>
        <MDBContainer className='text-center'>
          {this.renderGraph()}
        </MDBContainer>
      </MDBJumbotron>
    )
  }
}
export default GitGraph
