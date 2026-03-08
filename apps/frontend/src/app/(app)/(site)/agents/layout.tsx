import { Metadata } from 'next';
import { Agent } from '@postys/frontend/components/agents/agent';
export const metadata: Metadata = {
  title: 'Postys - Agent',
  description: '',
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Agent>{children}</Agent>;
}
