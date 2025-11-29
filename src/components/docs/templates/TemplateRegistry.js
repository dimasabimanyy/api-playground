import MinimalistTemplate, { MinimalistConfig } from "./MinimalistTemplate";
import CleanSimpleTemplate, { CleanSimpleConfig } from "./CleanSimpleTemplate";
import ModernSaasTemplate, { ModernSaasConfig } from "./ModernSaasTemplate";
import GlassmorphismTemplate, {
  GlassmorphismConfig,
} from "./GlassmorphismTemplate";

/**
 * Template Registry
 * Manages all available documentation templates
 */
export const TEMPLATES = {
  minimalist: {
    component: MinimalistTemplate,
    config: MinimalistConfig,
    isDefault: false,
  },
  "clean-simple": {
    component: CleanSimpleTemplate,
    config: CleanSimpleConfig,
    isDefault: true,
  },
  "modern-saas": {
    component: ModernSaasTemplate,
    config: ModernSaasConfig,
    isDefault: false,
  },
  glassmorphism: {
    component: GlassmorphismTemplate,
    config: GlassmorphismConfig,
    isDefault: false,
  },
  // Add more templates here as they are implemented
  // 'stripe-style': {
  //   component: StripeTemplate,
  //   config: StripeConfig,
  //   isDefault: false
  // }
};

/**
 * Get template by key
 * @param {string} templateKey - Template identifier
 * @returns {Object} Template object with component and config
 */
export function getTemplate(templateKey) {
  const template = TEMPLATES[templateKey];
  if (!template) {
    console.warn(
      `Template '${templateKey}' not found, falling back to default template`
    );
    return getDefaultTemplate();
  }
  return template;
}

/**
 * Get the default template
 * @returns {Object} Default template object
 */
export function getDefaultTemplate() {
  const defaultTemplate = Object.values(TEMPLATES).find(
    (template) => template.isDefault
  );
  return defaultTemplate || TEMPLATES["minimalist"]; // fallback to minimalist
}

/**
 * Get all available templates for selection UI
 * @returns {Array} Array of template configs with keys
 */
export function getAllTemplates() {
  return Object.entries(TEMPLATES).map(([key, template]) => ({
    key,
    ...template.config,
    isDefault: template.isDefault,
  }));
}

/**
 * Validate template settings against template config
 * @param {string} templateKey - Template identifier
 * @param {Object} settings - Settings to validate
 * @returns {Object} Validated settings with defaults applied
 */
export function validateTemplateSettings(templateKey, settings = {}) {
  const template = getTemplate(templateKey);
  const defaultSettings = template.config.settings || {};

  // Merge settings with defaults
  return {
    ...defaultSettings,
    ...settings,
  };
}
