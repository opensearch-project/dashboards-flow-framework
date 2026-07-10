const osdConfig = require('@elastic/eslint-config-kibana');

module.exports = [
  // Replaces .eslintignore (ESLint 10 no longer reads it).
  { ignores: ['node_modules', 'build', 'target'] },
  ...osdConfig,
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    rules: {
      // The 3 rules previously configured in the plugin's `eslintrc.json`.
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      'react-hooks/exhaustive-deps': 'off',

      // The plugin was previously linted with `eslint -c eslintrc.json`, where
      // `-c` REPLACES the config entirely -- so the OSD/Kibana strict ruleset
      // never applied to this code. The rules below are raised to errors by the
      // shared flat config but flag long-standing, intentional patterns
      // throughout the plugin. Downgrade to warnings to preserve the plugin's
      // prior lint behavior without a large, risky code churn (mirrors the
      // approach taken in sibling plugins such as alerting-dashboards-plugin).
      'no-console': 0,
      'no-empty': 'warn',
      'no-bitwise': 'warn',
      'guard-for-in': 'warn',
      'prefer-const': 'warn',
      'import/no-default-export': 'warn',
      // `react-hooks/rules-of-hooks` surfaces 27 pre-existing conditional/nested
      // hook violations. The plugin was previously linted with `eslint -c
      // eslintrc.json`, which replaced the config entirely and never registered
      // the react-hooks plugin, so this rule was never enforced here. Downgrade
      // to `warn` to preserve prior behavior and keep CI green; the violations
      // stay visible and are tracked for the owning team to fix.
      'react-hooks/rules-of-hooks': 'warn',
      'jsx-a11y/no-noninteractive-element-interactions': 'warn',
      'jest/no-identical-title': 'warn',
      '@typescript-eslint/no-var-requires': 'warn',
      'react/no-unescaped-entities': 'warn',
      radix: 'warn',
      eqeqeq: 'warn',
    },
  },
  {
    // Type-aware rules must stay scoped to TS files -- applying them to plain JS
    // (parsed by @babel/eslint-parser without type info) makes ESLint throw.
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/naming-convention': 'warn',
      '@typescript-eslint/no-shadow': 'warn',
    },
  },
];
