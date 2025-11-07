/**
 * Test utility for verifying real data integration with enhanced docs system
 * This can be run in the browser console to test the integration
 */

import { DocsGenerator } from '../lib/docs-generator';
import { DocsMetadata, DocsProjects } from '../lib/docs-storage';

// Mock collections data that matches the structure from CollectionsContext
const mockCollectionsData = {
  'test-collection-1': {
    id: 'test-collection-1',
    name: 'User Management API',
    description: 'APIs for managing user accounts and authentication',
    color: 'blue',
    requests: [
      {
        id: 'req-1',
        name: 'Get User Profile',
        method: 'GET',
        url: '/api/users/me',
        headers: {
          'Authorization': 'Bearer {{token}}',
          'Content-Type': 'application/json'
        },
        body: ''
      },
      {
        id: 'req-2',
        name: 'Update User Profile',
        method: 'PUT',
        url: '/api/users/me',
        headers: {
          'Authorization': 'Bearer {{token}}',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "John Doe",
          email: "john@example.com"
        }, null, 2)
      }
    ]
  },
  'test-collection-2': {
    id: 'test-collection-2',
    name: 'Product API',
    description: 'Product catalog and inventory management',
    color: 'green',
    requests: [
      {
        id: 'req-3',
        name: 'List Products',
        method: 'GET',
        url: '/api/products',
        headers: {
          'Authorization': 'Bearer {{token}}'
        },
        body: ''
      },
      {
        id: 'req-4',
        name: 'Create Product',
        method: 'POST',
        url: '/api/products',
        headers: {
          'Authorization': 'Bearer {{token}}',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: "Premium Widget",
          price: 99.99,
          category: "electronics"
        }, null, 2)
      }
    ]
  }
};

/**
 * Test the enhanced data structure
 */
export async function testEnhancedDataStructure() {
  console.log('🧪 Testing Enhanced Data Structure...\n');
  
  try {
    // Test collection enhancement
    const testCollection = mockCollectionsData['test-collection-1'];
    const enhancedCollection = DocsMetadata.enhanceCollection(testCollection);
    
    console.log('✅ Collection Enhancement:');
    console.log('- Original:', testCollection.name);
    console.log('- Enhanced with docs metadata:', !!enhancedCollection.docs);
    console.log('- Docs title:', enhancedCollection.docs?.title);
    console.log('- Has auto-generated metadata:', !!enhancedCollection.docs?.lastModified);
    
    // Test request enhancement
    const testRequest = testCollection.requests[0];
    const enhancedRequest = DocsMetadata.enhanceRequest(testRequest);
    
    console.log('\n✅ Request Enhancement:');
    console.log('- Original:', testRequest.name);
    console.log('- Enhanced with docs metadata:', !!enhancedRequest.docs);
    console.log('- Has response documentation:', !!enhancedRequest.docs?.responses);
    console.log('- Has generated curl example:', !!enhancedRequest.docs?.examples?.curl);
    
    return { success: true, enhancedCollection, enhancedRequest };
  } catch (error) {
    console.error('❌ Enhanced Data Structure Test Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test the docs generator with real data
 */
export async function testDocsGenerator() {
  console.log('\n🔧 Testing Docs Generator...\n');
  
  try {
    // Test static generation method
    const docData = await DocsGenerator.generateFromCollections(mockCollectionsData, {
      title: 'Test API Documentation',
      description: 'Generated from real collections data',
      baseUrl: 'https://api.test.com',
      theme: 'modern',
      showToc: true,
      showSearch: true,
      showCodeExamples: true,
    });
    
    console.log('✅ Documentation Generation:');
    console.log('- Generated doc data:', !!docData);
    console.log('- Collections count:', docData.collections?.length);
    console.log('- Total endpoints:', docData.meta?.totalEndpoints);
    console.log('- Navigation structure:', docData.navigation?.length, 'items');
    console.log('- Search index:', docData.searchIndex?.length, 'entries');
    
    // Test export formats
    const generator = new DocsGenerator('test');
    generator.project = docData.project;
    generator.collections = docData.collections;
    
    const htmlExport = generator.export('html');
    const openApiExport = generator.export('openapi');
    const postmanExport = generator.export('postman');
    
    console.log('\n✅ Export Formats:');
    console.log('- HTML export:', htmlExport.format, htmlExport.filename);
    console.log('- OpenAPI export:', openApiExport.format, openApiExport.filename);
    console.log('- Postman export:', postmanExport.format, postmanExport.filename);
    
    return { success: true, docData, exports: { htmlExport, openApiExport, postmanExport } };
  } catch (error) {
    console.error('❌ Docs Generator Test Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test the storage system
 */
export async function testStorageSystem() {
  console.log('\n💾 Testing Storage System...\n');
  
  try {
    // Test project creation
    const project = DocsProjects.create(
      'Test Documentation Project',
      'A test project for verifying the docs system',
      Object.keys(mockCollectionsData)
    );
    
    console.log('✅ Project Creation:');
    console.log('- Project ID:', project.id);
    console.log('- Project name:', project.name);
    console.log('- Collections:', project.collections.length);
    
    // Test metadata storage
    const testCollection = mockCollectionsData['test-collection-1'];
    const savedCollectionDocs = DocsMetadata.saveCollection(testCollection.id, {
      title: testCollection.name,
      description: 'Enhanced description for ' + testCollection.name,
      tags: ['user-management', 'authentication'],
      summary: 'User-related API endpoints',
    });
    
    console.log('\n✅ Metadata Storage:');
    console.log('- Collection docs saved:', !!savedCollectionDocs);
    console.log('- Retrieved metadata:', !!DocsMetadata.getCollection(testCollection.id));
    
    // Test search
    const searchResults = DocsMetadata.search('user');
    
    console.log('\n✅ Search Functionality:');
    console.log('- Search for "user":', searchResults.collections.length + searchResults.requests.length, 'results');
    
    // Clean up test data
    DocsProjects.delete(project.id);
    DocsMetadata.deleteCollection(testCollection.id);
    
    return { success: true, project, searchResults };
  } catch (error) {
    console.error('❌ Storage System Test Failed:', error);
    return { success: false, error };
  }
}

/**
 * Test the integration with session storage (used by docs viewer)
 */
export async function testSessionStorageIntegration() {
  console.log('\n🔄 Testing Session Storage Integration...\n');
  
  try {
    // Generate docs data
    const docData = await DocsGenerator.generateFromCollections(mockCollectionsData, {
      title: 'Session Storage Test',
      description: 'Testing session storage integration',
    });
    
    // Store in session storage (as done by DocGeneratorModal)
    const docId = `doc_test_${Date.now()}`;
    sessionStorage.setItem(`docs_${docId}`, JSON.stringify(docData));
    
    // Retrieve and verify
    const storedData = sessionStorage.getItem(`docs_${docId}`);
    const retrievedData = JSON.parse(storedData);
    
    console.log('✅ Session Storage Integration:');
    console.log('- Data stored successfully:', !!storedData);
    console.log('- Data retrieved successfully:', !!retrievedData);
    console.log('- Collections preserved:', retrievedData.collections?.length === docData.collections?.length);
    console.log('- Metadata preserved:', !!retrievedData.meta);
    
    // Clean up
    sessionStorage.removeItem(`docs_${docId}`);
    
    return { success: true, docId, dataSize: storedData.length };
  } catch (error) {
    console.error('❌ Session Storage Integration Test Failed:', error);
    return { success: false, error };
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Enhanced Docs Integration Tests\n');
  console.log('=' .repeat(50));
  
  const results = {
    enhancedDataStructure: await testEnhancedDataStructure(),
    docsGenerator: await testDocsGenerator(),
    storageSystem: await testStorageSystem(),
    sessionStorageIntegration: await testSessionStorageIntegration(),
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:\n');
  
  let totalTests = 0;
  let passedTests = 0;
  
  Object.entries(results).forEach(([testName, result]) => {
    totalTests++;
    if (result.success) {
      passedTests++;
      console.log(`✅ ${testName}: PASSED`);
    } else {
      console.log(`❌ ${testName}: FAILED`);
      console.log(`   Error: ${result.error?.message || 'Unknown error'}`);
    }
  });
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Enhanced docs integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the errors above.');
  }
  
  return results;
}

// Export test data for manual testing
export { mockCollectionsData };

// Auto-run tests if called directly
if (typeof window !== 'undefined' && window.location?.pathname.includes('/playground')) {
  // Only run in playground context
  window.testDocsIntegration = runAllTests;
  console.log('🔧 Docs integration tests available. Run: testDocsIntegration()');
}