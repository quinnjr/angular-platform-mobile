/**
 * Commitlint Configuration
 *
 * Enforces conventional commit messages.
 * @see https://www.conventionalcommits.org/
 *
 * Format: <type>(<scope>): <subject>
 *
 * Types:
 *   feat:     A new feature
 *   fix:      A bug fix
 *   docs:     Documentation only changes
 *   style:    Code style changes (formatting, semicolons, etc)
 *   refactor: Code changes that neither fix bugs nor add features
 *   perf:     Performance improvements
 *   test:     Adding or correcting tests
 *   build:    Changes to build system or dependencies
 *   ci:       Changes to CI configuration
 *   chore:    Other changes that don't modify src or test files
 *   revert:   Reverts a previous commit
 *
 * Examples:
 *   feat(components): add Switch component
 *   fix(bridge): resolve WebSocket reconnection issue
 *   docs: update installation instructions
 *   chore(deps): bump typescript to 5.4.0
 */

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type must be one of the conventional types
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Type cannot be empty
    'type-empty': [2, 'never'],
    // Subject cannot be empty
    'subject-empty': [2, 'never'],
    // Subject must start with lowercase
    'subject-case': [2, 'always', 'lower-case'],
    // No period at the end of subject
    'subject-full-stop': [2, 'never', '.'],
    // Header max length
    'header-max-length': [2, 'always', 100],
    // Body max line length
    'body-max-line-length': [2, 'always', 200],
    // Scope case
    'scope-case': [2, 'always', 'lower-case'],
  },
};
