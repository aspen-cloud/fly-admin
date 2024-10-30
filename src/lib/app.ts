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

export interface ListAppDetailedResponse {
  apps: AppDetailedResponse[]
}

export type GetAppRequest = string

const getOrganizationApps = `query($slug: String!) {
  organization(slug: $slug) {
    apps {
        nodes {
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
    }
  }
}`

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
}

export interface AppDetailedResponse extends AppResponse {
  ipAddresses: IPAddress[]
  machines: AppMachine[]
}

export interface AppMachine {
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

  async listAppsDetailed(
    org_slug: ListAppRequest
  ): Promise<APIResponse<ListAppDetailedResponse>> {
    const response = await this.client.safeGqlPost<
      string,
      { organization: any }
    >({
      query: getOrganizationApps,
      variables: { slug: org_slug },
    })
    if (response.error) {
      return response
    }
    return {
      data: parseOrgResponse(response.data.organization).apps,
      error: undefined,
    }
  }

  async getApp(app_name: GetAppRequest): Promise<APIResponse<AppResponse>> {
    const path = `apps/${app_name}`
    return await this.client.safeRest(path)
  }

  async getAppDetailed(
    app_name: GetAppRequest
  ): Promise<APIResponse<AppDetailedResponse>> {
    const response = await this.client.safeGqlPost<string, { app: any }>({
      query: getAppQuery,
      variables: { name: app_name },
    })

    if (response.error) {
      return response
    }

    return {
      data: parseAppResponse(response.data.app),
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

function parseAppResponse(appData: any) {
  const ipAddresses = parseNodes<IPAddress>(appData, 'ipAddresses')
  const machines = parseNodes<AppMachine>(appData, 'machines')

  return {
    ...appData,
    ipAddresses,
    machines,
  }
}

function parseOrgResponse(orgData: any) {
  const apps = parseNodes(orgData, 'apps').map(parseAppResponse)
  return {
    ...orgData,
    apps,
  }
}

function parseNodes<T>(data: any, key: string): T[] {
  return data[key].nodes
}
