import { thirdPartyWrapper } from '@postys/frontend/components/third-parties/third-party.wrapper';
import { useThirdPartyFunctionSWR } from '@postys/frontend/components/third-parties/third-party.function';
import { useThirdParty } from '@postys/frontend/components/third-parties/third-party.media';
import { Button } from '@postys/react/form/button';
import { Select } from '@postys/react/form/select';
import { FC, useCallback, useState } from 'react';
import clsx from 'clsx';
import { useFetch } from '@postys/helpers/utils/custom.fetch';
import { LoadingComponent } from '@postys/frontend/components/layout/loading';
import useSWR from 'swr';

interface Design {
  id: string;
  name: string;
  thumbnailUrl: string;
  renderUrl: string;
  width: number;
  height: number;
  campaignId?: string;
}

interface Campaign {
  id: string;
  name: string;
}

const DesignCard: FC<{
  design: Design;
  selected: boolean;
  onSelect: () => void;
}> = ({ design, selected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={clsx(
        'w-full p-[10px] text-[14px] hover:bg-input transition-all text-textColor relative flex flex-col gap-[10px] cursor-pointer rounded-lg',
        selected ? 'bg-input border-2 border-btnPrimary' : 'bg-third'
      )}
    >
      <div className="aspect-square overflow-hidden rounded">
        <img
          src={design.thumbnailUrl}
          alt={design.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-[12px] truncate">{design.name}</div>
    </div>
  );
};

const DesignForgeProviderComponent = () => {
  const thirdParty = useThirdParty();
  const fetch = useFetch();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const { data: campaignsData, isLoading: campaignsLoading } =
    useThirdPartyFunctionSWR('LOAD_ONCE', 'campaigns');

  // Use a custom SWR key that includes the campaign filter to properly re-fetch when filter changes
  const { data: designsData, isLoading: designsLoading } = useSWR(
    thirdParty.id
      ? `designs-${thirdParty.id}-${selectedCampaignId || 'all'}`
      : null,
    async () => {
      const response = await fetch(
        `/third-party/function/${thirdParty.id}/designs`,
        {
          method: 'POST',
          body: JSON.stringify(
            selectedCampaignId ? { campaignId: selectedCampaignId } : {}
          ),
        }
      );
      return response.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  const campaigns: Campaign[] = campaignsData?.data || [];
  const designs: Design[] = designsData?.data || [];

  const handleImport = useCallback(async () => {
    if (!selectedDesign) return;

    setImporting(true);
    setImportError(null);
    try {
      const result = await (
        await fetch(`/third-party/function/${thirdParty.id}/importDesign`, {
          body: JSON.stringify({ designId: selectedDesign.id }),
          method: 'POST',
        })
      ).json();

      if (result?.url) {
        thirdParty.onChange(result.url);
        thirdParty.close();
      } else {
        setImportError(result?.error || 'Failed to import design');
      }
    } catch (error) {
      setImportError('Failed to import design. Please try again.');
    } finally {
      setImporting(false);
    }
  }, [selectedDesign, thirdParty, fetch]);

  const isLoading = campaignsLoading || designsLoading;

  return (
    <div className="flex flex-col gap-[20px]">
      {importing && (
        <div className="fixed left-0 top-0 w-full leading-[50px] pt-[200px] h-screen bg-black/90 z-50 flex flex-col justify-center items-center text-center text-xl">
          Importing design...
          <LoadingComponent width={100} height={100} />
        </div>
      )}

      {importError && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 px-[15px] py-[10px] rounded-lg">
          {importError}
        </div>
      )}

      <div className="flex items-center gap-[10px]">
        <div className="flex-1">
          <Select
            label="Filter by Campaign"
            name="campaignFilter"
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            disableForm
            hideErrors
          >
            <option value="">All Designs</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-[40px]">
          <LoadingComponent width={60} height={60} />
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-[40px] text-textColor/60">
          No designs found. Create some designs in DesignForge first.
        </div>
      ) : (
        <>
          <div className="text-lg">Select a Design</div>
          <div className="grid grid-cols-4 gap-[10px]">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                selected={selectedDesign?.id === design.id}
                onSelect={() =>
                  setSelectedDesign(
                    selectedDesign?.id === design.id ? null : design
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      {selectedDesign && (
        <div className="sticky bottom-0 bg-primary py-[15px] border-t border-newBorder">
          <div className="flex items-center justify-between gap-[20px]">
            <div className="flex items-center gap-[10px]">
              <img
                src={selectedDesign.thumbnailUrl}
                alt={selectedDesign.name}
                className="w-[50px] h-[50px] object-cover rounded"
              />
              <div>
                <div className="font-semibold">{selectedDesign.name}</div>
                <div className="text-[12px] text-textColor/60">
                  {selectedDesign.width} x {selectedDesign.height}
                </div>
              </div>
            </div>
            <Button onClick={handleImport} loading={importing}>
              Import Design
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default thirdPartyWrapper('designforge', DesignForgeProviderComponent);
