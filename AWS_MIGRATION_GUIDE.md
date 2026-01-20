# 🚀 RosterHub AWS Migration Guide

## 📋 Table of Contents
1. [Current Architecture](#current-architecture)
2. [Target AWS Architecture](#target-aws-architecture)
3. [Service Mapping](#service-mapping)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Cost Estimation](#cost-estimation)
6. [Deployment Scripts](#deployment-scripts)

---

## 🏗️ Current Architecture

### Current Setup (Railway + Vercel + MongoDB Atlas)
```
┌─────────────────────────────────────────────────────────┐
│                     CURRENT STACK                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vercel)                                       │
│  ├─ React + Vite                                         │
│  ├─ Tailwind CSS                                         │
│  └─ Static hosting                                       │
│                                                          │
│  Backend (Railway)                                       │
│  ├─ Node.js + Express                                    │
│  ├─ Apollo GraphQL Server                                │
│  ├─ WebSocket (GraphQL Subscriptions)                    │
│  └─ Container deployment                                 │
│                                                          │
│  Database (MongoDB Atlas)                                │
│  ├─ Managed MongoDB                                      │
│  ├─ Multi-tenant data                                    │
│  └─ Cloud backup                                         │
│                                                          │
│  Media Storage (Cloudinary)                              │
│  ├─ Profile pictures                                     │
│  ├─ Image optimization                                   │
│  └─ CDN delivery                                         │
│                                                          │
│  Email (SendGrid - if implemented)                       │
│  ├─ Transactional emails                                 │
│  ├─ Password resets                                      │
│  └─ Team invites                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ☁️ Target AWS Architecture

### Proposed AWS Setup
```
┌─────────────────────────────────────────────────────────────────┐
│                      AWS ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              FRONTEND LAYER                             │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  CloudFront (CDN)                                       │    │
│  │    └─> S3 Static Website                               │    │
│  │         ├─ React build files                           │    │
│  │         ├─ Automatic HTTPS                             │    │
│  │         └─ Global edge caching                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              LOAD BALANCER                              │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  Application Load Balancer (ALB)                        │    │
│  │    ├─ HTTPS termination                                │    │
│  │    ├─ WebSocket support                                │    │
│  │    ├─ Health checks                                    │    │
│  │    └─ Auto-scaling target                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              COMPUTE LAYER                              │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  Option 1: ECS Fargate (Recommended)                   │    │
│  │    ├─ Serverless containers                            │    │
│  │    ├─ Auto-scaling                                     │    │
│  │    ├─ No server management                             │    │
│  │    └─ Pay per use                                      │    │
│  │                                                         │    │
│  │  Option 2: EC2 Auto Scaling                            │    │
│  │    ├─ t3.small/medium instances                        │    │
│  │    ├─ Auto Scaling Group                               │    │
│  │    ├─ More control                                     │    │
│  │    └─ Reserved instances (cost savings)                │    │
│  │                                                         │    │
│  │  Option 3: App Runner (Easiest)                        │    │
│  │    ├─ Fully managed                                    │    │
│  │    ├─ Auto-deploy from GitHub                          │    │
│  │    └─ Built-in load balancing                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                         │                                        │
│                         ▼                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              DATABASE LAYER                             │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  Option 1: DocumentDB (Recommended)                    │    │
│  │    ├─ MongoDB-compatible                               │    │
│  │    ├─ Fully managed                                    │    │
│  │    ├─ Auto backups                                     │    │
│  │    ├─ Multi-AZ replication                             │    │
│  │    └─ Easy migration from MongoDB Atlas                │    │
│  │                                                         │    │
│  │  Option 2: MongoDB Atlas (Keep Current)                │    │
│  │    ├─ No migration needed                              │    │
│  │    ├─ Already working                                  │    │
│  │    └─ AWS PrivateLink available                        │    │
│  │                                                         │    │
│  │  Option 3: DynamoDB (Requires refactor)                │    │
│  │    ├─ Fully serverless                                 │    │
│  │    ├─ Pay per request                                  │    │
│  │    └─ Need to rewrite queries                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              STORAGE LAYER                              │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  S3 (Simple Storage Service)                            │    │
│  │    ├─ Profile pictures                                 │    │
│  │    ├─ Game images                                      │    │
│  │    ├─ Static assets                                    │    │
│  │    └─ CloudFront CDN integration                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              EMAIL SERVICE                              │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  SES (Simple Email Service)                             │    │
│  │    ├─ Transactional emails                             │    │
│  │    ├─ $0.10 per 1,000 emails                           │    │
│  │    ├─ Built-in bounce handling                         │    │
│  │    └─ SMTP or API                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              NETWORKING                                 │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  VPC (Virtual Private Cloud)                            │    │
│  │    ├─ Private subnets (Backend, Database)              │    │
│  │    ├─ Public subnets (Load Balancer)                   │    │
│  │    ├─ NAT Gateway (outbound traffic)                   │    │
│  │    └─ Security Groups (firewall)                       │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              MONITORING & LOGGING                       │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  CloudWatch                                             │    │
│  │    ├─ Application logs                                 │    │
│  │    ├─ Metrics & dashboards                             │    │
│  │    ├─ Alarms & notifications                           │    │
│  │    └─ Log retention                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              CI/CD                                      │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │  CodePipeline + CodeBuild                               │    │
│  │    ├─ Automated deployments                            │    │
│  │    ├─ GitHub integration                               │    │
│  │    ├─ Build & test                                     │    │
│  │    └─ Blue/green deployments                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Service Mapping

### Current → AWS Service Mapping

| Current Service | AWS Replacement | Why? |
|----------------|-----------------|------|
| **Vercel** | S3 + CloudFront | More control, lower cost, AWS ecosystem |
| **Railway** | ECS Fargate / App Runner | Scalable, managed containers |
| **MongoDB Atlas** | DocumentDB | MongoDB-compatible, AWS-native |
| **Cloudinary** | S3 + CloudFront | Native AWS, lower cost |
| **SendGrid** | SES (Simple Email Service) | Cheaper ($0.10/1k vs $15/25k), AWS-native |

### Detailed Comparison

#### Frontend Hosting
```
┌────────────────┬──────────────────┬──────────────────┐
│   Feature      │   Vercel         │   S3+CloudFront  │
├────────────────┼──────────────────┼──────────────────┤
│ Deployment     │ Git push         │ CI/CD pipeline   │
│ CDN            │ Built-in         │ CloudFront       │
│ Cost (100GB)   │ $20/mo           │ ~$5/mo           │
│ Custom domain  │ Easy             │ Route53 needed   │
│ HTTPS          │ Automatic        │ ACM (free)       │
└────────────────┴──────────────────┴──────────────────┘
```

#### Backend Hosting
```
┌────────────────┬──────────────────┬──────────────────┬──────────────────┐
│   Feature      │   Railway        │   ECS Fargate    │   App Runner     │
├────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Management     │ Fully managed    │ Semi-managed     │ Fully managed    │
│ Scaling        │ Auto             │ Auto (config)    │ Auto             │
│ Cost (2 vCPU)  │ $20-40/mo        │ ~$30/mo          │ ~$25/mo          │
│ WebSockets     │ Yes              │ Yes (ALB)        │ Yes              │
│ Container      │ Docker           │ Docker           │ Docker           │
└────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

#### Database
```
┌────────────────┬──────────────────┬──────────────────┐
│   Feature      │   MongoDB Atlas  │   DocumentDB     │
├────────────────┼──────────────────┼──────────────────┤
│ Compatibility  │ MongoDB 100%     │ MongoDB 95%      │
│ Management     │ Fully managed    │ Fully managed    │
│ Backups        │ Automatic        │ Automatic        │
│ Cost (10GB)    │ $57/mo (M10)     │ ~$50/mo          │
│ Scaling        │ Easy             │ Easy             │
│ Migration      │ N/A (current)    │ mongodump/restore│
└────────────────┴──────────────────┴──────────────────┘
```

---

## 📝 Step-by-Step Migration Plan

### Phase 1: Preparation (1-2 days)

#### 1.1 AWS Account Setup
```bash
# Create AWS account
1. Go to https://aws.amazon.com/
2. Create account (Free tier eligible for 12 months)
3. Set up billing alerts
4. Enable MFA on root account
5. Create IAM admin user (don't use root)
```

#### 1.2 Install AWS Tools
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /

# Configure AWS CLI
aws configure
# AWS Access Key ID: [Your key]
# AWS Secret Access Key: [Your secret]
# Default region: us-east-1 (or your preferred region)
# Default output format: json

# Install AWS CDK (Infrastructure as Code)
npm install -g aws-cdk

# Verify installations
aws --version
cdk --version
```

#### 1.3 Choose Your Compute Strategy

**Option A: App Runner (Easiest, Recommended for Start)**
- ✅ Simplest setup
- ✅ Auto-deploy from GitHub
- ✅ Built-in load balancing
- ⚠️ Less control than ECS/EC2

**Option B: ECS Fargate (Scalable, Recommended for Production)**
- ✅ More control
- ✅ Better auto-scaling
- ✅ VPC networking
- ⚠️ More setup required

**Option C: EC2 (Most Control, Higher Maintenance)**
- ✅ Full control
- ✅ Can use reserved instances (cost savings)
- ⚠️ Need to manage servers
- ⚠️ More DevOps work

---

### Phase 2: Database Migration (2-4 hours)

#### Option A: Keep MongoDB Atlas (Recommended for Fastest Migration)
```javascript
// No code changes needed!
// Just update connection string in AWS environment variables

// Current connection string (Railway)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/rosterhub

// Same connection string works in AWS!
// Benefits:
// ✅ Zero downtime
// ✅ No data migration
// ✅ No schema changes
// ✅ Keep current backups
```

#### Option B: Migrate to DocumentDB (AWS-Native)
```bash
# Step 1: Create DocumentDB cluster
aws docdb create-db-cluster \
    --db-cluster-identifier rosterhub-db \
    --engine docdb \
    --master-username admin \
    --master-user-password YourSecurePassword123! \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-subnet-group-name default

# Step 2: Create DocumentDB instance
aws docdb create-db-instance \
    --db-instance-identifier rosterhub-db-instance \
    --db-instance-class db.t3.medium \
    --engine docdb \
    --db-cluster-identifier rosterhub-db

# Step 3: Dump existing MongoDB data
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/rosterhub" --out=/tmp/dump

# Step 4: Restore to DocumentDB
mongorestore --host rosterhub-db.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017 \
    --username admin \
    --password YourSecurePassword123! \
    --ssl \
    --sslCAFile rds-combined-ca-bundle.pem \
    /tmp/dump
```

**DocumentDB Connection String:**
```javascript
// Update in your .env
MONGODB_URI=mongodb://admin:password@rosterhub-db.cluster-xxxxx.us-east-1.docdb.amazonaws.com:27017/rosterhub?tls=true&tlsCAFile=rds-combined-ca-bundle.pem&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
```

---

### Phase 3: Storage Migration (S3 for Images) (1-2 hours)

#### 3.1 Create S3 Buckets
```bash
# Create bucket for profile pictures
aws s3 mb s3://rosterhub-profile-pictures --region us-east-1

# Create bucket for static assets
aws s3 mb s3://rosterhub-static-assets --region us-east-1

# Enable versioning (optional but recommended)
aws s3api put-bucket-versioning \
    --bucket rosterhub-profile-pictures \
    --versioning-configuration Status=Enabled

# Set up CORS for S3
cat > cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors \
    --bucket rosterhub-profile-pictures \
    --cors-configuration file://cors.json
```

#### 3.2 Set Up CloudFront CDN
```bash
# Create CloudFront distribution for S3
aws cloudfront create-distribution \
    --origin-domain-name rosterhub-profile-pictures.s3.amazonaws.com \
    --default-root-object index.html
```

#### 3.3 Update Code to Use S3 Instead of Cloudinary
```javascript
// server/utils/s3Upload.js (NEW FILE)
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

async function uploadToS3(base64Image, folder = 'profiles') {
  // Convert base64 to buffer
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  
  // Generate unique filename
  const filename = `${folder}/${uuidv4()}.jpg`;
  
  // Upload to S3
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read' // Or use CloudFront signed URLs for private
  };
  
  const result = await s3.upload(params).promise();
  return result.Location; // Returns public URL
}

async function deleteFromS3(fileUrl) {
  // Extract key from URL
  const key = fileUrl.split('.amazonaws.com/')[1];
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  };
  
  await s3.deleteObject(params).promise();
}

module.exports = { uploadToS3, deleteFromS3 };
```

#### 3.4 Update Resolver to Use S3
```javascript
// server/schemas/resolvers.js
// Replace cloudinary import with S3
const { uploadToS3, deleteFromS3 } = require('../utils/s3Upload');

// In uploadProfilePic mutation:
uploadProfilePic: async (_, { profileId, profilePic }, context) => {
  if (!context.user) {
    throw new AuthenticationError('You need to be logged in');
  }

  try {
    let imageUrl = null;
    if (profilePic) {
      // Use S3 instead of Cloudinary
      imageUrl = await uploadToS3(profilePic, 'profiles');
    }

    const profile = await Profile.findById(profileId);
    if (!profile) {
      throw new Error('Profile not found!');
    }

    // Delete old image from S3 if exists
    if (profile.profilePic && profile.profilePic.includes('amazonaws.com')) {
      await deleteFromS3(profile.profilePic);
    }

    profile.profilePic = imageUrl;
    await profile.save();

    return profile;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload profile picture');
  }
},
```

#### 3.5 Migrate Existing Cloudinary Images to S3 (Optional)
```javascript
// migration/cloudinaryToS3.js
const axios = require('axios');
const AWS = require('aws-sdk');
const Profile = require('../models/Profile');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

async function migrateImages() {
  const profiles = await Profile.find({ profilePic: { $exists: true, $ne: null } });
  
  for (const profile of profiles) {
    if (profile.profilePic.includes('cloudinary.com')) {
      try {
        // Download image from Cloudinary
        const response = await axios.get(profile.profilePic, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        
        // Upload to S3
        const filename = `profiles/${profile._id}.jpg`;
        const params = {
          Bucket: 'rosterhub-profile-pictures',
          Key: filename,
          Body: buffer,
          ContentType: 'image/jpeg',
          ACL: 'public-read'
        };
        
        const result = await s3.upload(params).promise();
        
        // Update profile with new S3 URL
        profile.profilePic = result.Location;
        await profile.save();
        
        console.log(`✅ Migrated ${profile.name}'s profile picture`);
      } catch (error) {
        console.error(`❌ Failed to migrate ${profile.name}'s image:`, error);
      }
    }
  }
  
  console.log('Migration complete!');
}

migrateImages();
```

---

### Phase 4: Email Service (AWS SES) (30 minutes)

#### 4.1 Set Up SES
```bash
# Verify sender email
aws ses verify-email-identity --email-address sherpa.sjs@gmail.com

# Check verification status
aws ses get-identity-verification-attributes --identities sherpa.sjs@gmail.com

# Request production access (initially in sandbox mode)
# Go to: https://console.aws.amazon.com/ses/
# Click "Account Dashboard" → "Request production access"
```

#### 4.2 Update Email Code for SES
```javascript
// server/schemas/resolvers.js
// Update email transporter logic

const useSES = !!process.env.AWS_SES_ENABLED;
const useSendGrid = !!process.env.SENDGRID_API_KEY;

let transporter;
if (useSES) {
  // AWS SES (Production)
  const aws = require('aws-sdk');
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  
  transporter = nodemailer.createTransport({
    SES: new aws.SES({ apiVersion: '2010-12-01' })
  });
  console.log('✅ Using AWS SES for email delivery');
} else if (useSendGrid) {
  // SendGrid (Alternative)
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY
    }
  });
  console.log('✅ Using SendGrid for email delivery');
} else {
  // Gmail (Local dev)
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  console.log('⚠️ Using Gmail for local development');
}
```

#### 4.3 SES Environment Variables
```bash
# Add to your AWS deployment
AWS_SES_ENABLED=true
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
EMAIL_FROM=sherpa.sjs@gmail.com
```

---

### Phase 5: Frontend Deployment (S3 + CloudFront) (1 hour)

#### 5.1 Build and Deploy Frontend to S3
```bash
# Build the frontend
cd client
npm run build

# Upload to S3
aws s3 sync dist/ s3://rosterhub-frontend --delete

# Set bucket for static website hosting
aws s3 website s3://rosterhub-frontend \
    --index-document index.html \
    --error-document index.html
```

#### 5.2 Create CloudFront Distribution
```bash
# Create distribution for frontend
aws cloudfront create-distribution \
    --origin-domain-name rosterhub-frontend.s3-website-us-east-1.amazonaws.com \
    --default-root-object index.html \
    --viewer-protocol-policy redirect-to-https
```

#### 5.3 Automated Deployment Script
```bash
# deploy-frontend.sh
#!/bin/bash

echo "Building frontend..."
cd client
npm run build

echo "Uploading to S3..."
aws s3 sync dist/ s3://rosterhub-frontend --delete

echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation \
    --distribution-id E1234567890ABC \
    --paths "/*"

echo "✅ Frontend deployed!"
```

---

### Phase 6: Backend Deployment (Choose One)

#### Option A: AWS App Runner (Easiest) ⭐ RECOMMENDED FOR START

```bash
# Step 1: Push your code to GitHub (already done)

# Step 2: Create App Runner service via AWS Console
# Go to: https://console.aws.amazon.com/apprunner/
# 1. Click "Create service"
# 2. Source: "Source code repository"
# 3. Connect to GitHub
# 4. Select rosterhub-copy/server
# 5. Runtime: Node.js 18
# 6. Build command: npm install
# 7. Start command: node server.js
# 8. Port: 4000
# 9. Add environment variables:
#    - MONGODB_URI
#    - JWT_SECRET
#    - AWS_ACCESS_KEY_ID
#    - AWS_SECRET_ACCESS_KEY
#    - etc.
# 10. Click "Create & Deploy"

# Or use AWS CLI:
aws apprunner create-service \
    --service-name rosterhub-backend \
    --source-configuration '{
        "CodeRepository": {
            "RepositoryUrl": "https://github.com/yourusername/rosterhub",
            "SourceCodeVersion": {
                "Type": "BRANCH",
                "Value": "main"
            },
            "CodeConfiguration": {
                "ConfigurationSource": "API",
                "CodeConfigurationValues": {
                    "Runtime": "NODEJS_18",
                    "BuildCommand": "npm install",
                    "StartCommand": "node server.js",
                    "Port": "4000"
                }
            }
        }
    }' \
    --instance-configuration '{
        "Cpu": "1 vCPU",
        "Memory": "2 GB"
    }'
```

**App Runner Benefits:**
- ✅ Auto-deploy on git push
- ✅ Built-in load balancing
- ✅ HTTPS automatic
- ✅ Auto-scaling
- ✅ ~$25/month for small app

#### Option B: ECS Fargate (More Control)

```bash
# Step 1: Create ECR repository
aws ecr create-repository --repository-name rosterhub-backend

# Step 2: Build and push Docker image
cd server
docker build -t rosterhub-backend .

# Tag and push
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag rosterhub-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/rosterhub-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/rosterhub-backend:latest

# Step 3: Create ECS cluster
aws ecs create-cluster --cluster-name rosterhub-cluster

# Step 4: Create task definition
# (See ECS_DEPLOYMENT.md for full task definition JSON)

# Step 5: Create service
aws ecs create-service \
    --cluster rosterhub-cluster \
    --service-name rosterhub-service \
    --task-definition rosterhub-backend \
    --desired-count 2 \
    --launch-type FARGATE \
    --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=rosterhub-backend,containerPort=4000
```

#### Option C: EC2 (Traditional)

```bash
# Step 1: Launch EC2 instance
aws ec2 run-instances \
    --image-id ami-0c55b159cbfafe1f0 \  # Amazon Linux 2
    --instance-type t3.small \
    --key-name your-key-pair \
    --security-group-ids sg-xxxxxx \
    --subnet-id subnet-xxxxxx \
    --user-data file://startup-script.sh

# Step 2: SSH and deploy
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Clone and start app
git clone https://github.com/yourusername/rosterhub.git
cd rosterhub/server
npm install
node server.js

# Set up PM2 for process management
sudo npm install -g pm2
pm2 start server.js --name rosterhub-backend
pm2 startup
pm2 save
```

---

## 💰 Cost Estimation

### Monthly Cost Breakdown (Low Traffic)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **CloudFront** | 100GB transfer | $8.50 |
| **S3 (Frontend)** | 5GB storage, 10k requests | $0.50 |
| **S3 (Images)** | 50GB storage, 100k requests | $1.50 |
| **App Runner** | 2GB RAM, 1 vCPU | $25.00 |
| **DocumentDB** | db.t3.medium | $50.00 |
| **SES** | 10k emails | $1.00 |
| **Route53** | Hosted zone + queries | $1.00 |
| **CloudWatch** | Basic logging | $5.00 |
| **Data Transfer** | Outbound | $9.00 |
| **TOTAL** | | **~$101/month** |

### Cost Comparison

| Platform | Current (Railway + Vercel) | AWS (Optimized) |
|----------|---------------------------|-----------------|
| Frontend | Vercel: $20 | S3+CloudFront: $9 |
| Backend | Railway: $20-40 | App Runner: $25 |
| Database | MongoDB Atlas: $57 | Keep Atlas: $57 |
| Storage | Cloudinary: Free tier | S3: $2 |
| Email | SendGrid: Free tier | SES: $1 |
| **Total** | **~$97-117/mo** | **~$94/mo** |

### Cost Optimization Tips
- Use AWS Free Tier (first 12 months)
- Reserve EC2 instances (if using EC2) - 30-60% savings
- Use S3 Intelligent-Tiering for images
- Keep MongoDB Atlas if happy with it (no migration cost)
- Use CloudWatch Logs Insights sparingly

---

## 📦 Required Package Updates

### Add AWS SDK to Backend
```bash
cd server
npm install aws-sdk uuid
```

### Update package.json
```json
{
  "dependencies": {
    "aws-sdk": "^2.1500.0",
    "uuid": "^9.0.0"
  }
}
```

---

## 🔐 Security Best Practices

### 1. Use IAM Roles (Not Access Keys)
```bash
# Create IAM role for App Runner/ECS
aws iam create-role \
    --role-name RosterHubBackendRole \
    --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
    --role-name RosterHubBackendRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

aws iam attach-role-policy \
    --role-name RosterHubBackendRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonSESFullAccess
```

### 2. Use AWS Secrets Manager for Sensitive Data
```bash
# Store MongoDB connection string
aws secretsmanager create-secret \
    --name rosterhub/mongodb \
    --secret-string "mongodb+srv://..."

# Store JWT secret
aws secretsmanager create-secret \
    --name rosterhub/jwt-secret \
    --secret-string "your-jwt-secret"

# Retrieve in code
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return data.SecretString;
}
```

### 3. Enable VPC for Database
```bash
# Put DocumentDB in private subnet
# Only accessible from App Runner/ECS
# Use VPC endpoints for S3 access
```

---

## 📋 Migration Checklist

### Pre-Migration
- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] Billing alerts set up
- [ ] IAM admin user created
- [ ] Backup current data from MongoDB Atlas

### Database
- [ ] Choose: Keep MongoDB Atlas OR Migrate to DocumentDB
- [ ] If DocumentDB: Create cluster and instance
- [ ] If DocumentDB: Migrate data with mongodump/restore
- [ ] Update connection string in environment variables
- [ ] Test database connection

### Storage
- [ ] Create S3 buckets (images, static files)
- [ ] Set up CORS on S3 buckets
- [ ] Create CloudFront distributions
- [ ] Update code to use S3 upload function
- [ ] Migrate existing Cloudinary images (optional)
- [ ] Test image upload/retrieval

### Email
- [ ] Verify sender email in SES
- [ ] Request production access if needed
- [ ] Update code to use SES transporter
- [ ] Test password reset email
- [ ] Test team invite email

### Frontend
- [ ] Create S3 bucket for frontend
- [ ] Build frontend (`npm run build`)
- [ ] Upload to S3
- [ ] Create CloudFront distribution
- [ ] Set up custom domain (Route53)
- [ ] Test frontend loads correctly

### Backend
- [ ] Choose deployment method (App Runner/ECS/EC2)
- [ ] Set up chosen service
- [ ] Add all environment variables
- [ ] Deploy backend code
- [ ] Test GraphQL API
- [ ] Test WebSocket connections
- [ ] Verify logs in CloudWatch

### Testing
- [ ] Test user signup
- [ ] Test user login
- [ ] Test profile picture upload
- [ ] Test password reset email
- [ ] Test team invites
- [ ] Test game creation
- [ ] Test real-time features (chat, subscriptions)
- [ ] Load test with multiple users

### DNS & Domain
- [ ] Point domain to CloudFront distribution
- [ ] Update CORS allowed origins
- [ ] Test with production domain

### Monitoring
- [ ] Set up CloudWatch dashboards
- [ ] Create alarms for errors
- [ ] Enable X-Ray tracing (optional)
- [ ] Set up SNS notifications

### Post-Migration
- [ ] Monitor for 24-48 hours
- [ ] Check CloudWatch logs for errors
- [ ] Verify email delivery in SES dashboard
- [ ] Check S3 costs
- [ ] Optimize based on usage patterns
- [ ] Document the new architecture
- [ ] Update team on new AWS setup

---

## 🚀 Quick Start Migration (Minimal Changes)

If you want to migrate with **minimal code changes**:

### 1. Keep MongoDB Atlas (No migration)
```bash
# Just use existing connection string
MONGODB_URI=mongodb+srv://...
```

### 2. Use App Runner for Backend (Easiest deployment)
```bash
# One-click deploy from GitHub
# Add environment variables in console
```

### 3. Keep Cloudinary for Now (Migrate to S3 later)
```bash
# No code changes needed
# Migrate to S3 when ready
```

### 4. Use SES for Email (Simple update)
```javascript
// Add AWS SES transporter (already shown above)
// Just set AWS_SES_ENABLED=true
```

### 5. Use S3 + CloudFront for Frontend
```bash
# Build and upload
npm run build
aws s3 sync dist/ s3://rosterhub-frontend
```

**Total migration time: 2-3 hours**  
**Minimal code changes**  
**Keep what works, migrate what matters**

---

## 📞 Support & Resources

### AWS Documentation
- **App Runner:** https://docs.aws.amazon.com/apprunner/
- **S3:** https://docs.aws.amazon.com/s3/
- **CloudFront:** https://docs.aws.amazon.com/cloudfront/
- **DocumentDB:** https://docs.aws.amazon.com/documentdb/
- **SES:** https://docs.aws.amazon.com/ses/

### AWS Support Plans
- **Basic:** Free (forums only)
- **Developer:** $29/mo (business hours email)
- **Business:** $100/mo (24/7 phone + chat)

### Cost Management
- **AWS Cost Explorer:** Track spending
- **AWS Budgets:** Set spending alerts
- **AWS Free Tier:** Monitor usage

---

## 🎯 Next Steps

1. **Read this guide thoroughly**
2. **Choose your migration strategy:**
   - Quick (App Runner + Keep Atlas) - 3 hours
   - Full (ECS + DocumentDB + S3) - 1-2 days
3. **Start with Phase 1 (AWS setup)**
4. **Test each phase before moving to next**
5. **Document any issues or customizations**

**Ready to migrate?** Start with `AWS_QUICK_MIGRATION.md` for a fast-track guide!

---

**Last Updated:** January 20, 2026  
**Estimated Total Migration Time:** 1-2 days (full) or 3-4 hours (quick)  
**Difficulty:** Medium  
**Cost:** ~$100/month (similar to current)

🚀 **Let's move to AWS!**
