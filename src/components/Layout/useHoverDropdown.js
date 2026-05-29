import { useState } from 'react';

export const useHoverDropdown = () => {
  const [closed, setClosed] = useState(false);

  const close = () => {
    setClosed(true);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const wrapperProps = {
    className: closed ? 'is-closed' : '',
    onMouseLeave: () => setClosed(false),
  };

  return { close, wrapperProps };
};
