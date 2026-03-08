'use client';

import { FC } from 'react';
import {
  PostComment,
  withProvider,
} from '@postys/frontend/components/new-launch/providers/high.order.provider';
import { MoltbookDto } from '@postys/nestjs-libraries/dtos/posts/providers-settings/moltbook.dto';
import { useSettings } from '@postys/frontend/components/launches/helpers/use.values';
import { Input } from '@postys/react/form/input';
import { useT } from '@postys/react/translation/get.transation.service.client';

const MoltbookSettings: FC = () => {
  const form = useSettings();
  const t = useT();

  return (
    <div>
      <Input
        label={t('submolt', 'Submolt')}
        placeholder="general"
        {...form.register('submolt')}
      />
    </div>
  );
};

export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: MoltbookSettings,
  CustomPreviewComponent: undefined,
  dto: MoltbookDto,
  maximumCharacters: 300,
});
