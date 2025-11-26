/**
 * Base template component that other templates can extend
 * This provides the common interface for all documentation templates
 */

export default function BaseTemplate({
  project,
  collections,
  searchQuery,
  activeSection,
  onSectionClick,
  username,
  children
}) {
  // Base template should be extended by specific template implementations
  throw new Error('BaseTemplate should not be used directly. Use a specific template implementation.');
}

/**
 * Template configuration interface
 */
export const TemplateConfig = {
  name: '',
  description: '',
  preview: '', // URL to preview image
  features: [],
  settings: {
    // Template-specific settings
  }
};