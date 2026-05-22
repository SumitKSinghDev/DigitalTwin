import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '../components/Layout/Logo.jsx';
import { 
  Mail, 
  Lock, 
  User, 
  Zap,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [otpRequired, setOtpRequired] = useState(false);
  
  // Input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Segmented OTP Code Digits
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef([]);

  // Visibility and loading states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  
  const statusMessages = [
    "Analyzing productivity telemetry...",
    "Behavioral core synchronized successfully.",
    "Twin profile calibrated.",
    "Syncing behavioral intelligence modules..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusMessages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const { login, register, verifyOtp, resendOtp, loginWithGoogle } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active countdown timer effect for OTP resending
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Clean up localStorage and Google instances on mount to prevent auth button double-click errors
  useEffect(() => {
    localStorage.removeItem('student_twin_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (window.google && window.google.accounts && window.google.accounts.id) {
      try {
        window.google.accounts.id.cancel();
      } catch (err) {
        console.warn('Google Account sign out cancel error on mount:', err);
      }
    }
  }, []);

  // Handle segmented OTP input changes and auto-focus shifting
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // only keep the last character typed
    setOtpDigits(newDigits);

    // Auto-focus next cell
    if (value !== '' && index < 5) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  // Backspace key detection for deletion backtrack
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otpDigits[index] === '' && index > 0) {
        otpInputsRef.current[index - 1].focus();
      }
    }
  };

  // Paste handler for fast copying
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const chars = pastedData.split('');
      setOtpDigits(chars);
      otpInputsRef.current[5].focus();
    }
  };

  // Credentials Submission handler (Login / Signup)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        if (res.otpRequired) {
          setOtpRequired(true);
          setEmail(res.email);
          setCountdown(60);
          setSuccessMsg('Account is unverified. A new authorization code has been sent.');
        } else {
          navigate('/');
        }
      } else {
        setErrorMsg(res.message);
      }
    } else {
      if (!name) {
        setErrorMsg('Please specify your name');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        setLoading(false);
        return;
      }
      const res = await register(name, email, password);
      if (res.success) {
        if (res.otpRequired) {
          setOtpRequired(true);
          setEmail(res.email);
          setCountdown(60);
          setSuccessMsg('A 6-digit authorization code has been sent to your email.');
        } else {
          navigate('/');
        }
      } else {
        setErrorMsg(res.message);
      }
    }
    setLoading(false);
  };

  // OTP Verification Submission
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const fullOtp = otpDigits.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit code.');
      setLoading(false);
      return;
    }

    const res = await verifyOtp(email, fullOtp);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  // Code Resending Trigger
  const handleResendCode = async () => {
    if (countdown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await resendOtp(email);
    if (res.success) {
      setSuccessMsg(res.message);
      setCountdown(60);
      setOtpDigits(['', '', '', '', '', '']);
      if (otpInputsRef.current[0]) otpInputsRef.current[0].focus();
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  // Google Sign-In Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await loginWithGoogle(credentialResponse.credential);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-screen relative flex items-center justify-center bg-background px-4 py-8 overflow-hidden auth-page">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/10 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 overflow-hidden min-h-[620px] z-10 animate-fade-in">
        
        {/* Left Side: Stunning Brand & Teaser */}
        <div className="relative hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-zinc-950 border-r border-zinc-900/60 overflow-hidden">
          {/* Drifting glow */}
          <div className="absolute top-1/4 left-1/4 w-[150px] h-[150px] rounded-full bg-indigo-600/10 blur-[40px]" />
          
          {/* Floating AI Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => {
              const size = i % 2 === 0 ? 3 : 5;
              const initialX = [15, 45, 75, 25, 85, 60][i];
              const initialY = [25, 75, 40, 85, 15, 60][i];
              return (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${initialX}%`,
                    top: `${initialY}%`,
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    opacity: 0.15,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    x: [0, i % 2 === 0 ? 15 : -15, 0],
                    opacity: [0.08, 0.25, 0.08],
                  }}
                  transition={{
                    duration: 10 + i * 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </div>

          {/* Top Header */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Logo className="w-9 h-9" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-widest text-zinc-200">STUDENT TWIN</span>
              <p className="text-[9px] text-zinc-500 font-semibold tracking-wider uppercase">Virtual Intelligent System</p>
            </div>
          </div>

          {/* Center visual: Interactive mock core */}
          <div className="relative my-8">
            {/* Ambient glow breathing */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.12, 1],
                  opacity: [0.35, 0.55, 0.35]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 6,
                  ease: "easeInOut"
                }}
                className="w-[180px] h-[180px] rounded-full bg-indigo-500/15 blur-[45px] pointer-events-none"
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative p-6 glass-panel border border-zinc-850 bg-zinc-950/45 backdrop-blur-md rounded-2xl shadow-xl max-w-[320px] mx-auto"
            >
              {/* Decorative floating Zap icon */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -top-3 -right-3 p-2 bg-indigo-600 border border-indigo-400/30 rounded-lg text-white shadow-lg shadow-indigo-600/30"
              >
                <Zap className="w-4 h-4" />
              </motion.div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping" />
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Behavioral Sync Engaged</span>
              </div>
              
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Intelligence Calibration</h3>
              <p className="text-[11px] text-zinc-500 mb-4">Processing core student learning profiles</p>
              
              {/* Fake mini graphs */}
              <div className="flex items-end gap-1.5 h-16 mb-4">
                {[45, 60, 50, 75, 90, 85, 98].map((h, i) => {
                  const animatedHeights = [
                    `${h}%`,
                    `${Math.max(20, Math.min(100, h + (i % 2 === 0 ? 8 : -8)))}%`,
                    `${Math.max(20, Math.min(100, h + (i % 2 === 0 ? -6 : 6)))}%`,
                    `${h}%`
                  ];
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: animatedHeights }}
                      transition={{ 
                        height: {
                          repeat: Infinity, 
                          duration: 5 + i * 0.4, 
                          ease: "easeInOut" 
                        },
                        delay: i * 0.1 
                      }}
                      className={`flex-1 rounded-t-sm ${i === 6 ? 'bg-indigo-500 shadow-md shadow-indigo-500/50' : 'bg-zinc-800'}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px]">
                <span className="text-zinc-500 font-medium">Neural Engine Status</span>
                <span className="text-indigo-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-indigo-400" /> Active Sync
                </span>
              </div>
            </motion.div>

            {/* Micro status ticker under card */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={statusIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.5 }}
                  className="text-[10px] text-zinc-500 font-semibold tracking-wide"
                >
                  {statusMessages[statusIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom text */}
          <div className="space-y-3">
            <h2 className="text-xl font-extrabold tracking-tight text-zinc-100 leading-tight">
              Analyze Your Behavioral Blueprint
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Track focus patterns, monitor burnout signals, and build an AI-powered behavioral profile tailored to your learning habits.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Forms State Machine */}
        <div className="flex flex-col justify-center p-8 md:p-12 bg-zinc-950">
          <div className="w-full max-w-sm mx-auto">
            
            {/* 1. OTP Verification Form View */}
            {otpRequired ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Back Button */}
                <button
                  onClick={() => {
                    setOtpRequired(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-300 transition-colors mb-6 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Back to Registration
                </button>

                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2 flex items-center gap-2">
                    Verify Your Core <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    A secure 6-digit authorization passcode has been dispatched to your email address:
                    <span className="block font-bold text-indigo-400 mt-1 select-all">{email}</span>
                  </p>
                </div>

                {errorMsg && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium">
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {/* Segmented OTP input cells */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-center">
                      Verification Code
                    </label>
                    
                    <div 
                      className="flex gap-2 justify-center" 
                      onPaste={handleOtpPaste}
                    >
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputsRef.current[idx] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                          className="w-12 h-14 rounded-xl border border-zinc-800 bg-zinc-900/60 text-center text-xl font-extrabold text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Unlock Twin</span>
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Resend Action Area */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Resend authorization code in <span className="font-bold text-zinc-300">{countdown}s</span></span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-xs font-bold text-indigo-400 hover:underline hover:text-indigo-300 active:scale-95 transition-all"
                      >
                        Resend Verification Code
                      </button>
                    )}
                  </div>

                </form>
              </motion.div>
            ) : (
              /* 2. Login / Signup Form Views */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {isLogin ? 'Access your behavioral analytics dashboard.' : 'Initialize your personalized AI learning twin.'}
                  </p>
                </div>

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-medium"
                  >
                    {errorMsg}
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 font-medium"
                  >
                    {successMsg}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name field (for Signup only) */}
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type="text"
                            placeholder="e.g. Jane Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-medium bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      {isLogin ? 'Email Address' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-medium bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setSuccessMsg('Forgot password helper: A reset request placeholder. In production, this triggers an SMTP password link.');
                          }}
                          className="text-[10px] text-zinc-500 hover:text-indigo-400 hover:underline font-bold"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm glass-input font-medium bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password field (for Signup only) */}
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={!isLogin}
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm glass-input font-medium bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-650 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 active:scale-98 transition-all duration-150 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>{isLogin ? 'Sync Twin Profile' : 'Initialize Twin'}</span>
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Elegant separator */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-900"></div>
                  </div>
                  <span className="relative px-3 bg-zinc-950 text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">
                    Or Continue With
                  </span>
                </div>

                {/* Customized Premium Dark Google Auth Button with hidden GoogleLogin capture layer */}
                <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-[#0A0C10] hover:bg-[#0F1116] hover:border-zinc-700 transition-all duration-200 shadow-md group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Visual Premium Dark Button */}
                  <div className="w-full py-3.5 flex items-center justify-center gap-2.5 text-zinc-300 font-bold text-sm select-none pointer-events-none">
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.1-.23-.19-.48-.28-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sync with Google</span>
                  </div>

                  {/* Fully transparent Google Login container that captures clicks */}
                  <div className="absolute inset-0 opacity-0 z-20 cursor-pointer overflow-hidden scale-110 flex items-center justify-center [&_*]:w-full [&_*]:h-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setErrorMsg('Google OAuth authentication failed. Please try again.');
                      }}
                      theme="dark"
                      shape="circle"
                      size="large"
                      width="380px"
                    />
                  </div>
                </div>

                {/* Switch View Toggle Trigger */}
                <div className="mt-8 text-center text-xs">
                  <span className="text-zinc-500">
                    {isLogin ? "Don't have an initialized core? " : "Already verified? "}
                  </span>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrorMsg('');
                      setSuccessMsg('');
                      setName('');
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-indigo-400 hover:underline font-bold hover:text-indigo-300 transition-colors"
                  >
                    {isLogin ? 'Create Account' : 'Login Here'}
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Auth;
