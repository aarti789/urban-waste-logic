import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { Recycle, Shield, Wrench, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Login = () => {
  const [role, setRole] = useState<UserRole>('worker');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    const success = login(username.trim(), password, role);
    if (success) {
      navigate(role === 'admin' ? '/admin' : '/worker');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4">
            <Recycle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">GreenRoute</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Urban Waste Management</p>
        </div>

        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign In</CardTitle>
            <CardDescription>Select your role and enter credentials</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Selector */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  role === 'admin'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Shield className={`w-6 h-6 ${role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${role === 'admin' ? 'text-primary' : 'text-muted-foreground'}`}>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  role === 'worker'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <Wrench className={`w-6 h-6 ${role === 'worker' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm font-medium ${role === 'worker' ? 'text-primary' : 'text-muted-foreground'}`}>Worker</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter password"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In as {role === 'admin' ? 'Admin' : 'Worker'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Demo: Enter any username and password to continue
        </p>
      </div>
    </div>
  );
};

export default Login;
