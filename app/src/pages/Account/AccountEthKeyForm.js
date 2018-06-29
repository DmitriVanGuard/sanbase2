import React from 'react'
import { Form, Input } from 'semantic-ui-react'

const AccountEthKeyForm = () => {
  return (
    <Form loading={loading}>
      <Form.Field>
        <label>Eth Public Key</label>
        <Input
          input={{ readOnly: true }}
          action={{
            color: 'teal',
            labelPosition: 'right',
            icon: 'copy',
            content: 'Copy',
            onClick: () => copy(user.ethAccounts && user.ethAccounts[0].address)
          }}
          defaultValue={user.ethAccounts && user.ethAccounts[0].address}
        />
      </Form.Field>
    </Form>
  )
}

export default AccountEthKeyForm
