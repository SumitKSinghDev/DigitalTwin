import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendOtpEmail } from '../utils/emailService.js';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';

// Initialize Google OAuth2 Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Helper to dynamically clean database tables across both MongoDB and Offline modes
 */
const performDbReset = async () => {
  if (process.env.USE_MEMORY_DB === 'true') {
    // Import fs to wipe db.json
    const fs = await import('fs');
    fs.writeFileSync('db.json', JSON.stringify({ users: [], logs: [], goals: [] }, null, 2));
  } else {
    // Wipe Mongoose models
    await User.deleteMany({});
    // Dynamically query other collections to prevent import issues if they are not loaded yet
    try {
      if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
          await collection.deleteMany({});
        }
      }
    } catch (e) {
      console.error('Error during Mongoose collection dropping:', e.message);
    }
  }
};

// @desc    Register a new user (with OTP verification)
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, avatarStyle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const emailLower = email.toLowerCase();
    const username = name || emailLower.split('@')[0];

    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      // If user exists and is already verified, prevent registration
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      // If user exists but is not verified, allow them to re-attempt registration
      // by updating their profile and generating a new verification code.
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      userExists.name = name;
      userExists.username = username;
      userExists.password = password; // pre-save hook will hash this
      userExists.otpCode = otpCode;
      userExists.otpExpires = otpExpires;
      userExists.avatarStyle = avatarStyle || userExists.avatarStyle;

      await userExists.save();

      // Dispatch OTP email
      await sendOtpEmail(emailLower, otpCode, name);

      return res.status(200).json({
        otpRequired: true,
        email: emailLower,
        message: 'A verification code has been dispatched to your email.'
      });
    }

    // Generate numeric 6-digit verification OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create unverified user
    const user = await User.create({
      name,
      username,
      email: emailLower,
      password,
      isVerified: false,
      otpCode,
      otpExpires,
      avatarStyle: avatarStyle || { colorTheme: 'indigo', styleType: 'glowing-orb' },
    });

    if (user) {
      // Dispatch OTP email
      await sendOtpEmail(emailLower, otpCode, name);

      res.status(201).json({
        otpRequired: true,
        email: emailLower,
        message: 'Registration initialized. Please verify your email with the OTP sent.'
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Please provide email and verification code' });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate OTP correctness and expiration
    if (user.otpCode !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    // Verify user and flush OTP columns
    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name || user.username,
      username: user.username || user.name,
      email: user.email,
      avatarStyle: user.avatarStyle,
      isOnboarded: user.isOnboarded,
      onboardingData: user.onboardingData,
      twinPersonality: user.twinPersonality,
      token: generateToken(user._id),
      message: 'Account successfully verified and activated!'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP code
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide email address' });
    }

    const emailLower = email.toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This account is already verified. Please log in.' });
    }

    // Generate fresh OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    // Dispatch OTP email
    await sendOtpEmail(emailLower, otpCode, user.name || user.username);

    res.status(200).json({
      success: true,
      message: 'A fresh verification code has been dispatched to your email.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const emailLower = email.toLowerCase();

    // Find by email or username
    const user = await User.findOne({
      $or: [
        { email: emailLower },
        { username: email }
      ]
    });

    if (user && (await user.matchPassword(password))) {
      // If user is registered but not verified yet, send fresh OTP and redirect to verification UI
      if (!user.isVerified) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        user.otpCode = otpCode;
        user.otpExpires = otpExpires;
        await user.save();

        // Dispatch OTP email
        await sendOtpEmail(user.email, otpCode, user.name || user.username);

        return res.status(200).json({
          otpRequired: true,
          email: user.email,
          message: 'Account is unverified. A new verification OTP code has been sent to your email.'
        });
      }

      res.json({
        _id: user._id,
        name: user.name || user.username,
        username: user.username || user.name,
        email: user.email,
        avatarStyle: user.avatarStyle,
        isOnboarded: user.isOnboarded,
        onboardingData: user.onboardingData,
        twinPersonality: user.twinPersonality,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google OAuth Auth / Sign-up
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google auth credentials are required' });
    }

    // Verify Google ID Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google credential token' });
    }

    const { email, name, sub: googleId } = payload;
    const emailLower = email.toLowerCase();

    // Check if user already exists
    let user = await User.findOne({ email: emailLower });

    if (user) {
      // If existing user is not a Google user, link their account
      if (!user.isGoogleUser) {
        user.googleId = googleId;
        user.isGoogleUser = true;
        user.isVerified = true; // Auto-verify linked Google accounts
        await user.save();
      }
    } else {
      // Auto-register new Google OAuth users (marked verified instantly)
      const usernameVal = name.replace(/\s+/g, '').toLowerCase() + Math.floor(100 + Math.random() * 900);
      user = await User.create({
        name,
        username: usernameVal,
        email: emailLower,
        isVerified: true, // Google pre-verified
        isGoogleUser: true,
        googleId,
        avatarStyle: { colorTheme: 'indigo', styleType: 'glowing-orb' },
      });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name || user.username,
      username: user.username || user.name,
      email: user.email,
      avatarStyle: user.avatarStyle,
      isOnboarded: user.isOnboarded,
      onboardingData: user.onboardingData,
      twinPersonality: user.twinPersonality,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google OAuth backend error:', error.message);
    res.status(400).json({ message: 'Google authentication failed. Please try again.' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update avatar customization style
// @route   PUT /api/auth/avatar
// @access  Private
export const updateAvatarStyle = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.avatarStyle = req.body.avatarStyle || user.avatarStyle;
      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name || updatedUser.username,
        username: updatedUser.username || updatedUser.name,
        email: updatedUser.email,
        avatarStyle: updatedUser.avatarStyle,
        isOnboarded: updatedUser.isOnboarded,
        onboardingData: updatedUser.onboardingData,
        twinPersonality: updatedUser.twinPersonality,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Wipe all platform database collections (clean dev resets)
// @route   POST /api/auth/reset-database
// @access  Public
export const resetDatabase = async (req, res) => {
  try {
    await performDbReset();
    res.status(200).json({
      success: true,
      message: 'All platform user profiles, study logs, and goal records have been wiped successfully.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit user onboarding answers & generate twin personality
// @route   PUT /api/auth/onboarding
// @access  Private
export const submitOnboarding = async (req, res) => {
  try {
    const {
      studyGoals,
      preferredStudyTiming,
      sleepTargets,
      academicInterests,
      burnoutSensitivity,
      productivityStyle
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set onboardingData
    user.onboardingData = {
      studyGoals: studyGoals || '',
      preferredStudyTiming: preferredStudyTiming || 'Night',
      sleepTargets: Number(sleepTargets || 8),
      academicInterests: academicInterests || '',
      burnoutSensitivity: burnoutSensitivity || 'Medium',
      productivityStyle: productivityStyle || 'Deep Focus Sprints'
    };

    // Calculate Twin Personality Archetype
    let archetype = "Balanced Cognitive Synthesizer";
    let strengths = [
      "Steady mid-day learning focus",
      "High resilience to multitasking friction",
      "Balanced sleep and study buffers"
    ];
    let weaknesses = [
      "Vulnerable to screen distraction drift",
      "Slow initiation momentum on complex tasks",
      "Requires explicit visual targets"
    ];

    const timing = (preferredStudyTiming || '').toLowerCase();
    const style = (productivityStyle || '').toLowerCase();
    const sensitivity = (burnoutSensitivity || '').toLowerCase();

    if (timing.includes('night') && (style.includes('deep') || style.includes('analytical'))) {
      archetype = "Night-Focused Analytical Learner";
      strengths = [
        "Elite night cognitive stamina",
        "High structural coding & problem solving flow",
        "Excellent complex math modeling"
      ];
      weaknesses = [
        "High screen fatigue trigger risk",
        "Vulnerable to sudden morning sleep crashes",
        "Delayed social recovery index"
      ];
    } else if (timing.includes('morning') && (style.includes('pomodoro') || style.includes('consistent'))) {
      archetype = "Adaptive Consistency Strategist";
      strengths = [
        "Elite early circadian focus index",
        "High habit automaticity & streak preservation",
        "Fast task prioritization recovery"
      ];
      weaknesses = [
        "Vulnerable to late afternoon cognitive drop-offs",
        "High task friction under sudden stress",
        "Rigid scheduling volatility"
      ];
    } else if (sensitivity.includes('high')) {
      archetype = "High-Intensity Sprint & Recovery Type";
      strengths = [
        "Exceptional high-pressure sprint output",
        "Creative problem solving under deadline load",
        "Intuitive logic mapping"
      ];
      weaknesses = [
        "Rapid exhaustion recovery timelines",
        "High stress correlation with sleep drop-offs",
        "Stamina volatility over 4+ hours"
      ];
    }

    user.twinPersonality = {
      archetype,
      strengths,
      weaknesses
    };

    user.isOnboarded = true;
    
    // Auto-update user's avatar colorTheme depending on archetype
    if (archetype === "Night-Focused Analytical Learner") {
      user.avatarStyle.colorTheme = "purple";
    } else if (archetype === "Adaptive Consistency Strategist") {
      user.avatarStyle.colorTheme = "indigo";
    } else if (archetype === "High-Intensity Sprint & Recovery Type") {
      user.avatarStyle.colorTheme = "amber";
    } else {
      user.avatarStyle.colorTheme = "indigo";
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name || updatedUser.username,
      username: updatedUser.username || updatedUser.name,
      email: updatedUser.email,
      avatarStyle: updatedUser.avatarStyle,
      isOnboarded: updatedUser.isOnboarded,
      onboardingData: updatedUser.onboardingData,
      twinPersonality: updatedUser.twinPersonality,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
