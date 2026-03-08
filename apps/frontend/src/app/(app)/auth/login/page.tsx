export const dynamic = 'force-dynamic';
import { Login } from '@postys/frontend/components/auth/login';
import { Metadata } from 'next';
import { isGeneralServerSide } from '@postys/helpers/utils/is.general.server.side';
export const metadata: Metadata = {
  title: `${isGeneralServerSide() ? 'Postys' : 'Postys'} Login`,
  description: '',
};
export default async function Auth() {
  return <Login />;
}
