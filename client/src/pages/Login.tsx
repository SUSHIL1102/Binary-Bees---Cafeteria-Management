// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { login } from "../api/client";

// type LoginMode = "choose" | "demo" | "ibm";

// export default function Login() {
//   const [mode, setMode] = useState<LoginMode>("choose");
//   const [email, setEmail] = useState("");
//   const [name, setName] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { login: setAuth } = useAuth();
//   const navigate = useNavigate();

//   const handleDemoSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       const res = await login(email.trim(), name.trim());
//       if (res.error) {
//         setError(res.error);
//         return;
//       }
//       if (res.data?.token && res.data?.employee) {
//         setAuth(res.data.token, res.data.employee);
//         navigate("/", { replace: true });
//       }
//     } catch (_e) {
//       setError("Cannot reach server. Is the backend running on http://localhost:3001?");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleIbmLogin = () => {
//     setError("");
//     // Redirect to backend w3 SSO login; backend will redirect to w3, then back to /auth/callback with token
//     window.location.href = "/api/auth/w3/login";
//   };

//   if (mode === "choose") {
//     return (
//       <div className="container">
//         <div className="card" style={{ maxWidth: 420, marginTop: "3rem" }}>
//           <h1 style={{ marginTop: 0 }}>Cafeteria Seat Reservation</h1>
//           <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
//             Choose how you want to sign in.
//           </p>
//           <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//             <button
//               type="button"
//               className="btn btn-primary"
//               style={{ padding: "1rem", textAlign: "left" }}
//               onClick={() => setMode("demo")}
//             >
//               <strong>Demo user</strong>
//               <br />
//               <span style={{ fontSize: "0.9rem", opacity: 0.9 }}>
//                 Sign in with email and name (for testing / local dev)
//               </span>
//             </button>
//             <button
//               type="button"
//               className="btn"
//               style={{ padding: "1rem", textAlign: "left" }}
//               onClick={() => setMode("ibm")}
//             >
//               <strong>IBM employee</strong>
//               <br />
//               <span style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
//                 Sign in with w3 SSO (company credentials)
//               </span>
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (mode === "ibm") {
//     return (
//       <div className="container">
//         <div className="card" style={{ maxWidth: 400, marginTop: "3rem" }}>
//           <h1 style={{ marginTop: 0 }}>IBM w3 SSO</h1>
//           <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
//             You will be redirected to the company login page to sign in with your w3 credentials.
//           </p>
//           {error && <div className="alert alert-error">{error}</div>}
//           <button
//             type="button"
//             className="btn btn-primary"
//             style={{ width: "100%", marginBottom: "0.5rem" }}
//             onClick={handleIbmLogin}
//           >
//             Continue with w3 SSO
//           </button>
//           <button type="button" className="btn" style={{ width: "100%" }} onClick={() => { setMode("choose"); setError(""); }}>
//             Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // mode === "demo"
//   return (
//     <div className="container">
//       <div className="card" style={{ maxWidth: 400, marginTop: "3rem" }}>
//         <h1 style={{ marginTop: 0 }}>Demo user</h1>
//         <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
//           Sign in with any email and name for local testing.
//         </p>
//         <form onSubmit={handleDemoSubmit}>
//           {error && <div className="alert alert-error">{error}</div>}
//           <div className="form-group">
//             <label htmlFor="email">Email</label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="you@company.com"
//               required
//               autoComplete="email"
//             />
//           </div>
//           <div className="form-group">
//             <label htmlFor="name">Full Name</label>
//             <input
//               id="name"
//               type="text"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               placeholder="Your name"
//               required
//               autoComplete="name"
//             />
//           </div>
//           <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", marginBottom: "0.5rem" }}>
//             {loading ? "Signing in…" : "Sign in"}
//           </button>
//           <button type="button" className="btn" style={{ width: "100%" }} onClick={() => { setMode("choose"); setError(""); }}>
//             Back
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }





// 'use client';

// import React from "react"

// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { AlertCircle, ArrowLeft, ChefHat } from 'lucide-react';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// type LoginMode = 'choose' | 'demo' | 'ibm';

// export default function Login() {
//   const [mode, setMode] = useState<LoginMode>('choose');
//   const [email, setEmail] = useState('');
//   const [name, setName] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleDemoSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       // Simulated login - replace with your actual API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//       console.log('Login with:', { email, name });
//       // setAuth(res.data.token, res.data.employee);
//       // navigate("/", { replace: true });
//     } catch (_e) {
//       setError('Cannot reach server. Is the backend running on http://localhost:3001?');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleIbmLogin = () => {
//     setError('');
//     // window.location.href = "/api/auth/w3/login";
//   };

//   return (
//     <div
//       className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
//       style={{ backgroundImage: "url(/cafeteria-bg.jpg)" }}
//     >
//       {/* Blurred Background Overlay */}
//       <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

//       {/* Content */}
//       <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
//         <div className="w-full max-w-2xl">
//           {mode === 'choose' && (
//             <div className="space-y-6 animate-in fade-in">
//               {/* Logo/Header */}
//               <div className="text-center">
//                 <div className="mb-4 flex justify-center">
//                   <div className="rounded-full bg-warm-700 p-3 shadow-lg">
//                     <ChefHat className="h-8 w-8 text-warm-50" />
//                   </div>
//                 </div>
//                 <h1 className="text-4xl font-bold text-white drop-shadow-lg">CaféHub</h1>
//                 <p className="mt-2 text-warm-100">Reserve Your Perfect Table</p>
//               </div>

//               {/* Card */}
//               <Card className="border border-white/30 bg-white/15 shadow-2xl backdrop-blur-xl">
//                 <CardHeader className="space-y-2">
//                   <CardTitle className="text-center text-2xl text-black">Welcome Back</CardTitle>
//                   <CardDescription className="text-center text-black/70">
//                     Choose how you want to sign in
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <Button
//                     type="button"
//                     className="
//     h-24 w-full flex-col items-start justify-center
//     bg-white-3 text-black
//     border-2 border-warm-600
//     shadow-md
//     transition-all duration-200
//     hover:bg-warm-50 hover:shadow-lg
//   "
//                     onClick={() => setMode('demo')}
//                   >

//                     <span className="text-lg font-bold">Demo User</span>
//                     <span className="text-sm font-normal text-black/70">
//                       Sign in for testing & local development
//                     </span>
//                   </Button>

//                   <Button
//                     type="button"
//                     className="h-24 w-full flex-col items-start justify-center border-2 border-warm-600 bg-white-2 text-black hover:bg-warm-50 shadow-md"
//                     onClick={() => setMode('ibm')}
//                   >
//                     <span className="text-lg font-bold">IBM Employee</span>
//                     <span className="text-sm font-normal text-black/70">
//                       Sign in with company credentials
//                     </span>
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {mode === 'ibm' && (
//             <div className="space-y-4 animate-in fade-in">
//               <div className="text-center mb-6">
//                 <div className="mb-4 flex justify-center">
//                   <div className="rounded-full bg-warm-700 p-3 shadow-lg">
//                     <ChefHat className="h-8 w-8 text-warm-50" />
//                   </div>
//                 </div>
//                 <h1 className="text-4xl font-bold text-white drop-shadow-lg">CaféHub</h1>
//                 <p className="mt-2 text-warm-100">Reserve Your Perfect Table</p>
//               </div>
//               <Card className="border border-white/30 bg-white/15 shadow-2xl backdrop-blur-xl">
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2 text-black">
//                     <ChefHat className="h-5 w-5 text-warm-600" />
//                     IBM w3 SSO
//                   </CardTitle>
//                   <CardDescription className="text-black/70">
//                     You will be redirected to the company login page
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   {error && (
//                     <Alert variant="destructive">
//                       <AlertCircle className="h-4 w-4" />
//                       <AlertDescription>{error}</AlertDescription>
//                     </Alert>
//                   )}
//                   <Button
//                     type="button"
//                     className="w-full bg-warm-600 text-black hover:bg-warm-700"
//                     onClick={handleIbmLogin}
//                   >
//                     Continue with w3 SSO
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     className="w-full bg-transparent"
//                     onClick={() => {
//                       setMode('choose');
//                       setError('');
//                     }}
//                   >
//                     <ArrowLeft className="mr-2 h-4 w-4" />
//                     Back
//                   </Button>
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {mode === 'demo' && (
//             <div className="space-y-6 animate-in fade-in">
//               <div className="space-y-6">
//                 <div className="text-center">
//                   <div className="mb-4 flex justify-center">
//                     <div className="rounded-full bg-warm-700 p-3 shadow-lg">
//                       <ChefHat className="h-8 w-8 text-warm-50" />
//                     </div>
//                   </div>
//                   <h1 className="text-4xl font-bold text-white drop-shadow-lg">CaféHub</h1>
//                   <p className="mt-2 text-warm-100">Reserve Your Perfect Table</p>
//                 </div>

//                 <Card className="border border-white/30 bg-white/15 shadow-2xl backdrop-blur-xl">
//                   <CardHeader>
//                     <CardTitle className="flex items-center gap-2 text-black">
//                       <ChefHat className="h-5 w-5 text-warm-600" />
//                       Demo User Login
//                     </CardTitle>
//                     <CardDescription className="text-black/70">
//                       Sign in with any email and name for testing
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <form onSubmit={handleDemoSubmit} className="space-y-4">
//                       {error && (
//                         <Alert variant="destructive">
//                           <AlertCircle className="h-4 w-4" />
//                           <AlertDescription>{error}</AlertDescription>
//                         </Alert>
//                       )}

//                       <div className="space-y-2">
//                         <Label htmlFor="email" className="text-gray-700">
//                           Email
//                         </Label>
//                         <Input
//                           id="email"
//                           type="email"
//                           placeholder="you@company.com"
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           required
//                           autoComplete="email"
//                           className="border-gray-300"
//                         />
//                       </div>

//                       <div className="space-y-2">
//                         <Label htmlFor="name" className="text-gray-700">
//                           Full Name
//                         </Label>
//                         <Input
//                           id="name"
//                           type="text"
//                           placeholder="Your name"
//                           value={name}
//                           onChange={(e) => setName(e.target.value)}
//                           required
//                           autoComplete="name"
//                           className="border-gray-300"
//                         />
//                       </div>

//                       <Button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-warm-600 text-black hover:bg-warm-700"
//                       >
//                         {loading ? 'Signing in…' : 'Sign In'}
//                       </Button>

//                       <Button
//                         type="button"
//                         variant="outline"
//                         className="w-full bg-transparent"
//                         onClick={() => {
//                           setMode('choose');
//                           setError('');
//                         }}
//                       >
//                         <ArrowLeft className="mr-2 h-4 w-4" />
//                         Back
//                       </Button>
//                     </form>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }




'use client';

import React from "react";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { login } from "../api/client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, ArrowLeft, ChefHat } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

type LoginMode = 'choose' | 'demo' | 'ibm';

export default function Login() {
  const [mode, setMode] = useState<LoginMode>('choose');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  /** Shared hover animation */
  const baseButtonHover =
    "transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]";

  // ---------------- DEMO LOGIN ----------------
  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email.trim(), name.trim());

      if (res.error) {
        setError(res.error);
        return;
      }

      if (res.data?.token && res.data?.employee) {
        setAuth(res.data.token, res.data.employee);
        navigate("/", { replace: true });
      }
    } catch {
      setError(
        'Cannot reach server. Is the backend running on http://localhost:3001?'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- IBM LOGIN ----------------
  const handleIbmLogin = () => {
    setError('');
    window.location.href = "/api/auth/w3/login";
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: "url(/cafeteria-bg.jpg)" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-2xl">

          {/* ================== CHOOSE ================== */}
          {mode === 'choose' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-warm-700 p-3 shadow-lg">
                    <ChefHat className="h-8 w-8 text-warm-50" />
                  </div>
                </div>
                <h1 className="text-4xl font-bold text-white">CaféHub</h1>
                <p className="mt-2 text-warm-100">
                  Reserve Your Perfect Table
                </p>
              </div>

              <Card className="border border-white/30 bg-white/15 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-center text-3xl text-black">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-center text-1.5xl text-black/70">
                    Choose how you want to sign in
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button
                    onClick={() => setMode('demo')}
                    className={`
                      h-24 w-full flex-col items-start justify-center
                      bg-white text-black
                      border-2 border-warm-600
                      hover:bg-warm-50
                      ${baseButtonHover}
                    `}
                  >
                    <span className="text-lg font-bold">Demo User</span>
                    <span className="text-sm text-black/70">
                      Sign in for testing & local development
                    </span>
                  </Button>

                  <Button
                    onClick={() => setMode('ibm')}
                    className={`
                      h-24 w-full flex-col items-start justify-center
                      bg-white text-black
                      border-2 border-warm-600
                      hover:bg-warm-50
                      ${baseButtonHover}
                    `}
                  >
                    <span className="text-lg font-bold">IBM Employee</span>
                    <span className="text-sm text-black/70">
                      Sign in with company credentials
                    </span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ================== IBM ================== */}
          {mode === 'ibm' && (
            <Card className="border border-white/30 bg-white/15 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-black">IBM w3 SSO</CardTitle>
                <CardDescription className="text-black/70">
                  You will be redirected to the company login page
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleIbmLogin}
                  className={`
                    w-full bg-warm-600 text-black
                    hover:bg-warm-500 bg-white
                    ${baseButtonHover}
                  `}
                >
                  Continue with w3 SSO
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setMode('choose')}
                  className={`w-full hover:bg-white/20 ${baseButtonHover}`}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ================== DEMO ================== */}
          {mode === 'demo' && (
            <Card className="border border-white/30 bg-white/15 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-black">Demo User Login</CardTitle>
                <CardDescription className="text-black/70">
                  Sign in with any email and name
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleDemoSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    disabled={loading}
                    className={`
                      w-full bg-warm-600 text-black
                      hover:bg-warm-500 
                      ${baseButtonHover}
                    `}
                  >
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMode('choose')}
                    className={`w-full hover:bg-white/20 ${baseButtonHover}`}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
