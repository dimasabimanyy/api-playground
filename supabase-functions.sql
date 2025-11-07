-- Additional SQL functions for documentation features

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE docs_templates 
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's enhanced collections with docs metadata
CREATE OR REPLACE FUNCTION get_enhanced_collections(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  color VARCHAR(50),
  is_default BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  docs_title VARCHAR(255),
  docs_overview TEXT,
  docs_description TEXT,
  docs_tags TEXT[],
  docs_authentication JSONB,
  docs_base_url TEXT,
  docs_version VARCHAR(50),
  docs_color VARCHAR(50),
  docs_icon VARCHAR(100),
  docs_last_modified TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.description,
    c.color,
    c.is_default,
    c.created_at,
    c.updated_at,
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
  LEFT JOIN docs_collections_metadata dcm ON c.id = dcm.collection_id AND c.user_id = dcm.user_id
  WHERE c.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's enhanced requests with docs metadata
CREATE OR REPLACE FUNCTION get_enhanced_requests(user_uuid UUID, collection_uuid UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  collection_id UUID,
  name VARCHAR(255),
  description TEXT,
  method VARCHAR(10),
  url TEXT,
  headers JSONB,
  body TEXT,
  tags TEXT[],
  position INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  docs_title VARCHAR(255),
  docs_summary TEXT,
  docs_description TEXT,
  docs_notes TEXT,
  docs_tags TEXT[],
  docs_parameters JSONB,
  docs_responses JSONB,
  docs_examples JSONB,
  docs_operation_id VARCHAR(255),
  docs_deprecated BOOLEAN,
  docs_category VARCHAR(100),
  docs_priority INTEGER,
  docs_last_modified TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.collection_id,
    r.name,
    r.description,
    r.method,
    r.url,
    r.headers,
    r.body,
    r.tags,
    r.position,
    r.created_at,
    r.updated_at,
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
  LEFT JOIN docs_requests_metadata drm ON r.id = drm.request_id
  INNER JOIN collections c ON r.collection_id = c.id
  WHERE c.user_id = user_uuid 
    AND (collection_uuid IS NULL OR r.collection_id = collection_uuid)
    AND (drm.user_id = user_uuid OR drm.user_id IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up documentation data for deleted collections/requests
CREATE OR REPLACE FUNCTION cleanup_orphaned_docs_metadata()
RETURNS INTEGER AS $$
DECLARE
  cleaned_count INTEGER := 0;
BEGIN
  -- Clean up collection metadata for deleted collections
  DELETE FROM docs_collections_metadata 
  WHERE collection_id NOT IN (SELECT id FROM collections);
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  -- Clean up request metadata for deleted requests
  DELETE FROM docs_requests_metadata 
  WHERE request_id NOT IN (SELECT id FROM requests);
  
  GET DIAGNOSTICS cleaned_count = cleaned_count + ROW_COUNT;
  
  RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get documentation project with full details
CREATE OR REPLACE FUNCTION get_project_with_details(project_uuid UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  settings JSONB,
  collections UUID[],
  status VARCHAR(50),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  collection_count INTEGER,
  request_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.id,
    dp.name,
    dp.description,
    dp.settings,
    dp.collections,
    dp.status,
    dp.created_at,
    dp.updated_at,
    array_length(dp.collections, 1) as collection_count,
    (
      SELECT COUNT(*)::INTEGER 
      FROM requests r 
      INNER JOIN collections c ON r.collection_id = c.id 
      WHERE c.id = ANY(dp.collections) AND c.user_id = dp.user_id
    ) as request_count
  FROM docs_projects dp
  WHERE dp.id = project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search across documentation content
CREATE OR REPLACE FUNCTION search_documentation(
  user_uuid UUID,
  search_query TEXT,
  search_type TEXT DEFAULT 'all'
)
RETURNS TABLE (
  result_type TEXT,
  id UUID,
  title TEXT,
  description TEXT,
  score FLOAT
) AS $$
BEGIN
  -- Search in projects
  IF search_type = 'all' OR search_type = 'projects' THEN
    RETURN QUERY
    SELECT 
      'project'::TEXT as result_type,
      dp.id,
      dp.name::TEXT as title,
      dp.description::TEXT as description,
      ts_rank(
        to_tsvector('english', dp.name || ' ' || COALESCE(dp.description, '')),
        plainto_tsquery('english', search_query)
      ) as score
    FROM docs_projects dp
    WHERE dp.user_id = user_uuid
      AND dp.status = 'active'
      AND (
        dp.name ILIKE '%' || search_query || '%' 
        OR dp.description ILIKE '%' || search_query || '%'
      )
    ORDER BY score DESC;
  END IF;

  -- Search in collections
  IF search_type = 'all' OR search_type = 'collections' THEN
    RETURN QUERY
    SELECT 
      'collection'::TEXT as result_type,
      c.id,
      COALESCE(dcm.title, c.name)::TEXT as title,
      COALESCE(dcm.description, c.description)::TEXT as description,
      ts_rank(
        to_tsvector('english', 
          COALESCE(dcm.title, c.name) || ' ' || 
          COALESCE(dcm.description, c.description, '') || ' ' ||
          COALESCE(dcm.overview, '')
        ),
        plainto_tsquery('english', search_query)
      ) as score
    FROM collections c
    LEFT JOIN docs_collections_metadata dcm ON c.id = dcm.collection_id AND c.user_id = dcm.user_id
    WHERE c.user_id = user_uuid
      AND (
        c.name ILIKE '%' || search_query || '%' 
        OR c.description ILIKE '%' || search_query || '%'
        OR dcm.title ILIKE '%' || search_query || '%'
        OR dcm.description ILIKE '%' || search_query || '%'
        OR dcm.overview ILIKE '%' || search_query || '%'
      )
    ORDER BY score DESC;
  END IF;

  -- Search in requests
  IF search_type = 'all' OR search_type = 'requests' THEN
    RETURN QUERY
    SELECT 
      'request'::TEXT as result_type,
      r.id,
      COALESCE(drm.title, r.name)::TEXT as title,
      COALESCE(drm.description, r.description)::TEXT as description,
      ts_rank(
        to_tsvector('english', 
          COALESCE(drm.title, r.name) || ' ' || 
          COALESCE(drm.description, r.description, '') || ' ' ||
          COALESCE(drm.summary, '') || ' ' ||
          r.url
        ),
        plainto_tsquery('english', search_query)
      ) as score
    FROM requests r
    INNER JOIN collections c ON r.collection_id = c.id
    LEFT JOIN docs_requests_metadata drm ON r.id = drm.request_id AND c.user_id = drm.user_id
    WHERE c.user_id = user_uuid
      AND (
        r.name ILIKE '%' || search_query || '%' 
        OR r.description ILIKE '%' || search_query || '%'
        OR r.url ILIKE '%' || search_query || '%'
        OR drm.title ILIKE '%' || search_query || '%'
        OR drm.description ILIKE '%' || search_query || '%'
        OR drm.summary ILIKE '%' || search_query || '%'
      )
    ORDER BY score DESC;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a materialized view for faster full-text search
CREATE MATERIALIZED VIEW IF NOT EXISTS docs_search_index AS
SELECT 
  'project'::TEXT as type,
  dp.id,
  dp.user_id,
  dp.name as title,
  dp.description,
  to_tsvector('english', dp.name || ' ' || COALESCE(dp.description, '')) as search_vector,
  dp.updated_at
FROM docs_projects dp
WHERE dp.status = 'active'

UNION ALL

SELECT 
  'collection'::TEXT as type,
  c.id,
  c.user_id,
  COALESCE(dcm.title, c.name) as title,
  COALESCE(dcm.description, c.description) as description,
  to_tsvector('english', 
    COALESCE(dcm.title, c.name) || ' ' || 
    COALESCE(dcm.description, c.description, '') || ' ' ||
    COALESCE(dcm.overview, '')
  ) as search_vector,
  c.updated_at
FROM collections c
LEFT JOIN docs_collections_metadata dcm ON c.id = dcm.collection_id AND c.user_id = dcm.user_id

UNION ALL

SELECT 
  'request'::TEXT as type,
  r.id,
  c.user_id,
  COALESCE(drm.title, r.name) as title,
  COALESCE(drm.description, r.description) as description,
  to_tsvector('english', 
    COALESCE(drm.title, r.name) || ' ' || 
    COALESCE(drm.description, r.description, '') || ' ' ||
    COALESCE(drm.summary, '') || ' ' ||
    r.url
  ) as search_vector,
  r.updated_at
FROM requests r
INNER JOIN collections c ON r.collection_id = c.id
LEFT JOIN docs_requests_metadata drm ON r.id = drm.request_id AND c.user_id = drm.user_id;

-- Create index on the search vector
CREATE INDEX IF NOT EXISTS idx_docs_search_vector ON docs_search_index USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_docs_search_user_type ON docs_search_index(user_id, type);

-- Function to refresh the search index
CREATE OR REPLACE FUNCTION refresh_docs_search_index()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY docs_search_index;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for fast search using the materialized view
CREATE OR REPLACE FUNCTION fast_search_documentation(
  user_uuid UUID,
  search_query TEXT,
  search_type TEXT DEFAULT 'all',
  limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
  result_type TEXT,
  id UUID,
  title TEXT,
  description TEXT,
  score FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dsi.type as result_type,
    dsi.id,
    dsi.title,
    dsi.description,
    ts_rank(dsi.search_vector, plainto_tsquery('english', search_query)) as score
  FROM docs_search_index dsi
  WHERE dsi.user_id = user_uuid
    AND (search_type = 'all' OR dsi.type = search_type)
    AND dsi.search_vector @@ plainto_tsquery('english', search_query)
  ORDER BY score DESC
  LIMIT limit_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;