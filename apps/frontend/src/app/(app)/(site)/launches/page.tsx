export const dynamic = 'force-dynamic';
import { LaunchesComponent } from '@postys/frontend/components/launches/launches.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@postys/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postys Calendar' : 'Postys Launches'}`,
  description: '',
};
export default async function Index() {
  return <LaunchesComponent />;
}
