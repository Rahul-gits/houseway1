const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    required: [true, 'User role is required'],
    enum: {
      values: ['owner', 'employee', 'vendor', 'client', 'guest'],
      message: 'Role must be one of: owner, employee, vendor, client, guest',
    },
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s-()]+$/, 'Please enter a valid phone number'],
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  profileImage: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  // Role-specific fields
  employeeDetails: {
    employeeId: String,
    department: {
      type: String,
      enum: ['design', 'project-management', 'construction', 'sales', 'admin', 'finance', 'other']
    },
    position: String,
    hireDate: Date,
    skills: [String],
    certifications: [{
      name: String,
      issuedBy: String,
      issuedDate: Date,
      expiryDate: Date,
      certificateNumber: String
    }],
    specialization: [String],
    // Enhanced client management fields for employees
    clientCount: {
      type: Number,
      default: 0
    },
    averageClientSatisfaction: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5
    },
    totalProjectsManaged: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number, // Average response time in hours
      default: 24
    },
    commissionRate: {
      type: Number,
      min: [0, 'Commission rate cannot be negative'],
      max: [100, 'Commission rate cannot exceed 100'],
      default: 0
    },
    salesTarget: {
      type: Number,
      default: 0
    },
    currentSales: {
      type: Number,
      default: 0
    },
    performanceMetrics: {
      clientRetentionRate: {
        type: Number,
        min: [0, 'Retention rate cannot be negative'],
        max: [100, 'Retention rate cannot exceed 100'],
        default: 100
      },
      averageProjectValue: {
        type: Number,
        default: 0
      },
      onTimeDeliveryRate: {
        type: Number,
        min: [0, 'On-time delivery rate cannot be negative'],
        max: [100, 'On-time delivery rate cannot exceed 100'],
        default: 100
      },
      clientComplaints: {
        type: Number,
        default: 0
      }
    },
    availability: {
      status: {
        type: String,
        enum: ['available', 'busy', 'on-vacation', 'unavailable'],
        default: 'available'
      },
      workingHours: {
        monday: { start: String, end: String },
        tuesday: { start: String, end: String },
        wednesday: { start: String, end: String },
        thursday: { start: String, end: String },
        friday: { start: String, end: String },
        saturday: { start: String, end: String },
        sunday: { start: String, end: String }
      },
      timezone: {
        type: String,
        default: 'America/New_York'
      }
    },
    permissions: {
      canCreateInvoices: {
        type: Boolean,
        default: true
      },
      canApproveInvoices: {
        type: Boolean,
        default: false
      },
      canManageClients: {
        type: Boolean,
        default: true
      },
      canViewFinancialData: {
        type: Boolean,
        default: false
      },
      canScheduleMeetings: {
        type: Boolean,
        default: true
      }
    }
  },
  vendorDetails: {
    companyName: String,
    businessLicense: String,
    specialization: [String],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalProjects: {
      type: Number,
      default: 0,
    },
  },
  clientDetails: {
    projectBudget: {
      min: Number,
      max: Number
    },
    preferredStyle: {
      type: String,
      enum: ['modern', 'traditional', 'contemporary', 'minimalist', 'industrial', 'scandinavian', 'transitional']
    },
    propertyType: {
      type: String,
      enum: ['single-family', 'condo', 'townhouse', 'apartment', 'office', 'retail', 'mixed-use']
    },
    timeline: {
      preferred: {
        type: String,
        enum: ['asap', 'normal', 'flexible']
      },
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    },
    // Enhanced client communication preferences
    communicationStyle: {
      type: String,
      enum: ['formal', 'casual', 'detailed', 'brief', 'visual'],
      default: 'professional'
    },
    riskAssessment: {
      level: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
      },
      factors: [String],
      lastAssessed: Date
    },
    references: [{
      name: String,
      company: String,
      position: String,
      email: String,
      phone: String,
      relationship: String
    }],
    socialMedia: {
      linkedin: String,
      facebook: String,
      instagram: String,
      pinterest: String
    },
    preferences: {
      communicationFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'as-needed'],
        default: 'weekly'
      },
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'text', 'in-person'],
        default: 'email'
      },
      decisionMakingStyle: {
        type: String,
        enum: ['quick', 'deliberate', 'consensus', 'solo'],
        default: 'deliberate'
      },
      budgetSensitivity: {
        type: String,
        enum: ['very-sensitive', 'moderate', 'flexible'],
        default: 'moderate'
      }
    },
    // Client history and feedback
    previousProjects: [{
      projectName: String,
      projectType: String,
      budget: Number,
      duration: Number,
      satisfactionRating: {
        type: Number,
        min: 1,
        max: 5
      },
      wouldRecommend: Boolean,
      completionDate: Date,
      notes: String
    }],
    testimonials: [{
      text: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      date: Date,
      verified: {
        type: Boolean,
        default: false
      },
      project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
      }
    }]
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

// Index for better query performance (email index is already created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get user data without sensitive information
userSchema.methods.toSafeObject = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

module.exports = mongoose.model('User', userSchema);
