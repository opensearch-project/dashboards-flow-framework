/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EuiPopover, EuiSmallButtonIcon, EuiText } from '@elastic/eui';

interface ExperimentalBadgeProps {
  popoverEnabled: boolean;
}

/**
 * Experimental badge with an optional popover for users to provide feedback
 */
export function ExperimentalBadge(props: ExperimentalBadgeProps) {
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  return (
    <EuiPopover
      button={
        <EuiSmallButtonIcon
          style={{ marginBottom: '4px' }}
          iconType="beaker"
          iconSize="l"
          color="primary"
          aria-label="experimental"
          isDisabled={!props.popoverEnabled}
          onClick={() => {
            setPopoverOpen(!popoverOpen);
          }}
        />
      }
      isOpen={popoverOpen}
      closePopover={() => setPopoverOpen(false)}
      panelPaddingSize="s"
    >
      <EuiText>TODO</EuiText>
    </EuiPopover>
  );
}
