#!/bin/bash

# Railway Deployment Verification Script
# Run this to check if Railway is running the latest code

API_URL="https://rosterhub-production.up.railway.app"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🔍 Railway Deployment Verification                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test 1: Health Endpoint
echo "📋 Test 1: Health Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HEALTH_RESPONSE=$(curl -s "$API_URL/health" 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"'; then
    echo "✅ PASS: Health endpoint exists and responds correctly"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo "❌ FAIL: Health endpoint missing or not responding"
    echo "   Response: $HEALTH_RESPONSE"
    echo "   ⚠️  Railway is running OLD CODE!"
fi
echo ""

# Test 2: Root Endpoint
echo "📋 Test 2: Root Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ROOT_RESPONSE=$(curl -s "$API_URL/" 2>&1)
if echo "$ROOT_RESPONSE" | grep -q '"message":"RosterHub API Server"'; then
    echo "✅ PASS: Root endpoint exists and responds correctly"
    echo "   Response: $ROOT_RESPONSE"
else
    echo "❌ FAIL: Root endpoint missing or not responding"
    echo "   Response: $ROOT_RESPONSE"
    echo "   ⚠️  Railway is running OLD CODE!"
fi
echo ""

# Test 3: GraphQL Schema (check for createOrganization)
echo "📋 Test 3: GraphQL Schema - createOrganization Mutation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
GRAPHQL_RESPONSE=$(curl -s -X POST "$API_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation { __type(name: \"Mutation\") { fields { name } } }"}' 2>&1)

if echo "$GRAPHQL_RESPONSE" | grep -q 'createOrganization'; then
    echo "✅ PASS: createOrganization mutation exists in schema"
    echo "   GraphQL schema is up to date"
else
    echo "❌ FAIL: createOrganization mutation NOT found in schema"
    echo "   Response: $GRAPHQL_RESPONSE"
    echo "   ⚠️  Railway is running OLD CODE!"
fi
echo ""

# Test 4: Basic GraphQL Query
echo "📋 Test 4: Basic GraphQL Query Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
BASIC_QUERY=$(curl -s -X POST "$API_URL/graphql" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}' 2>&1)

if echo "$BASIC_QUERY" | grep -q '"__typename":"Query"'; then
    echo "✅ PASS: GraphQL server is responding"
    echo "   Response: $BASIC_QUERY"
else
    echo "❌ FAIL: GraphQL server not responding correctly"
    echo "   Response: $BASIC_QUERY"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     📊 SUMMARY                                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

HEALTH_OK=$(echo "$HEALTH_RESPONSE" | grep -q '"status":"OK"' && echo "yes" || echo "no")
ROOT_OK=$(echo "$ROOT_RESPONSE" | grep -q '"message":"RosterHub API Server"' && echo "yes" || echo "no")
CREATE_ORG_OK=$(echo "$GRAPHQL_RESPONSE" | grep -q 'createOrganization' && echo "yes" || echo "no")
GRAPHQL_OK=$(echo "$BASIC_QUERY" | grep -q '"__typename":"Query"' && echo "yes" || echo "no")

if [ "$HEALTH_OK" = "yes" ] && [ "$ROOT_OK" = "yes" ] && [ "$CREATE_ORG_OK" = "yes" ] && [ "$GRAPHQL_OK" = "yes" ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo ""
    echo "✅ Railway is running the LATEST code"
    echo "✅ Health endpoint working"
    echo "✅ Root endpoint working"
    echo "✅ createOrganization mutation available"
    echo "✅ GraphQL server responding"
    echo ""
    echo "👉 You can now test team creation from your frontend!"
    echo "   URL: https://roster-hub-v2-y6j2.vercel.app"
else
    echo "❌ TESTS FAILED!"
    echo ""
    echo "Railway Status:"
    echo "  Health Endpoint:        $( [ "$HEALTH_OK" = "yes" ] && echo "✅" || echo "❌" )"
    echo "  Root Endpoint:          $( [ "$ROOT_OK" = "yes" ] && echo "✅" || echo "❌" )"
    echo "  createOrganization:     $( [ "$CREATE_ORG_OK" = "yes" ] && echo "✅" || echo "❌" )"
    echo "  GraphQL Server:         $( [ "$GRAPHQL_OK" = "yes" ] && echo "✅" || echo "❌" )"
    echo ""
    echo "⚠️  RAILWAY IS RUNNING OLD CODE!"
    echo ""
    echo "📋 ACTION REQUIRED:"
    echo "   1. Go to Railway dashboard"
    echo "   2. Navigate to Deployments tab"
    echo "   3. Click the three dots menu (⋮) on latest deployment"
    echo "   4. Select 'Redeploy'"
    echo "   5. Wait ~5 minutes and run this script again"
    echo ""
    echo "📄 See RAILWAY_URGENT_ACTION.md for detailed instructions"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
