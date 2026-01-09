const axios = require('axios');

// Get token from command line or use a default one
const token = process.argv[2];

if (!token) {
  console.log('❌ Please provide a JWT token as argument');
  console.log('Usage: node test-graphql-query.js YOUR_JWT_TOKEN');
  process.exit(1);
}

const query = `
  query me {
    me {
      _id
      name
      email
      currentOrganization {
        _id
        name
        slug
        inviteCode
        owner {
          _id
          name
        }
        members {
          _id
          name
          email
        }
      }
    }
  }
`;

axios.post('http://localhost:3001/graphql', 
  { query },
  {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
)
.then(response => {
  console.log('✅ GraphQL Response:');
  console.log(JSON.stringify(response.data, null, 2));
  
  if (response.data.data?.me?.currentOrganization) {
    console.log('\n✅ Current Organization:');
    console.log('  Name:', response.data.data.me.currentOrganization.name);
    console.log('  Invite Code:', response.data.data.me.currentOrganization.inviteCode);
  } else {
    console.log('\n⚠️ No currentOrganization in response');
  }
})
.catch(error => {
  console.log('❌ Error:');
  if (error.response) {
    console.log(JSON.stringify(error.response.data, null, 2));
  } else {
    console.log(error.message);
  }
});
