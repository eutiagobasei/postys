import { Metadata } from 'next';
import { Agent } from '@postys/frontend/components/agents/agent';
import { AgentChat } from '@postys/frontend/components/agents/agent.chat';
export const metadata: Metadata = {
  title: 'Postys - Agent',
  description: '',
};
export default async function Page() {
  return (
    <AgentChat />
  );
}
