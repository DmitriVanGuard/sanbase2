import React from 'react'
import { Form as ReactForm } from 'react-form'
import Raven from 'raven-js'
import { UsernameField } from '../../pages/Login/EmailLogin'
import { FadeIn } from 'animate-components'
import { Button } from 'semantic-ui-react'
import { graphql } from 'react-apollo'
import { changeUsernameGQL } from './accountGQL'

const AccountUsernameForm = ({ user, changeUsernameQuery, dispatchUsernameChange, isUsernamePending, setFormStatus, errorValidator, successValidator }) => (<ReactForm
  validateError={errorValidator}
  validateSuccess={successValidator}
  onSubmitFailure={(error, ...rest) => {
    setFormStatus('ERROR', true)
    setFormStatus('SUCCESS', false)
    Raven.captureException(`User try to change username: ${error} ${rest}`)
  }}
  onSubmit={(values, _, formApi) => {
    setFormStatus('PENDING', true)
    setFormStatus('SUCCESS', false)
    changeUsernameQuery({ variables: { ...values } })
      .then(() => {
        setFormStatus('PENDING', false)
        setFormStatus('ERROR', false)
        setFormStatus('SUCCESS', true)
        dispatchUsernameChange(values.username)
        formApi.resetAll()
      })
      .catch(error => {
        setFormStatus('PENDING', false)
        setFormStatus('ERROR', true)
        Raven.captureException(`User try to change username: ${error}`)
      })
  }}
>
  {formApi => (
    <form
      className='account-settings-email'
      onSubmit={formApi.submitForm}
      autoComplete='off'
    >
      <UsernameField
        autoFocus={false}
        disabled={isUsernamePending}
        placeholder={
          user.username
          // user.username !== user.ethAccounts[0].address ? user.username : undefined
          /* TODO: Change user store schema */
        }
        className='account-settings-email__input'
        formApi={formApi}
      />

      {!console.log(formApi.getSuccess().username) && formApi.getSuccess().username &&
        <FadeIn
          className='account-settings-email__button-container'
          duration='0.7s'
          timingFunction='ease-in'
          as='div'
        >
          <Button
            disabled={!formApi.getSuccess().username || isUsernamePending}
            positive={!!formApi.getSuccess().username}
            type='submit'
          >
            {isUsernamePending ? 'Waiting...' : 'Submit'}
          </Button>
        </FadeIn>}

    </form>
  )}
</ReactForm>)

export default graphql(changeUsernameGQL, { name: 'changeUsernameQuery' })(AccountUsernameForm)