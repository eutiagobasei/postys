'use client';

import { FC, useState, useCallback } from 'react';
import clsx from 'clsx';
import Loading from 'react-loading';
import { Button } from '@postys/react/form/button';
import { useT } from '@postys/react/translation/get.transation.service.client';
import { useToaster } from '@postys/react/toaster/toaster';
import { usePlatforms, DesignTemplate } from './hooks/use.templates';
import {
  useDesignGenerator,
  GeneratedDesign,
  GenerateDesignResult,
} from './hooks/use.design-generator';
import { TemplateBrowser } from './template-browser';

interface DesignGeneratorProps {
  postContent: string;
  onDesignGenerated: (design: GeneratedDesign) => void;
  onClose?: () => void;
  className?: string;
}

type Mode = 'ai' | 'template';

export const DesignGenerator: FC<DesignGeneratorProps> = ({
  postContent,
  onDesignGenerated,
  onClose,
  className,
}) => {
  const t = useT();
  const toaster = useToaster();
  const { data: platforms } = usePlatforms();
  const { loading, error, generateDesign, generateFromTemplate } = useDesignGenerator();

  const [mode, setMode] = useState<Mode>('ai');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [selectedTemplate, setSelectedTemplate] = useState<DesignTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [generatedDesign, setGeneratedDesign] = useState<GenerateDesignResult | null>(null);

  // Handle AI generation
  const handleAIGenerate = useCallback(async () => {
    if (!postContent || postContent.length < 10) {
      toaster.show(t('contentTooShort', 'Post content must be at least 10 characters'), 'warning');
      return;
    }

    const result = await generateDesign(postContent, selectedPlatform);
    if (result) {
      setGeneratedDesign(result);
    } else if (error) {
      toaster.show(error, 'warning');
    }
  }, [postContent, selectedPlatform, generateDesign, error, toaster, t]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: DesignTemplate) => {
    setSelectedTemplate(template);
    // Initialize variables with defaults
    const initialVars: Record<string, string> = {};
    template.variables.forEach((v) => {
      initialVars[v.name] = v.default || '';
    });
    setTemplateVariables(initialVars);
  }, []);

  // Handle template generation
  const handleTemplateGenerate = useCallback(async () => {
    if (!selectedTemplate) return;

    const result = await generateFromTemplate(
      selectedTemplate.id,
      templateVariables,
      selectedTemplate.name
    );

    if (result) {
      onDesignGenerated(result);
      onClose?.();
    } else if (error) {
      toaster.show(error, 'warning');
    }
  }, [selectedTemplate, templateVariables, generateFromTemplate, onDesignGenerated, onClose, error, toaster]);

  // Handle using generated design
  const handleUseDesign = useCallback(() => {
    if (generatedDesign?.design) {
      onDesignGenerated(generatedDesign.design);
      onClose?.();
    }
  }, [generatedDesign, onDesignGenerated, onClose]);

  // Handle variable change
  const handleVariableChange = useCallback((name: string, value: string) => {
    setTemplateVariables((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-newBgLineColor">
        <h2 className="text-lg font-semibold text-newTextColor">
          {t('designGenerator', 'Design Generator')}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-newTextSecondaryColor hover:text-newTextColor"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-4 border-b border-newBgLineColor">
        <button
          onClick={() => setMode('ai')}
          className={clsx(
            'flex-1 py-2 rounded-lg font-medium transition-colors',
            mode === 'ai'
              ? 'bg-forth text-white'
              : 'bg-newBgBtnColor text-newTextColor hover:bg-newBgBtnHoverColor'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            {t('aiGenerate', 'AI Generate')}
          </span>
        </button>
        <button
          onClick={() => setMode('template')}
          className={clsx(
            'flex-1 py-2 rounded-lg font-medium transition-colors',
            mode === 'template'
              ? 'bg-forth text-white'
              : 'bg-newBgBtnColor text-newTextColor hover:bg-newBgBtnHoverColor'
          )}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
            {t('fromTemplate', 'From Template')}
          </span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {mode === 'ai' ? (
          <div className="flex flex-col gap-4">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-newTextColor mb-2">
                {t('selectPlatform', 'Select Platform')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {platforms?.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={clsx(
                      'p-3 rounded-lg border text-sm font-medium transition-all',
                      selectedPlatform === platform.id
                        ? 'border-forth bg-forth/10 text-forth'
                        : 'border-newBgLineColor bg-newBgBtnColor text-newTextColor hover:border-forth'
                    )}
                  >
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-xs text-newTextSecondaryColor mt-1">
                      {platform.width}x{platform.height}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Post Content Preview */}
            <div>
              <label className="block text-sm font-medium text-newTextColor mb-2">
                {t('postContent', 'Post Content')}
              </label>
              <div className="p-3 rounded-lg bg-newBgBtnColor border border-newBgLineColor text-newTextSecondaryColor text-sm max-h-32 overflow-y-auto">
                {postContent || t('noContent', 'No content available')}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleAIGenerate}
              loading={loading}
              disabled={!postContent || postContent.length < 10}
              className="w-full rounded-lg"
            >
              {t('generateDesign', 'Generate Design with AI')}
            </Button>

            {/* Generated Design Preview */}
            {generatedDesign && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-newTextColor mb-2">
                  {t('generatedDesign', 'Generated Design')}
                </label>
                <div className="rounded-lg border border-newBgLineColor overflow-hidden">
                  {generatedDesign.design.renderedUrl ? (
                    <img
                      src={generatedDesign.design.renderedUrl}
                      alt="Generated design"
                      className="w-full"
                    />
                  ) : (
                    <div className="p-8 text-center text-newTextSecondaryColor">
                      {t('previewNotAvailable', 'Preview not available')}
                    </div>
                  )}
                </div>

                {/* Analysis Info */}
                <div className="mt-3 p-3 rounded-lg bg-newBgBtnColor">
                  <div className="text-sm font-medium text-newTextColor">
                    {generatedDesign.analysis.title}
                  </div>
                  {generatedDesign.analysis.subtitle && (
                    <div className="text-xs text-newTextSecondaryColor mt-1">
                      {generatedDesign.analysis.subtitle}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-newBgColor text-newTextSecondaryColor capitalize">
                      {generatedDesign.analysis.mood}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-newBgColor text-newTextSecondaryColor capitalize">
                      {generatedDesign.analysis.suggestedCategory}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleUseDesign}
                  className="w-full mt-3 rounded-lg"
                >
                  {t('useThisDesign', 'Use This Design')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {selectedTemplate ? (
              <>
                {/* Selected Template */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-newBgBtnColor border border-newBgLineColor">
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-newTextSecondaryColor hover:text-newTextColor"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <div>
                    <div className="font-medium text-newTextColor">
                      {selectedTemplate.name}
                    </div>
                    <div className="text-xs text-newTextSecondaryColor">
                      {selectedTemplate.width}x{selectedTemplate.height}
                    </div>
                  </div>
                </div>

                {/* Variable Inputs */}
                <div className="space-y-3">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable.name}>
                      <label className="block text-sm font-medium text-newTextColor mb-1">
                        {variable.label || variable.name}
                      </label>
                      {variable.type === 'color' ? (
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={templateVariables[variable.name] || variable.default || '#000000'}
                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={templateVariables[variable.name] || variable.default || ''}
                            onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg bg-newBgBtnColor border border-newBgLineColor text-newTextColor"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={templateVariables[variable.name] || ''}
                          onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                          placeholder={variable.default}
                          className="w-full px-3 py-2 rounded-lg bg-newBgBtnColor border border-newBgLineColor text-newTextColor"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleTemplateGenerate}
                  loading={loading}
                  className="w-full rounded-lg"
                >
                  {t('generateFromTemplate', 'Generate from Template')}
                </Button>
              </>
            ) : (
              <TemplateBrowser onSelect={handleTemplateSelect} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignGenerator;
