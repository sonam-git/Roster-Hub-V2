# ⚡ AWS Quick Migration Guide (3-4 Hours)

## 🎯 Goal
Migrate RosterHub to AWS with **minimal code changes** and **minimal downtime**.

## 📋 What We'll Do
1. Keep MongoDB Atlas (no migration needed)
2. Deploy backend to AWS App Runner (easiest)
3. Deploy frontend to S3 + CloudFront
4. Switch to AWS SES for email
5. (Optional) Move images to S3 later

**Total Time: 3-4 hours**  
**Difficulty: Easy**  
**Risk: Low**

---

## 🚀 Step-by-Step (Follow in Order)

### ✅ STEP 1: AWS Account Setup (15 minutes)

```bash
# 1. Create AWS Account
Go to: https://aws.amazon.com/
Click: "Create an AWS Account"
Enter: Email, password, account name
Add: Payment method (needed but won't charge much)
Verify: Phone number

# 2. Set up billing alert
AWS Console → Billing Dashboard → Budgets
Create Budget → Monthly cost budget
Set: $50 alert threshold

# 3. Create IAM admin user (DON'T use root account)
AWS Console → IAM → Users → Add User
Username: rosterhub-admin
Access type: ☑ Programmatic ☑ Console
Attach policy: AdministratorAccess
Download: credentials.csv (SAVE THIS!)

# 4. Install AWS CLI
# macOS:
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Verify:
aws --version

# 5. Configure AWS CLI
aws configure
# AWS Access Key ID: [from credentials.csv]
# AWS Secret Access Key: [from credentials.csv]
# Default region: us-east-1
# Default output format: json

# Test it works:
aws sts get-caller-identity
```

---

### ✅ STEP 2: Email Service (AWS SES) (20 minutes)

```bash
# 1. Verify sender email
aws ses verify-email-identity --email-address sherpa.sjs@gmail.com

# 2. Check your email and click verification link

# 3. Check status (should show "Success")
aws ses get-identity-verification-attributes \
    --identities sherpa.sjs@gmail.com

# 4. Request production access (initially you're in sandbox)
# Go to: https://console.aws.amazon.com/ses/
# Click: "Account Dashboard" → "Request production access"
# Fill form:
#   - Use case: Transactional
#   - Website URL: rosterhub.com
#   - Describe: "Password resets and team invitations for sports team management app"
#   - Opt in to review: Yes
# Usually approved within 24 hours
# While waiting, you can send to verified emails only
```

#### Update Backend Code for SES
```javascript
// server/schemas/resolvers.js
// Add at top:
const AWS = require('aws-sdk');

// Update transporter logic (around line 1745 in forgotPassword):
const useSES = !!process.env.AWS_SES_ENABLED;
const useSendGrid = !!process.env.SENDGRID_API_KEY;

let transporter;
if (useSES) {
  console.log('✅ Using AWS SES for email delivery');
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  transporter = nodemailer.createTransport({
    SES: new AWS.SES({ apiVersion: '2010-12-01' })
  });
} else if (useSendGrid) {
  // ... existing SendGrid code ...
} else {
  // ... existing Gmail code ...
}

// Use same transporter for both forgotPassword and sendTeamInvite
```

#### Install AWS SDK
```bash
cd server
npm install aws-sdk
```

---

### ✅ STEP 3: Backend Deployment (App Runner) (30 minutes)

```bash
# Option A: Deploy via AWS Console (EASIEST)
# ===============================================

# 1. Push your code to GitHub (if not already)
git add .
git commit -m "Prepare for AWS deployment"
git push origin main

# 2. Go to AWS App Runner Console
https://console.aws.amazon.com/apprunner/

# 3. Click "Create service"

# 4. Source: "Source code repository"

# 5. Click "Add new" to connect GitHub
#    - Authorize AWS App Runner to access your GitHub
#    - Select your repository
#    - Branch: main
#    - Click "Next"

# 6. Deployment settings:
#    - Deployment trigger: Automatic
#    - Configuration: "Configure all settings here"
#    - Runtime: Node.js 18
#    - Build command: npm install
#    - Start command: node server.js
#    - Port: 4000

# 7. Environment variables:
Click "Add environment variable" for each:

MONGODB_URI = mongodb+srv://your-connection-string
JWT_SECRET = your-jwt-secret
CLOUDINARY_CLOUD_NAME = your-cloudinary-name
CLOUDINARY_API_KEY = your-cloudinary-key
CLOUDINARY_API_SECRET = your-cloudinary-secret
GOOGLE_CLIENT_ID = your-google-client-id
FOOTBALL_DATA_KEY = your-football-api-key
AWS_SES_ENABLED = true
AWS_ACCESS_KEY_ID = [from credentials.csv]
AWS_SECRET_ACCESS_KEY = [from credentials.csv]
AWS_REGION = us-east-1
EMAIL_FROM = sherpa.sjs@gmail.com
APP_URL = https://roster-hub-v2-y6j2.vercel.app

# 8. Instance configuration:
#    - CPU: 1 vCPU
#    - Memory: 2 GB
#    - Click "Next"

# 9. Health check:
#    - Path: /graphql
#    - Interval: 10
#    - Timeout: 5
#    - Healthy threshold: 1
#    - Unhealthy threshold: 5

# 10. Auto scaling:
#     - Max concurrency: 100
#     - Min instances: 1
#     - Max instances: 5

# 11. Review and Create
#     - Service name: rosterhub-backend
#     - Click "Create & deploy"

# 12. Wait 5-10 minutes for deployment
#     - Status will show "Running" when ready
#     - Copy the service URL (e.g., https://abc123.us-east-1.awsapprunner.com)

# 13. Test GraphQL endpoint
curl https://YOUR-APP-RUNNER-URL.awsapprunner.com/graphql

# Should return GraphQL Playground or error about POST method
```

#### Option B: Deploy via AWS CLI (ADVANCED)
```bash
# Create apprunner.yaml in server directory
cat > server/apprunner.yaml <<EOF
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm install
run:
  runtime-version: 18
  command: node server.js
  network:
    port: 4000
EOF

# Create service
aws apprunner create-service \
    --service-name rosterhub-backend \
    --source-configuration file://apprunner-config.json

# Note: You'll need to create apprunner-config.json with full config
# See AWS_MIGRATION_GUIDE.md for full example
```

---

### ✅ STEP 4: Frontend Deployment (S3 + CloudFront) (45 minutes)

```bash
# 1. Create S3 bucket for frontend
aws s3 mb s3://rosterhub-frontend --region us-east-1

# 2. Enable static website hosting
aws s3 website s3://rosterhub-frontend \
    --index-document index.html \
    --error-document index.html

# 3. Make bucket public (for CloudFront)
cat > bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::rosterhub-frontend/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
    --bucket rosterhub-frontend \
    --policy file://bucket-policy.json

# 4. Update frontend to point to new backend
cd client

# Update .env or vite.config.js
# Replace old Railway URL with App Runner URL
VITE_GRAPHQL_URI=https://YOUR-APP-RUNNER-URL.awsapprunner.com/graphql
VITE_GRAPHQL_WS_URI=wss://YOUR-APP-RUNNER-URL.awsapprunner.com/graphql

# 5. Build frontend
npm run build

# 6. Upload to S3
aws s3 sync dist/ s3://rosterhub-frontend --delete

# 7. Create CloudFront distribution
aws cloudfront create-distribution \
    --origin-domain-name rosterhub-frontend.s3-website-us-east-1.amazonaws.com \
    --default-root-object index.html \
    --query 'Distribution.DomainName' \
    --output text

# This will output something like: d1234567890abc.cloudfront.net
# Save this URL!

# 8. Wait for CloudFront distribution to deploy (15-20 minutes)
# Check status:
aws cloudfront list-distributions \
    --query 'DistributionList.Items[0].Status'

# When it shows "Deployed", test it:
# Visit: https://d1234567890abc.cloudfront.net
```

#### Create Deployment Script
```bash
# deploy-frontend.sh
#!/bin/bash
set -e

echo "🔨 Building frontend..."
cd client
npm run build

echo "📦 Uploading to S3..."
aws s3 sync dist/ s3://rosterhub-frontend --delete

echo "🔄 Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[?DomainName=='rosterhub-frontend.s3-website-us-east-1.amazonaws.com']].Id" \
    --output text)

aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"

echo "✅ Frontend deployed!"
echo "Visit: https://d1234567890abc.cloudfront.net"
```

```bash
# Make it executable
chmod +x deploy-frontend.sh

# Use it:
./deploy-frontend.sh
```

---

### ✅ STEP 5: Update Frontend Backend URL (10 minutes)

```bash
cd client

# Option 1: Update .env.production
cat > .env.production <<EOF
VITE_GRAPHQL_URI=https://YOUR-APP-RUNNER-URL.awsapprunner.com/graphql
VITE_GRAPHQL_WS_URI=wss://YOUR-APP-RUNNER-URL.awsapprunner.com/graphql
EOF

# Option 2: Or update src/main.jsx or wherever API URL is configured
# Find the line that sets the GraphQL URI and update it

# Rebuild and redeploy
npm run build
aws s3 sync dist/ s3://rosterhub-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id YOUR-DISTRIBUTION-ID \
    --paths "/*"
```

---

### ✅ STEP 6: Custom Domain Setup (Optional, 30 minutes)

```bash
# 1. Create hosted zone in Route53
aws route53 create-hosted-zone \
    --name rosterhub.com \
    --caller-reference $(date +%s)

# 2. Note the nameservers from output
# Update your domain registrar to use these nameservers

# 3. Request SSL certificate
aws acm request-certificate \
    --domain-name rosterhub.com \
    --domain-name www.rosterhub.com \
    --validation-method DNS \
    --region us-east-1

# 4. Validate certificate (add DNS records shown in output)

# 5. Update CloudFront distribution to use custom domain
# (Do this via AWS Console - easier)
# CloudFront → Your distribution → Edit
# Alternate domain names: rosterhub.com, www.rosterhub.com
# SSL certificate: Select your ACM certificate

# 6. Create Route53 record pointing to CloudFront
aws route53 change-resource-record-sets \
    --hosted-zone-id Z1234567890ABC \
    --change-batch file://dns-record.json

# dns-record.json:
{
  "Changes": [{
    "Action": "CREATE",
    "ResourceRecordSet": {
      "Name": "rosterhub.com",
      "Type": "A",
      "AliasTarget": {
        "HostedZoneId": "Z2FDTNDATAQYW2",
        "DNSName": "d1234567890abc.cloudfront.net",
        "EvaluateTargetHealth": false
      }
    }
  }]
}
```

---

## 🧪 Testing Checklist

### Test Backend (App Runner)
```bash
# 1. Test health
curl https://YOUR-APP-RUNNER-URL.awsapprunner.com/graphql

# 2. Test GraphQL query
curl -X POST https://YOUR-APP-RUNNER-URL.awsapprunner.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'

# Should return: {"data":{"__typename":"Query"}}

# 3. Check logs in CloudWatch
AWS Console → CloudWatch → Log groups → /aws/apprunner/rosterhub-backend

# 4. Test email (via frontend)
# Go to frontend → Login → Forgot Password
# Enter email → Check inbox
# Should receive email from SES
```

### Test Frontend (S3 + CloudFront)
```bash
# 1. Visit CloudFront URL
https://d1234567890abc.cloudfront.net

# 2. Check browser console for errors

# 3. Test login/signup

# 4. Test profile picture upload

# 5. Test real-time features (if any)

# 6. Check CloudFront cache hit rate
AWS Console → CloudFront → Your distribution → Monitoring
```

---

## 💰 Cost Estimate (First Month)

| Service | Usage | Cost |
|---------|-------|------|
| App Runner | 2GB RAM, 1 vCPU, 720 hrs | $25 |
| S3 (Frontend) | 5GB, 10k requests | $0.50 |
| CloudFront | 100GB transfer | $8.50 |
| SES | 10k emails | $1 |
| Route53 (if used) | 1 hosted zone | $0.50 |
| CloudWatch Logs | 5GB | $2.50 |
| **Total** | | **~$38/month** |

**Plus you keep:**
- MongoDB Atlas: $57/month (or free tier)
- Cloudinary: Free tier

**Grand Total: ~$95-100/month** (similar to current)

---

## 🎯 Success Checklist

- [ ] AWS account created and configured
- [ ] SES email verified (sherpa.sjs@gmail.com)
- [ ] Backend deployed to App Runner
- [ ] Backend URL copied and saved
- [ ] Frontend built and uploaded to S3
- [ ] CloudFront distribution created
- [ ] Frontend updated with backend URL
- [ ] Custom domain configured (optional)
- [ ] Test login works
- [ ] Test signup works
- [ ] Test profile picture upload
- [ ] Test password reset email
- [ ] Test team invite email
- [ ] No errors in CloudWatch logs
- [ ] Frontend loads fast (CloudFront caching)

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check App Runner logs
AWS Console → App Runner → rosterhub-backend → Logs

# Common issues:
# - Wrong start command (should be: node server.js)
# - Missing environment variables
# - Port mismatch (should be 4000)
```

### Frontend shows errors
```bash
# Check browser console
# Common issues:
# - Wrong backend URL in .env.production
# - CORS errors (check backend CORS config)
# - Missing environment variables

# Update backend CORS (if needed)
# In server/server.js, update allowed origins:
const corsOptions = {
  origin: [
    'https://d1234567890abc.cloudfront.net',
    'https://rosterhub.com',
    'http://localhost:5173'
  ]
};
```

### Emails not sending
```bash
# Check SES console
AWS Console → SES → Account dashboard
# Make sure email is verified

# Check App Runner logs
# Look for "Using AWS SES" message

# Test SES directly
aws ses send-email \
    --from sherpa.sjs@gmail.com \
    --destination ToAddresses=test@example.com \
    --message Subject={Data="Test"},Body={Text={Data="Test email"}}
```

### High costs
```bash
# Check Cost Explorer
AWS Console → Billing → Cost Explorer

# Set up budget alerts
AWS Console → Billing → Budgets

# Common cost culprits:
# - CloudFront data transfer (use caching)
# - App Runner always running (scale down if not needed)
# - CloudWatch logs (set retention to 7 days)
```

---

## 📚 What We Kept vs Changed

### ✅ Kept (No Migration Needed)
- MongoDB Atlas database
- Cloudinary for images (for now)
- All existing code logic
- GraphQL schema
- Authentication
- Models and resolvers

### 🔄 Changed
- Backend hosting: Railway → AWS App Runner
- Frontend hosting: Vercel → S3 + CloudFront
- Email service: SendGrid → AWS SES
- Environment variables location

---

## 🚀 Next Steps

### After Migration
1. **Monitor for 24-48 hours**
   - Check CloudWatch logs
   - Monitor SES dashboard
   - Watch CloudFront metrics
   - Check costs in billing

2. **Optimize**
   - Set CloudWatch log retention (7 days)
   - Enable CloudFront caching
   - Set up auto-scaling rules
   - Configure health checks

3. **Future Improvements**
   - Migrate images to S3 (save Cloudinary costs)
   - Set up CI/CD with CodePipeline
   - Add monitoring dashboards
   - Set up alerts for errors

### Optional: Migrate Images to S3 Later
See `AWS_MIGRATION_GUIDE.md` Phase 3 for detailed steps.

---

## 📞 Support

### AWS Support Plans
- **Basic (Free):** Community forums only
- **Developer ($29/mo):** Email support, business hours
- **Business ($100/mo):** 24/7 phone + chat

### AWS Documentation
- App Runner: https://docs.aws.amazon.com/apprunner/
- S3: https://docs.aws.amazon.com/s3/
- CloudFront: https://docs.aws.amazon.com/cloudfront/
- SES: https://docs.aws.amazon.com/ses/

---

## ✨ Summary

You've successfully migrated RosterHub to AWS! 🎉

**What changed:**
- ✅ Backend on AWS App Runner (auto-scaling, managed)
- ✅ Frontend on S3 + CloudFront (fast, global CDN)
- ✅ Email via AWS SES (cheap, reliable)
- ✅ All-AWS infrastructure (easier to manage)

**What stayed the same:**
- ✅ MongoDB Atlas (no migration needed)
- ✅ All application code (minimal changes)
- ✅ User experience (same features)

**Benefits:**
- 🚀 Auto-scaling backend
- 🌍 Global CDN for frontend
- 💰 Lower email costs
- 📊 Better monitoring
- 🔒 Better security

**Total migration time:** 3-4 hours  
**Cost:** ~$95-100/month (similar to before)  
**Difficulty:** Easy  

🎉 **Congratulations!** Your app is now running on AWS!

---

**Last Updated:** January 20, 2026  
**Time to Complete:** 3-4 hours  
**Difficulty:** Easy  
**Recommended for:** Production use

🚀 **Ready to migrate? Start with Step 1!**
