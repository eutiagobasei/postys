'use client';

import {
  PostComment,
  withProvider,
} from '@postys/frontend/components/new-launch/providers/high.order.provider';
import { WhopDto } from '@postys/nestjs-libraries/dtos/posts/providers-settings/whop.dto';
import { Input } from '@postys/react/form/input';
import { useSettings } from '@postys/frontend/components/launches/helpers/use.values';
import { WhopCompanySelect } from '@postys/frontend/components/new-launch/providers/whop/whop.company.select';
import { WhopExperienceSelect } from '@postys/frontend/components/new-launch/providers/whop/whop.experience.select';
import { FC, useState } from 'react';

const WhopSettings: FC = () => {
  const form = useSettings();
  const [selectedCompany, setSelectedCompany] = useState<string | undefined>(
    form.getValues().company
  );
  const companyRegister = form.register('company');
  const onCompanyChange = (event: {
    target: { value: string; name: string };
  }) => {
    setSelectedCompany(event.target.value);
    companyRegister.onChange(event);
  };

  return (
    <div>
      <WhopCompanySelect {...companyRegister} onChange={onCompanyChange} />
      <WhopExperienceSelect
        {...form.register('experience')}
        companyId={selectedCompany}
      />
      <Input label="Title (optional)" {...form.register('title')} />
    </div>
  );
};

export default withProvider({
  postComment: PostComment.COMMENT,
  minimumCharacters: [],
  SettingsComponent: WhopSettings,
  CustomPreviewComponent: undefined,
  dto: WhopDto,
  checkValidity: undefined,
  maximumCharacters: 50000,
});
