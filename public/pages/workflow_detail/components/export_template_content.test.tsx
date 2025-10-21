/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Workflow } from '../../../../common';
import { ExportTemplateContent } from './export_template_content';

const TEST_WORKFLOW_NAME = 'test-workflow-name';
const TEST_WORKFLOW = {
  name: TEST_WORKFLOW_NAME,
} as Workflow;

jest.mock('../../../services', () => {
  const { mockCoreServices } = require('../../../../test');
  return {
    ...jest.requireActual('../../../services'),
    ...mockCoreServices,
  };
});

describe('ExportTemplateContent', () => {
  global.URL.createObjectURL = jest.fn();

  test('renders the component', () => {
    render(<ExportTemplateContent workflow={TEST_WORKFLOW} />);

    expect(
      screen.getByTestId('exportDataToggleButtonGroup')
    ).toBeInTheDocument();
    // default to JSON
    expect(screen.getByText('Download JSON file')).toBeInTheDocument();
  });

  test('toggle JSON/YAML types', async () => {
    render(<ExportTemplateContent workflow={TEST_WORKFLOW} />);

    // default to JSON
    expect(screen.getByText('Download JSON file')).toBeInTheDocument();

    const yamlBtn = screen.getByTitle('YAML');
    await userEvent.click(yamlBtn);

    // switch to YAML
    expect(screen.getByText('Download YAML file')).toBeInTheDocument();
  });
});
