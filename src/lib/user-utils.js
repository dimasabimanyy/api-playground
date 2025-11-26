/**
 * User utilities for handling usernames and public URLs
 */

/**
 * Generate a username from user data
 * @param {Object} user - User object from Supabase
 * @returns {string} Username slug
 */
export function generateUsername(user) {
  if (!user) return null;

  // Priority order for username generation:
  // 1. user_metadata.username (if set by user)
  // 2. user_metadata.preferred_username (from OAuth)
  // 3. user_metadata.name (cleaned up)
  // 4. email prefix (before @)
  // 5. fallback to user ID

  const metadata = user.user_metadata || {};
  
  if (metadata.username) {
    return cleanUsername(metadata.username);
  }
  
  if (metadata.preferred_username) {
    return cleanUsername(metadata.preferred_username);
  }
  
  if (metadata.name) {
    return cleanUsername(metadata.name);
  }
  
  if (user.email) {
    const emailPrefix = user.email.split('@')[0];
    return cleanUsername(emailPrefix);
  }
  
  // Fallback to user ID (first 8 characters)
  return user.id.substring(0, 8);
}

/**
 * Clean and normalize username for URL usage
 * @param {string} input - Raw username input
 * @returns {string} Cleaned username
 */
export function cleanUsername(input) {
  if (!input) return '';
  
  return input
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Limit length
    .substring(0, 30);
}

/**
 * Generate project slug from project name
 * @param {string} projectName - Project name
 * @returns {string} Project slug for URL
 */
export function generateProjectSlug(projectName) {
  if (!projectName) return '';
  
  return projectName
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^a-z0-9]/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-|-$/g, '')
    // Limit length
    .substring(0, 50);
}

/**
 * Generate public documentation URL for a project
 * @param {string} username - User's username
 * @param {string} projectSlugOrName - Project slug (preferred) or project name
 * @param {string} baseUrl - Base URL (optional, defaults to current origin)
 * @param {boolean} isSlug - Whether projectSlugOrName is already a slug (default: false)
 * @returns {string} Public documentation URL
 */
export function generatePublicDocUrl(username, projectSlugOrName, baseUrl = null, isSlug = false) {
  if (!username || !projectSlugOrName) return '';
  
  const cleanedUsername = cleanUsername(username);
  const projectSlug = isSlug ? projectSlugOrName : generateProjectSlug(projectSlugOrName);
  
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  
  return `${base}/${cleanedUsername}/${projectSlug}`;
}

/**
 * Validate username format
 * @param {string} username - Username to validate
 * @returns {boolean} Whether username is valid
 */
export function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  
  // Username must be 3-30 characters, alphanumeric and hyphens only
  const usernameRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  
  return (
    username.length >= 3 && 
    username.length <= 30 && 
    usernameRegex.test(username) &&
    !username.startsWith('-') &&
    !username.endsWith('-')
  );
}

/**
 * Get display name for user
 * @param {Object} user - User object
 * @returns {string} Display name
 */
export function getDisplayName(user) {
  if (!user) return 'Unknown User';
  
  const metadata = user.user_metadata || {};
  
  return (
    metadata.full_name ||
    metadata.name || 
    metadata.preferred_username ||
    user.email ||
    'User'
  );
}