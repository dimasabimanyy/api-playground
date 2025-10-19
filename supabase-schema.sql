-- API Playground Database Schema
-- This file contains the SQL to set up the database structure for user collections and requests

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Collections table
CREATE TABLE collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  color VARCHAR(50) DEFAULT 'blue',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requests table
CREATE TABLE requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  method VARCHAR(10) NOT NULL DEFAULT 'GET',
  url TEXT NOT NULL,
  headers JSONB DEFAULT '{}',
  body TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request history table (for tracking sent requests)
CREATE TABLE request_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  headers JSONB DEFAULT '{}',
  body TEXT DEFAULT '',
  response_status INTEGER,
  response_headers JSONB DEFAULT '{}',
  response_body TEXT,
  response_time INTEGER, -- in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_requests_collection_id ON requests(collection_id);
CREATE INDEX idx_requests_position ON requests(collection_id, position);
CREATE INDEX idx_request_history_user_id ON request_history(user_id);
CREATE INDEX idx_request_history_created_at ON request_history(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections
CREATE POLICY "Users can view their own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for requests
CREATE POLICY "Users can view requests in their collections" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = requests.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create requests in their collections" ON requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = requests.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update requests in their collections" ON requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = requests.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete requests in their collections" ON requests
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM collections 
      WHERE collections.id = requests.collection_id 
      AND collections.user_id = auth.uid()
    )
  );

-- RLS Policies for request_history
CREATE POLICY "Users can view their own request history" ON request_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own request history" ON request_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_collections_updated_at BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default collections for new users
CREATE OR REPLACE FUNCTION create_default_collections()
RETURNS TRIGGER AS $$
DECLARE
  examples_collection_id UUID;
BEGIN
  -- Create "My APIs" collection
  INSERT INTO collections (user_id, name, description, color, is_default)
  VALUES (NEW.id, 'My APIs', 'Your saved API requests', 'blue', true);
  
  -- Create "Examples" collection with sample requests
  INSERT INTO collections (user_id, name, description, color)
  VALUES (NEW.id, 'Examples', 'Popular API examples to get started', 'green')
  RETURNING id INTO examples_collection_id;
  
  -- Add sample requests to Examples collection
  INSERT INTO requests (collection_id, name, description, method, url, headers, body, tags, position)
  VALUES 
    (
      examples_collection_id,
      'Get User Profile',
      'Fetch user data from JSONPlaceholder',
      'GET',
      'https://jsonplaceholder.typicode.com/users/1',
      '{}',
      '',
      ARRAY['demo', 'users'],
      0
    ),
    (
      examples_collection_id,
      'Create Post',
      'Create a new post with JSONPlaceholder',
      'POST',
      'https://jsonplaceholder.typicode.com/posts',
      '{"Content-Type": "application/json"}',
      '{\n  "title": "My New Post",\n  "body": "This is the content of my post",\n  "userId": 1\n}',
      ARRAY['demo', 'posts'],
      1
    );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create default collections when a user signs up
CREATE TRIGGER create_user_default_collections
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_collections();