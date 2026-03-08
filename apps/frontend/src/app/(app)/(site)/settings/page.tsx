import { SettingsPopup } from '@postys/frontend/components/layout/settings.component';
export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@postys/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postys' : 'Postys'} Settings`,
  description: '',
};
export default async function Index({
  searchParams,
}: {
  searchParams: {
    code: string;
  };
}) {
  return <SettingsPopup />;
}
