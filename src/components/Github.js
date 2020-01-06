import React, { Component } from 'react'
import SocialButton from './SocialButton'
import FontAwesome from 'react-fontawesome'

class Github extends Component {
  render () {
    return (
      <div className='button-wrapper fadein-fast'>
        <SocialButton
          provider='github'
          gatekeeper={process.env.GATEKEEPER_URL || 'https://0axken4v19.execute-api.us-east-1.amazonaws.com/dev/gatekeeper'}
          appId={process.env.APP_ID || '2cc5fb04088296f12839'}
          redirect={process.env.OAUTH_CALLBACK || 'http://git-flow.joshstarrett.com'}
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
