/**
 * Generate code snippets for API requests in different languages
 */

export function generateCurlCommand(request) {
  const { method, url, headers, body } = request
  
  let curlCommand = `curl -X ${method}`
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curlCommand += ` \\\n  -H "${key}: ${value}"`
  })
  
  // Add body for non-GET requests
  if (method !== 'GET' && body) {
    curlCommand += ` \\\n  -d '${body}'`
  }
  
  // Add URL
  curlCommand += ` \\\n  "${url}"`
  
  return curlCommand
}

export function generateJavaScriptFetch(request) {
  const { method, url, headers, body } = request
  
  let code = `const response = await fetch('${url}', {\n`
  code += `  method: '${method}'`
  
  // Add headers
  if (Object.keys(headers).length > 0) {
    code += `,\n  headers: {\n`
    Object.entries(headers).forEach(([key, value], index, array) => {
      code += `    '${key}': '${value}'`
      if (index < array.length - 1) code += ','
      code += '\n'
    })
    code += `  }`
  }
  
  // Add body
  if (method !== 'GET' && body) {
    code += `,\n  body: ${JSON.stringify(body)}`
  }
  
  code += '\n});\n\n'
  code += 'const data = await response.json();\n'
  code += 'console.log(data);'
  
  return code
}

export function generatePythonRequests(request) {
  const { method, url, headers, body } = request
  
  let code = 'import requests\nimport json\n\n'
  
  // URL
  code += `url = "${url}"\n\n`
  
  // Headers
  if (Object.keys(headers).length > 0) {
    code += 'headers = {\n'
    Object.entries(headers).forEach(([key, value], index, array) => {
      code += `    "${key}": "${value}"`
      if (index < array.length - 1) code += ','
      code += '\n'
    })
    code += '}\n\n'
  }
  
  // Body
  if (method !== 'GET' && body) {
    try {
      JSON.parse(body)
      code += `data = ${body}\n\n`
    } catch {
      code += `data = "${body.replace(/"/g, '\\"')}"\n\n`
    }
  }
  
  // Request
  code += `response = requests.${method.toLowerCase()}(url`
  
  if (Object.keys(headers).length > 0) {
    code += ', headers=headers'
  }
  
  if (method !== 'GET' && body) {
    try {
      JSON.parse(body)
      code += ', json=data'
    } catch {
      code += ', data=data'
    }
  }
  
  code += ')\n\n'
  code += 'print(response.status_code)\n'
  code += 'print(response.json())'
  
  return code
}

export function generateNodeJsAxios(request) {
  const { method, url, headers, body } = request
  
  let code = 'const axios = require(\'axios\');\n\n'
  
  code += 'const config = {\n'
  code += `  method: '${method.toLowerCase()}',\n`
  code += `  url: '${url}'`
  
  // Headers
  if (Object.keys(headers).length > 0) {
    code += ',\n  headers: {\n'
    Object.entries(headers).forEach(([key, value], index, array) => {
      code += `    '${key}': '${value}'`
      if (index < array.length - 1) code += ','
      code += '\n'
    })
    code += '  }'
  }
  
  // Data
  if (method !== 'GET' && body) {
    try {
      JSON.parse(body)
      code += `,\n  data: ${body}`
    } catch {
      code += `,\n  data: ${JSON.stringify(body)}`
    }
  }
  
  code += '\n};\n\n'
  code += 'axios(config)\n'
  code += '  .then(response => {\n'
  code += '    console.log(response.data);\n'
  code += '  })\n'
  code += '  .catch(error => {\n'
  code += '    console.error(error);\n'
  code += '  });'
  
  return code
}

export function generatePhpCurl(request) {
  const { method, url, headers, body } = request
  
  let code = '<?php\n\n'
  code += '$curl = curl_init();\n\n'
  
  code += 'curl_setopt_array($curl, array(\n'
  code += `  CURLOPT_URL => '${url}',\n`
  code += '  CURLOPT_RETURNTRANSFER => true,\n'
  code += '  CURLOPT_ENCODING => \'\',\n'
  code += '  CURLOPT_MAXREDIRS => 10,\n'
  code += '  CURLOPT_TIMEOUT => 0,\n'
  code += '  CURLOPT_FOLLOWLOCATION => true,\n'
  code += '  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,\n'
  code += `  CURLOPT_CUSTOMREQUEST => '${method}',\n`
  
  // Body
  if (method !== 'GET' && body) {
    code += `  CURLOPT_POSTFIELDS => '${body.replace(/'/g, "\\'")}',\n`
  }
  
  // Headers
  if (Object.keys(headers).length > 0) {
    code += '  CURLOPT_HTTPHEADER => array(\n'
    Object.entries(headers).forEach(([key, value], index, array) => {
      code += `    '${key}: ${value}'`
      if (index < array.length - 1) code += ','
      code += '\n'
    })
    code += '  ),\n'
  }
  
  code += '));\n\n'
  code += '$response = curl_exec($curl);\n\n'
  code += 'curl_close($curl);\n'
  code += 'echo $response;\n'
  code += '?>'
  
  return code
}

export const CODE_GENERATORS = {
  curl: {
    name: 'cURL',
    language: 'bash',
    generator: generateCurlCommand
  },
  javascript: {
    name: 'JavaScript (Fetch)',
    language: 'javascript',
    generator: generateJavaScriptFetch
  },
  python: {
    name: 'Python (Requests)',
    language: 'python',
    generator: generatePythonRequests
  },
  nodejs: {
    name: 'Node.js (Axios)',
    language: 'javascript',
    generator: generateNodeJsAxios
  },
  php: {
    name: 'PHP (cURL)',
    language: 'php',
    generator: generatePhpCurl
  }
}