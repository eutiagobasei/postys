export interface DesignForgeUser {
  id: string;
  email: string;
  name: string;
}

export interface DesignForgeDesign {
  id: string;
  name: string;
  thumbnailUrl: string;
  renderUrl: string;
  width: number;
  height: number;
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignForgeCampaign {
  id: string;
  name: string;
  description?: string;
  designCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DesignForgeListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DesignForgeApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
