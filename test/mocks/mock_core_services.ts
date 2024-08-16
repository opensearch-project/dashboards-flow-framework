/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

export const mockCoreServices = {
  getCore: () => {
    return {
      chrome: {
        setBreadcrumbs: jest.fn(),
      },
    };
  },
  getNotifications: () => {
    return {
      toasts: {
        addDanger: jest.fn().mockName('addDanger'),
        addSuccess: jest.fn().mockName('addSuccess'),
      },
    };
  },
  getDataSourceEnabled: () => {
    return {
      enabled: false,
    };
  },
  getUISettings: () => ({
    get: jest.fn((key) => {
      if (key === 'home:useNewHomePage') {
        return false;
      }
    }),
  }),
  getNavigationUI: () => ({
    TopNavMenu: jest.fn(),
    HeaderControl: jest.fn(),
  }),

  getApplication: () => ({
    setAppRightControls: jest.fn(),
  }),

  getHeaderActionMenu: () => jest.fn(),
};
