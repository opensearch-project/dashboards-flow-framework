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

interface GetStartedAccordionProps {}

export function GetStartedAccordion(props: GetStartedAccordionProps) {
  return (
    <EuiAccordion
      style={{ marginBottom: '-16px' }}
      initialIsOpen={false}
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
                Import sample data to get started; add processors to customize
                your ingest pipeline.
              </EuiText>
            </EuiCard>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              layout="horizontal"
              title={
                <EuiTitle size="s">
                  <h3>3. Build a search pipeline</h3>
                </EuiTitle>
              }
            >
              <EuiText>
                Set up a query and configure your search pipeline.
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
