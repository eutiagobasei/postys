'use client';

import useSWR from 'swr';
import { useFetch } from '@postys/helpers/utils/custom.fetch';

export interface TemplateVariable {
  name: string;
  type: 'text' | 'image' | 'color';
  default?: string;
  label?: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  platform: string;
  width: number;
  height: number;
  thumbnail?: string;
  variables: TemplateVariable[];
  isPublic: boolean;
  createdAt: string;
}

export interface TemplatesResponse {
  templates: DesignTemplate[];
  total: number;
  pages: number;
  page: number;
}

export interface Platform {
  id: string;
  width: number;
  height: number;
  name: string;
}

export const useTemplates = (options?: { category?: string; platform?: string; page?: number }) => {
  const fetch = useFetch();

  const queryParams = new URLSearchParams();
  if (options?.category) queryParams.set('category', options.category);
  if (options?.platform) queryParams.set('platform', options.platform);
  if (options?.page) queryParams.set('page', String(options.page));

  const queryString = queryParams.toString();
  const endpoint = `/design/templates${queryString ? `?${queryString}` : ''}`;

  return useSWR<TemplatesResponse>(endpoint, async () => {
    const response = await fetch(endpoint);
    return response.json();
  });
};

export const useTemplatesByPlatform = (platform: string) => {
  const fetch = useFetch();
  const endpoint = `/design/templates/platform/${platform}`;

  return useSWR<DesignTemplate[]>(endpoint, async () => {
    const response = await fetch(endpoint);
    return response.json();
  });
};

export const useTemplate = (id: string) => {
  const fetch = useFetch();
  const endpoint = `/design/templates/${id}`;

  return useSWR(
    id ? endpoint : null,
    async () => {
      const response = await fetch(endpoint);
      return response.json();
    }
  );
};

export const usePlatforms = () => {
  const fetch = useFetch();
  const endpoint = '/design/platforms';

  return useSWR<Platform[]>(endpoint, async () => {
    const response = await fetch(endpoint);
    return response.json();
  });
};
