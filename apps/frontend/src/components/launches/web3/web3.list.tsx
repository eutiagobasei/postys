import { FC } from 'react';
import { Web3ProviderInterface } from '@postys/frontend/components/launches/web3/web3.provider.interface';
import { WrapcasterProvider } from '@postys/frontend/components/launches/web3/providers/wrapcaster.provider';
import { TelegramProvider } from '@postys/frontend/components/launches/web3/providers/telegram.provider';
import { MoltbookProvider } from '@postys/frontend/components/launches/web3/providers/moltbook.provider';
export const web3List: {
  identifier: string;
  component: FC<Web3ProviderInterface>;
}[] = [
  {
    identifier: 'telegram',
    component: TelegramProvider,
  },
  {
    identifier: 'wrapcast',
    component: WrapcasterProvider,
  },
  {
    identifier: 'moltbook',
    component: MoltbookProvider,
  },
];
