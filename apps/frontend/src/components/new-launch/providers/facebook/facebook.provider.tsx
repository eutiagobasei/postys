'use client';

import {
  PostComment,
  withProvider,
} from '@postys/frontend/components/new-launch/providers/high.order.provider';
import { FacebookDto } from '@postys/nestjs-libraries/dtos/posts/providers-settings/facebook.dto';
import { Input } from '@postys/react/form/input';
import { useSettings } from '@postys/frontend/components/launches/helpers/use.values';
import { FacebookPreview } from '@postys/frontend/components/new-launch/providers/facebook/facebook.preview';

export const FacebookSettings = () => {
  const { register } = useSettings();

  return (
    <Input
      label={
        'Embedded URL (only for text Post)'
      }
      {...register('url')}
    />
  );
};

export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: FacebookSettings,
  CustomPreviewComponent: FacebookPreview,
  dto: FacebookDto,
  checkValidity: undefined,
  maximumCharacters: 63206,
});
