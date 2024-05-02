import Client from '../client'
import { APIResponse } from './utils'

export type ListAppRequest = string

export interface ListAppResponse {
  total_apps: number
  apps: {
    name: string
    machine_count: number
    network: string
  }[]
}

export type GetAppRequest = string

const getAppQuery = `query($name: String!) {
  app(name: $name) {
      name
      status
      organization {
        name
        slug
      }
      ipAddresses {
        nodes {
          type
          region
          address
        }
      }
      machines {
        nodes {
            id
            name
            state
            region
        }
      }
  }
}`

export enum AppStatus {
  deployed = 'deployed',
  pending = 'pending',
  suspended = 'suspended',
}

export interface AppResponse {
  name: string
  status: AppStatus
  organization: {
    name: string
    slug: string
  }
  ipAddresses: IPAddress[]
  machines: AppMachine[]
}

interface AppMachine {
  id: string
  name: string
  state: string
  region: string
}

export interface IPAddress {
  type: string
  address: string
}

export interface CreateAppRequest {
  org_slug: string
  app_name: string
  network?: string
}

export type DeleteAppRequest = string

export class App {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async listApps(
    org_slug: ListAppRequest
  ): Promise<APIResponse<ListAppResponse>> {
    const path = `apps?org_slug=${org_slug}`
    return await this.client.safeRest(path)
  }

  async getApp(app_name: GetAppRequest): Promise<APIResponse<AppResponse>> {
    const path = `apps/${app_name}`
    return await this.client.safeRest(path)
  }

  async getAppDetailed(
    app_name: GetAppRequest
  ): Promise<APIResponse<AppResponse>> {
    const response = await this.client.safeGqlPost<
      string,
      { app: AppResponse }
    >({
      query: getAppQuery,
      variables: { name: app_name },
    })

    if (response.error) {
      return response
    }

    const ipAddresses = response.data.app.ipAddresses as unknown as {
      nodes: IPAddress[]
    }

    const machines = response.data.app.machines as unknown as {
      nodes: AppMachine[]
    }

    return {
      data: {
        ...response.data.app,
        ipAddresses: ipAddresses.nodes,
        machines: machines.nodes,
      },
      error: undefined,
    }
  }

  async createApp(payload: CreateAppRequest): Promise<APIResponse<void>> {
    const path = 'apps'
    return await this.client.safeRest(path, 'POST', payload)
  }

  async deleteApp(app_name: DeleteAppRequest): Promise<APIResponse<void>> {
    const path = `apps/${app_name}`
    return await this.client.safeRest(path, 'DELETE')
  }
}
