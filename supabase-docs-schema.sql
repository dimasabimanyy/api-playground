-- Documentation Features Database Schema Extension
-- This extends the existing schema to support enhanced documentation features

-- Documentation Projects table
CREATE TABLE docs_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  settings JSONB DEFAULT '{}',
  collections UUID[] DEFAULT '{}', -- Array of collection IDs
  status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection Documentation Metadata table
CREATE TABLE docs_collections_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Enhanced documentation fields
  title VARCHAR(255),
  overview TEXT DEFAULT '',
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  
  -- Authentication documentation
  authentication JSONB DEFAULT '{}', -- {type, description, examples}
  
  -- API configuration
  base_url TEXT DEFAULT '',
  version VARCHAR(50) DEFAULT '',
  
  -- Organization and display
  color VARCHAR(50) DEFAULT '',
  icon VARCHAR(100) DEFAULT '',
  position INTEGER DEFAULT 0,
  
  -- Documentation metadata
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one docs metadata per collection per user
  UNIQUE(collection_id, user_id)
);

-- Request Documentation Metadata table
CREATE TABLE docs_requests_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Enhanced documentation fields
  title VARCHAR(255),
  summary TEXT DEFAULT '',
  description TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  
  -- Parameter documentation
  parameters JSONB DEFAULT '{}', -- {query: [], path: [], header: [], cookie: []}
  
  -- Response documentation  
  responses JSONB DEFAULT '{}', -- {200: {description, schema, examples}, 404: {...}}
  
  -- Code examples
  examples JSONB DEFAULT '{}', -- {curl: "...", javascript: "...", python: "..."}
  
  -- API specification details
  operation_id VARCHAR(255) DEFAULT '',
  deprecated BOOLEAN DEFAULT false,
  
  -- Organization
  category VARCHAR(100) DEFAULT '',
  priority INTEGER DEFAULT 0,
  
  -- Documentation metadata
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one docs metadata per request per user
  UNIQUE(request_id, user_id)
);

-- Documentation Templates table (for reusable templates)
CREATE TABLE docs_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  type VARCHAR(50) NOT NULL, -- 'collection', 'request', 'project'
  
  -- Template content
  template_data JSONB NOT NULL DEFAULT '{}',
  
  -- Template metadata
  is_public BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false, -- for built-in templates
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documentation Settings table (user preferences)
CREATE TABLE docs_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Documentation preferences
  default_theme VARCHAR(50) DEFAULT 'modern',
  auto_save BOOLEAN DEFAULT true,
  auto_save_interval INTEGER DEFAULT 30000, -- milliseconds
  
  -- Export preferences
  default_export_format VARCHAR(50) DEFAULT 'html',
  include_examples BOOLEAN DEFAULT true,
  include_auth BOOLEAN DEFAULT true,
  group_by_collection BOOLEAN DEFAULT true,
  include_error_codes BOOLEAN DEFAULT true,
  
  -- Display preferences
  show_request_body BOOLEAN DEFAULT true,
  show_response_examples BOOLEAN DEFAULT true,
  code_theme VARCHAR(50) DEFAULT 'vs-dark',
  
  -- Backup settings
  backup_enabled BOOLEAN DEFAULT true,
  max_backups INTEGER DEFAULT 10,
  last_backup_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one settings record per user
  UNIQUE(user_id)
);

-- Documentation Cache table (for performance)
CREATE TABLE docs_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Cached content
  content JSONB NOT NULL,
  content_type VARCHAR(100) DEFAULT 'json',
  
  -- Cache metadata
  max_age INTEGER DEFAULT 3600000, -- milliseconds
  tags TEXT[] DEFAULT '{}', -- for cache invalidation
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Add indexes for better performance
CREATE INDEX idx_docs_projects_user_id ON docs_projects(user_id);
CREATE INDEX idx_docs_projects_status ON docs_projects(status);
CREATE INDEX idx_docs_projects_updated_at ON docs_projects(updated_at);

CREATE INDEX idx_docs_collections_metadata_collection_id ON docs_collections_metadata(collection_id);
CREATE INDEX idx_docs_collections_metadata_user_id ON docs_collections_metadata(user_id);
CREATE INDEX idx_docs_collections_metadata_position ON docs_collections_metadata(user_id, position);

CREATE INDEX idx_docs_requests_metadata_request_id ON docs_requests_metadata(request_id);
CREATE INDEX idx_docs_requests_metadata_user_id ON docs_requests_metadata(user_id);
CREATE INDEX idx_docs_requests_metadata_category ON docs_requests_metadata(category);
CREATE INDEX idx_docs_requests_metadata_tags ON docs_requests_metadata USING GIN(tags);

CREATE INDEX idx_docs_templates_user_id ON docs_templates(user_id);
CREATE INDEX idx_docs_templates_type ON docs_templates(type);
CREATE INDEX idx_docs_templates_is_public ON docs_templates(is_public);
CREATE INDEX idx_docs_templates_is_system ON docs_templates(is_system);

CREATE INDEX idx_docs_settings_user_id ON docs_settings(user_id);

CREATE INDEX idx_docs_cache_cache_key ON docs_cache(cache_key);
CREATE INDEX idx_docs_cache_user_id ON docs_cache(user_id);
CREATE INDEX idx_docs_cache_expires_at ON docs_cache(expires_at);
CREATE INDEX idx_docs_cache_tags ON docs_cache USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE docs_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_collections_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_requests_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for docs_projects
CREATE POLICY "Users can view their own documentation projects" ON docs_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documentation projects" ON docs_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documentation projects" ON docs_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documentation projects" ON docs_projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for docs_collections_metadata
CREATE POLICY "Users can view their own collection docs metadata" ON docs_collections_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collection docs metadata" ON docs_collections_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collection docs metadata" ON docs_collections_metadata
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collection docs metadata" ON docs_collections_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for docs_requests_metadata
CREATE POLICY "Users can view their own request docs metadata" ON docs_requests_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own request docs metadata" ON docs_requests_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own request docs metadata" ON docs_requests_metadata
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own request docs metadata" ON docs_requests_metadata
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for docs_templates
CREATE POLICY "Users can view their own templates and public/system templates" ON docs_templates
  FOR SELECT USING (
    auth.uid() = user_id 
    OR is_public = true 
    OR is_system = true 
    OR user_id IS NULL
  );

CREATE POLICY "Users can create their own templates" ON docs_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can update their own templates" ON docs_templates
  FOR UPDATE USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can delete their own templates" ON docs_templates
  FOR DELETE USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- RLS Policies for docs_settings
CREATE POLICY "Users can view their own documentation settings" ON docs_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documentation settings" ON docs_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documentation settings" ON docs_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documentation settings" ON docs_settings
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for docs_cache
CREATE POLICY "Users can view their own cache entries" ON docs_cache
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own cache entries" ON docs_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own cache entries" ON docs_cache
  FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own cache entries" ON docs_cache
  FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Triggers to automatically update updated_at timestamps
CREATE TRIGGER update_docs_projects_updated_at BEFORE UPDATE ON docs_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docs_collections_metadata_updated_at BEFORE UPDATE ON docs_collections_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docs_requests_metadata_updated_at BEFORE UPDATE ON docs_requests_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docs_templates_updated_at BEFORE UPDATE ON docs_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docs_settings_updated_at BEFORE UPDATE ON docs_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM docs_cache WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to create default documentation settings for new users
CREATE OR REPLACE FUNCTION create_default_docs_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO docs_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default documentation settings when a user signs up
CREATE TRIGGER create_user_default_docs_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_docs_settings();

-- Function to update last_modified timestamp in metadata tables
CREATE OR REPLACE FUNCTION update_docs_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = NOW();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update last_modified on docs metadata changes
CREATE TRIGGER update_docs_collections_last_modified BEFORE UPDATE ON docs_collections_metadata
  FOR EACH ROW EXECUTE FUNCTION update_docs_last_modified();

CREATE TRIGGER update_docs_requests_last_modified BEFORE UPDATE ON docs_requests_metadata
  FOR EACH ROW EXECUTE FUNCTION update_docs_last_modified();

-- Create some default system templates (user_id is NULL for system templates)
INSERT INTO docs_templates (name, description, type, template_data, is_system, user_id)
VALUES 
  (
    'Modern API Template',
    'Clean and modern documentation template',
    'project',
    '{"theme": "modern", "showToc": true, "showSearch": true, "codeTheme": "vs-dark"}',
    true,
    NULL
  ),
  (
    'Minimal API Template', 
    'Simple text-focused documentation template',
    'project',
    '{"theme": "minimal", "showToc": false, "showSearch": false, "codeTheme": "github"}',
    true,
    NULL
  ),
  (
    'REST Endpoint Template',
    'Standard REST endpoint documentation template',
    'request',
    '{"includeParams": true, "includeResponses": true, "includeExamples": true}',
    true,
    NULL
  );

-- Create a view for enhanced collections with docs metadata
CREATE OR REPLACE VIEW enhanced_collections AS
SELECT 
  c.*,
  dcm.title as docs_title,
  dcm.overview as docs_overview,
  dcm.description as docs_description,
  dcm.tags as docs_tags,
  dcm.authentication as docs_authentication,
  dcm.base_url as docs_base_url,
  dcm.version as docs_version,
  dcm.color as docs_color,
  dcm.icon as docs_icon,
  dcm.last_modified as docs_last_modified
FROM collections c
LEFT JOIN docs_collections_metadata dcm ON c.id = dcm.collection_id AND c.user_id = dcm.user_id;

-- Create a view for enhanced requests with docs metadata  
CREATE OR REPLACE VIEW enhanced_requests AS
SELECT 
  r.*,
  drm.title as docs_title,
  drm.summary as docs_summary,
  drm.description as docs_description,
  drm.notes as docs_notes,
  drm.tags as docs_tags,
  drm.parameters as docs_parameters,
  drm.responses as docs_responses,
  drm.examples as docs_examples,
  drm.operation_id as docs_operation_id,
  drm.deprecated as docs_deprecated,
  drm.category as docs_category,
  drm.priority as docs_priority,
  drm.last_modified as docs_last_modified
FROM requests r
LEFT JOIN docs_requests_metadata drm ON r.id = drm.request_id AND 
  EXISTS (
    SELECT 1 FROM collections c 
    WHERE c.id = r.collection_id 
    AND c.user_id = drm.user_id
  );

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT USAGE ON SCHEMA public TO anon, authenticated;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;