'use client';

import { FC } from 'react';
import { DesignGenerator } from './design-generator';
import { GeneratedDesign } from './hooks/use.design-generator';

interface DesignGeneratorModalProps {
  postContent: string;
  onDesignGenerated: (design: GeneratedDesign) => void;
  onClose: () => void;
}

export const DesignGeneratorModal: FC<DesignGeneratorModalProps> = ({
  postContent,
  onDesignGenerated,
  onClose,
}) => {
  return (
    <div className="flex flex-col h-full bg-newBgColorInner">
      <DesignGenerator
        postContent={postContent}
        onDesignGenerated={onDesignGenerated}
        onClose={onClose}
        className="h-full"
      />
    </div>
  );
};

export default DesignGeneratorModal;
