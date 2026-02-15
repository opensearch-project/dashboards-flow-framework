/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiText,
  EuiCard,
  EuiLink,
  EuiTitle,
  EuiAccordion,
} from '@elastic/eui';
import { CREATE_WORKFLOW_LINK, ML_REMOTE_MODEL_LINK } from '../../../common';

interface GetStartedAccordionProps {
  initialIsOpen: boolean;
}

export function GetStartedAccordion(props: GetStartedAccordionProps) {
  return (
    <EuiAccordion
      key={props.initialIsOpen} // re-mount if initialIsOpen changes, otherwise it does not update
      style={{ marginBottom: '-16px' }}
      initialIsOpen={props.initialIsOpen}
      id={`accordionGetStarted`}
      buttonContent={
        <EuiFlexGroup direction="row">
          <EuiFlexItem grow={false}>
            <EuiText>Get started</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      }
    >
      <EuiSpacer size="s" />
      <EuiFlexItem>
        <EuiFlexGroup direction="row">
          <EuiFlexItem>
            <EuiCard
              layout="horizontal"
              title={
                <EuiTitle size="s">
                  <h3>1. Set up models</h3>
                </EuiTitle>
              }
            >
              <EuiText>
                Connect to an externally hosted model and make it available in
                your OpenSearch cluster.{' '}
                <EuiLink href={ML_REMOTE_MODEL_LINK} target="_blank">
                  Learn more
                </EuiLink>
              </EuiText>
            </EuiCard>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              layout="horizontal"
              title={
                <EuiTitle size="s">
                  <h3>2. Ingest data</h3>
                </EuiTitle>
              }
            >
              <EuiText>
                Import sample data to get started; optionally add processors to
                create an ingest pipeline.
              </EuiText>
            </EuiCard>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              layout="horizontal"
              title={
                <EuiTitle size="s">
                  <h3>3. Build a search flow</h3>
                </EuiTitle>
              }
            >
              <EuiText>
                Configure a query; optionally add processors to create a search
                pipeline.
              </EuiText>
            </EuiCard>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              layout="horizontal"
              title={
                <EuiTitle size="s">
                  <h3>4. Export the workflow</h3>
                </EuiTitle>
              }
            >
              <EuiText>
                Export your workflow template to create and deploy the workflow
                on other OpenSearch clusters.{' '}
                <EuiLink href={CREATE_WORKFLOW_LINK} target="_blank">
                  Learn more
                </EuiLink>
              </EuiText>
            </EuiCard>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiAccordion>
  );
}
