/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  EuiBetaBadge,
  EuiPopover,
  EuiPopoverFooter,
  EuiPopoverTitle,
  EuiSmallButton,
  EuiText,
  PopoverAnchorPosition,
} from '@elastic/eui';
import { GITHUB_FEEDBACK_LINK } from '../../common';

interface ExperimentalBadgeProps {
  popoverEnabled: boolean;
  popoverAnchorPosition?: PopoverAnchorPosition;
}

/**
 * Experimental/beta badge with an optional popover for users to provide feedback
 */
export function ExperimentalBadge(props: ExperimentalBadgeProps) {
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  return props.popoverEnabled ? (
    <EuiPopover
      button={
        <EuiBetaBadge
          size="m"
          label=""
          iconType={'beaker'}
          onClick={() => setPopoverOpen(!popoverOpen)}
        />
      }
      isOpen={popoverOpen}
      closePopover={() => setPopoverOpen(false)}
      panelPaddingSize="s"
      anchorPosition={props.popoverAnchorPosition || 'downCenter'}
    >
      <EuiPopoverTitle>EXPERIMENTAL FEATURE</EuiPopoverTitle>
      <EuiText style={{ width: '400px' }}>
        {`OpenSearch Flow is experimental and should not be used in a\n
        production environment.`}
      </EuiText>
      <EuiPopoverFooter>
        <EuiSmallButton
          fill={false}
          href={GITHUB_FEEDBACK_LINK}
          iconSide="right"
          iconType="popout"
          target="_blank"
        >
          Provide feedback on GitHub
        </EuiSmallButton>
      </EuiPopoverFooter>
    </EuiPopover>
  ) : (
    <EuiBetaBadge label="" iconType={'beaker'} />
  );
}
