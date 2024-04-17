import Client from '../client'
import { APIResponse } from './utils'

export interface SetSecretsInput {
  appId: string
  secrets: { key: string; value: string }[]
  replaceAll?: boolean
}

export interface SetSecretsOutput {
  setSecrets: {
    release: {
      id: string
      version: string
      reason: string
      description: string
      user: {
        id: string
        email: string
        name: string
      }
      evaluationId: string
      createdAt: string
    } | null
  }
}

const setSecretsQuery = `mutation($input: SetSecretsInput!) {
  setSecrets(input: $input) {
    release {
      id
      version
      reason
      description
      user {
        id
        email
        name
      }
      evaluationId
      createdAt
    }
  }
}`

export interface UnsetSecretsInput {
  appId: string
  keys: string[]
}

export interface UnsetSecretsOutput {
  unsetSecrets: {
    release: {
      id: string
      version: string
      reason: string
      description: string
      user: {
        id: string
        email: string
        name: string
      }
      evaluationId: string
      createdAt: string
    } | null
  }
}

const unsetSecretsQuery = `mutation($input: UnsetSecretsInput!) {
  unsetSecrets(input: $input) {
    release {
      id
      version
      reason
      description
      user {
        id
        email
        name
      }
      evaluationId
      createdAt
    }
  }
}`

export class Secret {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async setSecrets(
    input: SetSecretsInput
  ): Promise<APIResponse<SetSecretsOutput>> {
    return await this.client.safeGqlPost({
      query: setSecretsQuery,
      variables: { input },
    })
  }

  async unsetSecrets(
    input: UnsetSecretsInput
  ): Promise<APIResponse<UnsetSecretsOutput>> {
    return await this.client.safeGqlPost({
      query: unsetSecretsQuery,
      variables: { input },
    })
  }
}
