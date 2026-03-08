import { ToolExecutionContext } from '@mastra/core/dist/tools/types';
import { getAuth } from '@postys/nestjs-libraries/chat/async.storage';

export const checkAuth = <T>(
  inputData: T,
  context: ToolExecutionContext<any, any, any>
): void => {
  const auth = getAuth();
  // @ts-ignore
  const authInfo = context?.extra?.authInfo || auth;
  if (authInfo) {
    (context.requestContext as any)?.set('organization', JSON.stringify(authInfo));
    (context.requestContext as any)?.set('ui', 'false');
  }
};
