import React from 'react'
import { connect } from 'react-redux'
import { Form, Input, Message, Divider, Button } from 'semantic-ui-react'
import AccountHeader from './AccountHeader'
// import { changeEmailGQL, changeUsernameGQL } from './accountGQL'


const rAccount = ({ user }) => {
  return (
    <div className='page account'>
      <AccountHeader />
      {!user.email &&
        <Message
          className='account-message'
          warning
          header='Email is not added yet!'
          list={[
            'For acces your dashboard from mobile device, you should add email address.'
          ]}
        />}
    </div>
  )
}

const mapStateToProps = state => ({
  user: state.user.data,
  loading: state.user.isLoading
})

export default connect(mapStateToProps)(rAccount)
