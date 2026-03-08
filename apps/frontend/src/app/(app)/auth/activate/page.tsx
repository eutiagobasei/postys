export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
import { Activate } from '@postys/frontend/components/auth/activate';
import { isGeneralServerSide } from '@postys/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${
    isGeneralServerSide() ? 'Postys' : 'Postys'
  } - Activate your account`,
  description: '',
};
export default async function Auth() {
  return <Activate />;
}
