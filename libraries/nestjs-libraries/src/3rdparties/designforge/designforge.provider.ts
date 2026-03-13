import {
  ThirdParty,
  ThirdPartyAbstract,
} from '@postys/nestjs-libraries/3rdparties/thirdparty.interface';
import {
  DesignForgeApiResponse,
  DesignForgeCampaign,
  DesignForgeDesign,
  DesignForgeListResponse,
  DesignForgeUser,
} from './designforge.types';

const DESIGNFORGE_API_URL =
  process.env.DESIGNFORGE_API_URL || 'https://api.designforge.io';

@ThirdParty({
  identifier: 'designforge',
  title: 'DesignForge',
  description: 'AI-powered design generator for social media',
  position: 'media',
  fields: [],
})
export class DesignForgeProvider extends ThirdPartyAbstract<Record<string, never>> {
  private async fetchApi<T>(
    apiKey: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${DESIGNFORGE_API_URL}${endpoint}`, {
      ...options,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`DesignForge API error: ${response.statusText}`);
    }

    return response.json();
  }

  async checkConnection(
    apiKey: string
  ): Promise<false | { name: string; username: string; id: string }> {
    try {
      const result = await this.fetchApi<DesignForgeApiResponse<DesignForgeUser>>(
        apiKey,
        '/api/auth/me'
      );

      if (!result.success || !result.data) {
        return false;
      }

      return {
        name: result.data.name,
        username: result.data.email,
        id: result.data.id,
      };
    } catch {
      return false;
    }
  }

  async designs(
    apiKey: string,
    params?: { campaignId?: string; page?: number; limit?: number }
  ): Promise<DesignForgeListResponse<DesignForgeDesign>> {
    const queryParams = new URLSearchParams();
    if (params?.campaignId) {
      queryParams.set('campaignId', params.campaignId);
    }
    if (params?.page) {
      queryParams.set('page', String(params.page));
    }
    if (params?.limit) {
      queryParams.set('limit', String(params.limit));
    }

    const query = queryParams.toString();
    const endpoint = `/api/designs${query ? `?${query}` : ''}`;

    const result = await this.fetchApi<
      DesignForgeApiResponse<DesignForgeListResponse<DesignForgeDesign>>
    >(apiKey, endpoint);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch designs');
    }

    return result.data;
  }

  async campaigns(
    apiKey: string,
    params?: { page?: number; limit?: number }
  ): Promise<DesignForgeListResponse<DesignForgeCampaign>> {
    const queryParams = new URLSearchParams();
    if (params?.page) {
      queryParams.set('page', String(params.page));
    }
    if (params?.limit) {
      queryParams.set('limit', String(params.limit));
    }

    const query = queryParams.toString();
    const endpoint = `/api/campaigns${query ? `?${query}` : ''}`;

    const result = await this.fetchApi<
      DesignForgeApiResponse<DesignForgeListResponse<DesignForgeCampaign>>
    >(apiKey, endpoint);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch campaigns');
    }

    return result.data;
  }

  async importDesign(
    apiKey: string,
    data: { designId: string }
  ): Promise<{ url: string; design: DesignForgeDesign }> {
    if (!data.designId || !/^[a-zA-Z0-9_-]+$/.test(data.designId)) {
      throw new Error('Invalid design ID');
    }

    const result = await this.fetchApi<
      DesignForgeApiResponse<DesignForgeDesign>
    >(apiKey, `/api/designs/${data.designId}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to import design');
    }

    return {
      url: result.data.renderUrl,
      design: result.data,
    };
  }

  async sendData(_apiKey: string, _data: unknown): Promise<string> {
    // DesignForge is a read-only integration for importing designs
    // No data is sent back to DesignForge
    return '';
  }
}
