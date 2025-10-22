import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
function LoginForm({ setUsername }) {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  // stages: start -> methods -> otp or password
  const [stage, setStage] = useState('start');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate=useNavigate();

  const authBase = "http://localhost:5000/authroutes";
  const otpBase = "http://localhost:5000/otproutes";

  const handleContinue = async (e) => {
    e.preventDefault();
    // After first continue, reveal methods selection
    setStage('methods');
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${otpBase}/login-otp`, { identifier: emailOrMobile, otp });
      if (res.data.token && res.data.user) {
        const userData = { ...res.data.user, token: res.data.token };
        dispatch(setUser(userData));
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setUsername(userData.username);
        setEmailOrMobile("");
        setPassword("");
        setOtp("");
        setStage('start');
        // If admin, go to vendor dashboard; else go home
        if (userData.role === 'admin'|| userData.user?.role === 'admin') {
          navigate("/vendor/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!emailOrMobile) {
      alert('Please enter email or mobile number');
      return;
    }
    console.log('Sending OTP to:', emailOrMobile);
    console.log('API URL:', `${otpBase}/send-otp`);
    setLoading(true);
    try {
      const res = await axios.post(`${otpBase}/send-otp`, { identifier: emailOrMobile });
      console.log('OTP response:', res.data);
      alert(res.data?.message || 'OTP sent');
      setStage('otp');
    } catch (err) {
      console.error('OTP send error:', err);
      console.error('Error response:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${authBase}/login`, { identifier: emailOrMobile, password, mode: 'password' });
      if (res.data.token && res.data.user) {
        const userData = { ...res.data.user, token: res.data.token };
        dispatch(setUser(userData));
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setUsername(userData.username);
        setEmailOrMobile("");
        setPassword("");
        setOtp("");
        setStage('start');
        if ( userData.role === 'admin' || userData.user?.role === 'admin') {
          navigate("/vendor/dashboard");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form>
        <div>
          <div className="login-main-header">Login / Sign up on Snapdeal</div>
          <div className="login-subheader">
            Please provide your Mobile Number or Email to Login / Sign Up
          </div>
          <input
            className="holder"
            type="text"
            value={emailOrMobile}
            onChange={(e) => setEmailOrMobile(e.target.value)}
            required
            placeholder="Mobile Number / Email"
          />
        </div>
        {stage === 'start' && (
          <button type="button" className="Continue-btn" onClick={handleContinue} disabled={loading || !emailOrMobile.trim()}>
            {loading ? 'Please wait...' : 'CONTINUE'}
          </button>
        )}

        {stage === 'methods' && (
          <div style={{ display:'flex', gap:8, margin:'8px 0' }}>
            <button type="button" className="Continue-btn" onClick={handleSendOtp} disabled={loading || !emailOrMobile.trim()}>
              Use OTP
            </button>
            <button type="button" className="Continue-btn" onClick={()=>setStage('password')}>
              Login with Password
            </button>
          </div>
        )}

        {stage === 'password' && (
          <>
            <input
              className="holder"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
            <button type="button" className="login-btn" onClick={handlePasswordLogin} disabled={loading || !password}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </>
        )}

        {stage === 'otp' && (
          <>
            <div>
              <input
                className="otp-input"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter OTP"
              />
            </div>
            <button type="button" className="login-btn" onClick={handleVerifyOtp} disabled={loading || !otp}>
              {loading ? 'Verifying...' : 'Login'}
            </button>
            <button type="button" className="Continue-btn" onClick={handleSendOtp} disabled={loading} style={{marginTop: '8px'}}>
              Resend OTP
            </button>
          </>
        )}
      </form>
    </div>
  );
}

export default LoginForm;
