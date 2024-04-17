import Client from '../client'
import { APIResponse } from './utils'

export type GetOrganizationInput = string

interface OrganizationResponse {
  id: string
  slug: string
  name: string
  type: 'PERSONAL' | 'SHARED'
  viewerRole: 'admin' | 'member'
}

export interface GetOrganizationOutput {
  organization: OrganizationResponse
}

const getOrganizationQuery = `query($slug: String!) {
  organization(slug: $slug) {
    id
    slug
    name
    type
    viewerRole
  }
}`

export class Organization {
  private client: Client

  constructor(client: Client) {
    this.client = client
  }

  async getOrganization(
    slug: GetOrganizationInput
  ): Promise<APIResponse<GetOrganizationOutput>> {
    return this.client.safeGqlPost({
      query: getOrganizationQuery,
      variables: { slug },
    })
  }
}
