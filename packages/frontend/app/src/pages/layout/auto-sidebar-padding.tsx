import { withUnit } from '@afk/component';
import type { HTMLAttributes } from 'react';

import { useSidebarStore } from '@/store/sidebar';

export const AutoSidebarPadding = ({
  style,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  const { open } = useSidebarStore();

  const inputPaddingLeft = withUnit(style?.paddingLeft ?? 0, 'px');

  return (
    <div
      {...props}
      style={{
        ...style,
        paddingInlineStart: `calc(${inputPaddingLeft} + ${open ? 0 : 40}px)`,
      }}
    >
      {children}
    </div>
  );
};
