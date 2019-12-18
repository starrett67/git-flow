import React, { Component } from 'react'
import SocialButton from './SocialButton'
import FontAwesome from 'react-fontawesome'

class Github extends Component {
  render () {
    return (
      <div className='button-wrapper fadein-fast'>
        <SocialButton
          provider='github'
          gatekeeper={process.env.GATEKEEPER_URL || 'https://0axken4v19.execute-api.us-east-1.amazonaws.com/dev/gatekeeper-local'}
          appId={process.env.APP_ID || '9ffe48c0bbe211000e2f'}
          redirect={process.env.OAUTH_CALLBACK || 'http://localhost:3000'}
          scope={['repo']}
          onLoginSuccess={this.props.onSuccess}
          onLoginFailure={this.props.onFailure}
        >
          <FontAwesome name='github' />
        </SocialButton>
      </div>
    )
  }
}

export default Github
