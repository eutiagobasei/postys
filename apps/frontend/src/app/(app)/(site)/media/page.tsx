import { MediaLayoutComponent } from '@postys/frontend/components/new-layout/layout.media.component';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@postys/helpers/utils/is.general.server.side';

export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postys' : 'Postys'} Media`,
  description: '',
};

export default async function Page() {
  return <MediaLayoutComponent />
}
