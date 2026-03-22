'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useTranslations } from 'next-intl';
import { createClient } from '@/utils/supabase/client';
import { Camera, Save, Trash2, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';

export default function ProfilePage() {
    const { user, profile, loading } = useAuth();
    const t = useTranslations('Profile');
    const tc = useTranslations('Common');
    const router = useRouter();
    const supabase = createClient();

    const [fullName, setFullName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setAvatarUrl(profile.avatar_url || null);
        }
    }, [profile]);

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );
    if (!user) return null;

    const handleUploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            const file = event.target.files[0];

            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                console.error('Upload API Error:', data.error);
                alert(t('errors.uploadFailed') || 'Upload failed.');
                return;
            }

            setAvatarUrl(data.publicUrl);
            alert(t('messages.avatarUpdated') || 'Avatar updated!');
            
            // Force reload to update Navbar (hacky but works)
            router.refresh();

        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert(tc('error'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            const { error } = await supabase.from('profiles').update({
                full_name: fullName,
                avatar_url: avatarUrl
            }).eq('id', user.id);

            if (error) throw error;
            alert(t('messages.profileSaved') || 'Profile saved successfully!');
            router.refresh();
        } catch (error) {
            console.error('Error saving profile:', error);
            alert(tc('error'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('messages.deleteConfirm') || 'Are you sure you want to delete your account? This cannot be undone.')) {
            return;
        }
        
        setIsDeleting(true);
        try {
            // Send request to API route to delete user using service_role key
            const res = await fetch('/api/auth/delete-account', { method: 'POST' });
            if (!res.ok) throw new Error('Failed to delete account');
            
            // Sign out on client side
            await supabase.auth.signOut();
            window.location.replace('/login');
        } catch (error) {
            console.error('Delete account error:', error);
            alert(tc('error'));
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">{t('title') || 'My Profile'}</h1>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-indigo-500 text-3xl font-bold">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user.email?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-indigo-700 hover:scale-105 transition-all text-[10px]"
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleUploadAvatar}
                            />
                        </div>
                        <div className="text-center sm:text-left pt-2">
                            <h2 className="text-lg font-bold text-gray-900">{fullName || user.email?.split('@')[0]}</h2>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <button onClick={() => fileInputRef.current?.click()} className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                                {t('changePhoto') || 'Change Photo'}
                            </button>
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Form Fields */}
                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t('email') || 'Email Address'}</label>
                            <input
                                type="text"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-medium focus:outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">{t('fullName') || 'Full Name'}</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={t('fullNamePlaceholder') || 'Enter your full name'}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex justify-end">
                        <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 hover:scale-105 transition-all w-full sm:w-auto justify-center disabled:opacity-70 disabled:hover:scale-100"
                        >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('saveChanges') || 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50/50 rounded-3xl border border-red-100 p-8 space-y-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                        <h3 className="text-sm font-bold text-red-800">{t('dangerZone') || 'Danger Zone'}</h3>
                        <p className="text-xs text-red-600/80 mt-1 mb-4 leading-relaxed max-w-md">
                            {t('deleteWarning') || 'Once you delete your account, there is no going back. Please be certain.'}
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-100 text-red-700 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                        >
                            {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            {t('deleteAccount') || 'Delete Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
