export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { PlatformAnalytics } from '@postys/frontend/components/platform-analytics/platform.analytics';
import { isGeneralServerSide } from '@postys/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postys' : 'Postys'} Analytics`,
  description: '',
};
export default async function Index() {
  return <PlatformAnalytics />;
}
