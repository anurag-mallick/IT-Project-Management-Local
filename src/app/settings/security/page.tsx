"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Shield, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SecuritySettings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: sbError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (sbError) throw sbError;

      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="relative overflow-hidden bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-3xl shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32 rounded-full" />
        
        <div className="flex items-center gap-6 mb-12 relative">
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Shield className="text-blue-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Security Settings</h1>
            <p className="text-white/40 text-sm mt-1">Manage your account protection and credentials</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-8 relative">
          <div className="grid gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] px-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-lg focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] px-1">Confirm New Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-lg focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-4 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl animate-shake">
              <AlertCircle className="text-red-500 shrink-0" size={20} />
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-4 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
              <p className="text-sm text-emerald-500 font-medium tracking-wide">Password updated successfully!</p>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold h-16 rounded-2xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-2xl shadow-white/5"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Shield size={20} />
                  <span className="text-lg">Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-12 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
          <div className="flex gap-4">
            <AlertCircle className="text-amber-500/60 shrink-0" size={22} />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-amber-500/80 uppercase tracking-widest">Security Note</p>
              <p className="text-[13px] text-white/40 font-medium leading-relaxed">
                Changing your password will sign you out of all other sessions. Ensure your new password is secure and includes a mix of characters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
