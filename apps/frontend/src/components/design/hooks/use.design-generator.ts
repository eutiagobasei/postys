'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { useFetch } from '@postys/helpers/utils/custom.fetch';
import { DesignTemplate } from './use.templates';

export interface GeneratedDesign {
  id: string;
  name?: string;
  templateId?: string;
  template?: DesignTemplate;
  variables: Record<string, string>;
  renderedUrl?: string;
  width: number;
  height: number;
  createdAt: string;
}

export interface DesignAnalysis {
  title: string;
  subtitle?: string;
  cta?: string;
  mood: string;
  suggestedCategory: string;
  backgroundPrompt: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
  };
}

export interface GenerateDesignResult {
  design: GeneratedDesign;
  analysis: DesignAnalysis;
  dimensions: {
    width: number;
    height: number;
    name: string;
  };
  error?: string;
  credits?: number;
}

export interface DesignsResponse {
  designs: GeneratedDesign[];
  total: number;
  pages: number;
  page: number;
}

export const useDesigns = (page: number = 1) => {
  const fetch = useFetch();
  const endpoint = `/design/designs?page=${page}`;

  return useSWR<DesignsResponse>(endpoint, async () => {
    const response = await fetch(endpoint);
    return response.json();
  });
};

export const useDesign = (id: string) => {
  const fetch = useFetch();
  const endpoint = `/design/designs/${id}`;

  return useSWR(
    id ? endpoint : null,
    async () => {
      const response = await fetch(endpoint);
      return response.json();
    }
  );
};

export const useDesignGenerator = () => {
  const fetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDesign = useCallback(
    async (postContent: string, platform: string): Promise<GenerateDesignResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/design/generate', {
          method: 'POST',
          body: JSON.stringify({ postContent, platform }),
        });

        const result = await response.json();

        if (result.error) {
          setError(result.error);
          return null;
        }

        return result;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  const generateFromTemplate = useCallback(
    async (
      templateId: string,
      variables: Record<string, string>,
      name?: string
    ): Promise<GeneratedDesign | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/design/generate-from-template', {
          method: 'POST',
          body: JSON.stringify({ templateId, variables, name }),
        });

        const result = await response.json();

        if (result.error) {
          setError(result.error);
          return null;
        }

        return result;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  const generateMultiPlatform = useCallback(
    async (
      postContent: string,
      platforms: string[]
    ): Promise<Array<{ platform: string; success: boolean } & Partial<GenerateDesignResult>> | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/design/generate-multi', {
          method: 'POST',
          body: JSON.stringify({ postContent, platforms }),
        });

        const result = await response.json();
        return result;
      } catch (err) {
        setError((err as Error).message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  const deleteDesign = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await fetch(`/design/designs/${id}`, {
          method: 'DELETE',
        });
        return true;
      } catch (err) {
        setError((err as Error).message);
        return false;
      }
    },
    [fetch]
  );

  return {
    loading,
    error,
    generateDesign,
    generateFromTemplate,
    generateMultiPlatform,
    deleteDesign,
  };
};
