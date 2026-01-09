const { Schema, model } = require('mongoose');

const organizationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/,
    maxlength: 50
  },
  description: {
    type: String,
    maxlength: 500
  },
  logo: {
    type: String,
    default: ''
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true,  // Allow multiple null values
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },
  customDomain: {
    type: String,
    default: null
  },
  
  // Invitation code for joining organization
  inviteCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true,
    minlength: 6,
    maxlength: 12
  },
  
  // Branding & Settings
  settings: {
    theme: {
      primaryColor: {
        type: String,
        default: '#3B82F6' // Blue
      },
      secondaryColor: {
        type: String,
        default: '#8B5CF6' // Purple
      },
      logo: String,
      favicon: String
    },
    features: {
      enableFormations: {
        type: Boolean,
        default: true
      },
      enableChat: {
        type: Boolean,
        default: true
      },
      enablePosts: {
        type: Boolean,
        default: true
      },
      enableWeather: {
        type: Boolean,
        default: true
      },
      enableSkills: {
        type: Boolean,
        default: true
      },
      enableFeedback: {
        type: Boolean,
        default: true
      }
    },
    general: {
      timezone: {
        type: String,
        default: 'UTC'
      },
      language: {
        type: String,
        default: 'en'
      },
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY'
      }
    }
  },
  
  // Ownership & Members
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  
  // Subscription & Billing
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'cancelled', 'expired'],
      default: 'trial'
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
    },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  
  // Limits based on plan
  limits: {
    maxMembers: {
      type: Number,
      default: 20 // Free plan limit
    },
    maxGames: {
      type: Number,
      default: 50
    },
    maxStorage: {
      type: Number,
      default: 100 // MB
    }
  },
  
  // Usage tracking
  usage: {
    memberCount: {
      type: Number,
      default: 0
    },
    gameCount: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0
    }
  },
  
  // Invitation system
  invitations: [{
    code: {
      type: String,
      unique: true,
      sparse: true  // Allow multiple null values
    },
    email: String,
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    },
    expiresAt: Date,
    usedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Profile'
    },
    usedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending'
    }
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
organizationSchema.index({ slug: 1 });
organizationSchema.index({ subdomain: 1 });
organizationSchema.index({ owner: 1 });
organizationSchema.index({ 'subscription.status': 1 });
organizationSchema.index({ isActive: 1 });

// Pre-save hook to update timestamp
organizationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if organization has reached member limit
organizationSchema.methods.hasReachedMemberLimit = function() {
  return this.usage.memberCount >= this.limits.maxMembers;
};

// Method to check if organization has reached game limit
organizationSchema.methods.hasReachedGameLimit = function() {
  return this.usage.gameCount >= this.limits.maxGames;
};

// Method to check if user is admin
organizationSchema.methods.isUserAdmin = function(userId) {
  return this.owner.toString() === userId.toString() || 
         this.admins.some(admin => admin.toString() === userId.toString());
};

// Method to check if user is member
organizationSchema.methods.isUserMember = function(userId) {
  return this.members.some(member => member.toString() === userId.toString()) ||
         this.isUserAdmin(userId);
};

// Static method to generate unique invitation code
organizationSchema.statics.generateInvitationCode = function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const Organization = model('Organization', organizationSchema);

module.exports = Organization;
