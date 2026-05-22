import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Native Google Accounts OAuth callback response handler
  const handleGoogleResponse = async (response) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    const res = await loginWithGoogle(response.credential);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
    setLoading(false);
  };

  const initGoogleSDK = () => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      const signInDiv = document.getElementById('googleSignInDiv');
      if (signInDiv) {
        // Dynamically compute optimal button width to match form inputs exactly and prevent overflows
        const parentWidth = signInDiv.parentElement ? signInDiv.parentElement.clientWidth : 384;
        const buttonWidth = Math.max(200, Math.min(384, parentWidth));

        window.google.accounts.id.renderButton(
          signInDiv,
          {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            shape: 'rectangular',
            width: buttonWidth
          }
        );
      }
    }
  };

  useEffect(() => {
    const gsiScriptId = 'google-gsi-client';
    const initOrLoad = () => {
      if (window.google) {
        initGoogleSDK();
      }
    };

    if (!document.getElementById(gsiScriptId)) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.id = gsiScriptId;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initOrLoad, 100);
      };
      document.body.appendChild(script);
    } else {
      initOrLoad();
    }
  }, [otpRequired, isLogin]);

  return (
    <div className="min-h-screen w-screen relative flex items-center justify-center bg-zinc-950 px-4 py-8 overflow-hidden auth-page">
      {/* Cinematic subtle grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1.5px,transparent_1.5px),linear-gradient(to_bottom,#0f172a_1.5px,transparent_1.5px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.35] pointer-events-none" />
      
      {/* Low opacity telemetry background glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/8 blur-[130px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] rounded-full bg-violet-600/8 blur-[160px] pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-[30%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-indigo-400/3 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-xl shadow-2xl shadow-indigo-500/5 overflow-hidden min-h-[620px] z-10 animate-fade-in">
        
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
        <div className="flex flex-col justify-center p-4 md:p-8 bg-zinc-950/30 backdrop-blur-sm relative z-10 border-l border-zinc-900/50">
          <div className="w-full max-w-md mx-auto p-8 rounded-2xl border border-white/[0.06] bg-zinc-950/70 backdrop-blur-2xl shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.03)] relative overflow-hidden group/card hover:border-white/[0.12] transition-all duration-500">
            {/* Premium top border accent glow line */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-60 pointer-events-none" />
            
            {/* Soft inner card ambient highlight */}
            <div className="absolute -top-[40%] -left-[40%] w-[80%] h-[80%] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none group-hover/card:bg-indigo-500/8 transition-all duration-300" />
            
            {/* Floating subtle micro-dots for premium telemetry vibe */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
              <div className="absolute top-[20%] right-[15%] w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
              <div className="absolute bottom-[30%] left-[10%] w-1 h-1 rounded-full bg-violet-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
            </div>
            
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
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
                    Verify Your Core <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </h2>
                  <p className="text-[13px] text-zinc-400/80 mt-1.5 leading-relaxed">
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
                    <label className="block text-xs font-semibold text-zinc-400/70 uppercase tracking-wider mb-3 text-center">
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
                          className="w-12 h-14 rounded-xl border border-zinc-800/80 bg-zinc-900/40 text-center text-xl font-extrabold text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.15)] hover:border-zinc-700/65 transition-all duration-300"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-950/10 hover:shadow-indigo-500/10 active:scale-98 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    {loading ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Unlock Twin</span>
                        <Zap className="w-4 h-4 text-indigo-200 group-hover/btn:text-white transition-colors" />
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
                  <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                    {isLogin ? 'Welcome Back' : 'Get Started'}
                  </h2>
                  <p className="text-[13px] text-zinc-400/80 mt-1.5 font-normal">
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
                        <label className="block text-xs font-semibold text-zinc-400/70 uppercase tracking-wider mb-2">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500/80" />
                          <input
                            type="text"
                            placeholder="e.g. Jane Smith"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/85 hover:border-zinc-700/65 text-white placeholder-zinc-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400/70 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500/80" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/85 hover:border-zinc-700/65 text-white placeholder-zinc-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Password field */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-semibold text-zinc-400/70 uppercase tracking-wider">Password</label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setSuccessMsg('Forgot password helper: A reset request placeholder. In production, this triggers an SMTP password link.');
                          }}
                          className="text-[10px] text-zinc-500 hover:text-indigo-400 font-semibold transition-colors"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500/80" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-sm font-medium bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/85 hover:border-zinc-700/65 text-white placeholder-zinc-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300"
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
                        <label className="block text-xs font-semibold text-zinc-400/70 uppercase tracking-wider mb-2">Confirm Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500/80" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required={!isLogin}
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-sm font-medium bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/85 hover:border-zinc-700/65 text-white placeholder-zinc-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/45 shadow-[inset_0_1px_2px_rgba(255,255,255,0.03),0_4px_12px_rgba(0,0,0,0.15)] transition-all duration-300"
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
                    className="w-full py-3.5 mt-2 bg-gradient-to-r from-indigo-600 to-violet-650 hover:from-indigo-500 hover:to-violet-600 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-950/10 hover:shadow-indigo-500/10 active:scale-98 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    {loading ? (
                      <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    ) : (
                      <>
                        <span>{isLogin ? 'Sync Twin Profile' : 'Initialize Twin'}</span>
                        <Zap className="w-4 h-4 text-indigo-200 group-hover/btn:text-white transition-colors" />
                      </>
                    )}
                  </button>

                  {/* Micro telemetry status display */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-[10.5px] text-zinc-500 font-semibold tracking-wide">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>Secure telemetry sync enabled</span>
                  </div>
                </form>

                {/* Elegant separator */}
                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-850"></div>
                  </div>
                  <span className="relative px-3 bg-zinc-950/80 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Or Continue With
                  </span>
                </div>

                {/* Native Google OAuth Integration with premium styling overlay */}
                <div className="relative flex justify-center w-full h-[46px] rounded-xl overflow-hidden bg-zinc-900/60 hover:bg-zinc-900/85 border border-zinc-800/85 hover:border-zinc-700/70 shadow-lg shadow-black/10 transition-all duration-300 group/google-btn">
                  {/* Custom Styled Button Representation (visible underneath) */}
                  <div className="absolute inset-0 flex items-center justify-center gap-3 pointer-events-none">
                    {/* Google G Logo SVG */}
                    <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 0, 0)">
                        <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.48C21.68,11.83 21.56,11.4 21.35,11.1z" fill="#4285F4" />
                        <path d="M12,20.62c2.6,0 4.78,-0.86 6.38,-2.34l-3.3,-2.58c-0.91,0.61 -2.08,0.98 -3.08,0.98 -2.38,0 -4.4,-1.61 -5.12,-3.78H3.46v2.66C5.07,18.8 8.35,20.62 12,20.62z" fill="#34A853" />
                        <path d="M6.88,12.9a5.16,5.16 0 0 1 0,-3.2v-2.66H3.46a8.96,8.96 0 0 0 0,8.52L6.88,12.9z" fill="#FBBC05" />
                        <path d="M12,6.72c1.41,0 2.68,0.49 3.68,1.44l2.76,-2.76C16.76,3.88 14.58,3.38 12,3.38c-3.65,0 -6.93,1.82 -8.54,4.98l3.42,2.66C7.6,8.33 9.62,6.72 12,6.72z" fill="#EA4335" />
                      </g>
                    </svg>
                    <span className="text-sm font-medium text-zinc-300 group-hover/google-btn:text-white transition-colors">
                      Continue with Google
                    </span>
                  </div>
                  {/* Invisible real Google button overlay to securely capture click interaction */}
                  <div 
                    id="googleSignInDiv" 
                    className="absolute inset-0 w-full h-full opacity-[0.01] z-10 cursor-pointer [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:cursor-pointer"
                  />
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
