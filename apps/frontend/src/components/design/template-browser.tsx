'use client';

import { FC, useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { useTemplates, usePlatforms, DesignTemplate } from './hooks/use.templates';
import Loading from 'react-loading';
import { useT } from '@postys/react/translation/get.transation.service.client';

interface TemplateBrowserProps {
  onSelect: (template: DesignTemplate) => void;
  selectedPlatform?: string;
  className?: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'quote', name: 'Quote' },
  { id: 'promo', name: 'Promo' },
  { id: 'announcement', name: 'Announcement' },
  { id: 'tip', name: 'Tip' },
  { id: 'story', name: 'Story' },
];

export const TemplateBrowser: FC<TemplateBrowserProps> = ({
  onSelect,
  selectedPlatform,
  className,
}) => {
  const t = useT();
  const [category, setCategory] = useState('all');
  const [platform, setPlatform] = useState(selectedPlatform || 'all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  const { data: platforms } = usePlatforms();
  const { data: templatesData, isLoading } = useTemplates({
    category: category === 'all' ? undefined : category,
    platform: platform === 'all' ? undefined : platform,
  });

  const platformOptions = useMemo(() => {
    return [
      { id: 'all', name: 'All Platforms' },
      ...(platforms || []).map((p) => ({ id: p.id, name: p.name })),
    ];
  }, [platforms]);

  const handleTemplateClick = useCallback(
    (template: DesignTemplate) => {
      onSelect(template);
    },
    [onSelect]
  );

  return (
    <div className={clsx('flex flex-col gap-4', className)}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                category === cat.id
                  ? 'bg-forth text-white'
                  : 'bg-newBgBtnColor text-newTextColor hover:bg-newBgBtnHoverColor'
              )}
            >
              {t(cat.id, cat.name)}
            </button>
          ))}
        </div>

        {/* Platform Filter */}
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-sm bg-newBgBtnColor text-newTextColor border border-newBgLineColor"
        >
          {platformOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loading type="spin" color="currentColor" height={40} width={40} />
        </div>
      ) : templatesData?.templates?.length === 0 ? (
        <div className="text-center py-12 text-newTextSecondaryColor">
          {t('noTemplatesFound', 'No templates found')}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {templatesData?.templates?.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={clsx(
                'relative cursor-pointer rounded-lg overflow-hidden border transition-all',
                'border-newBgLineColor hover:border-forth',
                'group'
              )}
            >
              {/* Thumbnail */}
              <div
                className="aspect-square bg-newBgBtnColor flex items-center justify-center overflow-hidden"
                style={{
                  aspectRatio:
                    template.width === template.height
                      ? '1/1'
                      : template.width > template.height
                      ? '16/9'
                      : '9/16',
                }}
              >
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-newTextSecondaryColor text-xs text-center p-4">
                    {template.width}x{template.height}
                  </div>
                )}
              </div>

              {/* Overlay on Hover */}
              <div
                className={clsx(
                  'absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity',
                  hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'
                )}
              >
                <span className="text-white text-sm font-medium px-3 py-1.5 bg-forth rounded-lg">
                  {t('useTemplate', 'Use Template')}
                </span>
              </div>

              {/* Info */}
              <div className="p-3 bg-newBgColor">
                <div className="font-medium text-sm text-newTextColor truncate">
                  {template.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-newTextSecondaryColor capitalize">
                    {template.category}
                  </span>
                  <span className="text-newTextSecondaryColor">•</span>
                  <span className="text-xs text-newTextSecondaryColor capitalize">
                    {template.platform}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {templatesData && templatesData.pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: templatesData.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={clsx(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                page === templatesData.page
                  ? 'bg-forth text-white'
                  : 'bg-newBgBtnColor text-newTextColor hover:bg-newBgBtnHoverColor'
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateBrowser;
