'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Users, Shield, GraduationCap, Trash2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    is_admin: boolean;
    student_type: 'C' | 'D';
}

export default function AdminUsersPage() {
    const ta = useTranslations('Admin');
    const tc = useTranslations('Common');
    const { profile, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'student'>('all');
    const [trackFilter, setTrackFilter] = useState<'all' | 'C' | 'D'>('all');
    const supabase = createClient();

    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' ||
            (roleFilter === 'admin' && u.is_admin) ||
            (roleFilter === 'student' && !u.is_admin);
        const matchesTrack = trackFilter === 'all' || u.student_type === trackFilter;
        return matchesSearch && matchesRole && matchesTrack;
    });

    useEffect(() => {
        if (!authLoading && !profile?.is_admin) {
            router.push('/dashboard');
        }
    }, [profile, authLoading, router]);

    const fetchUsers = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        setUsers(data || []);
        setLoading(false);
    };

    useEffect(() => {
        if (profile?.is_admin) {
            fetchUsers();
        }
    }, [profile]);

    const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
        if (!confirm(ta('toggleAdminConfirm'))) return;

        const { error } = await supabase
            .from('profiles')
            .update({ is_admin: !currentStatus })
            .eq('id', userId);

        if (error) {
            alert(tc('error') + ': ' + error.message);
        } else {
            fetchUsers();
        }
    };

    const changeStudentType = async (userId: string, newType: 'C' | 'D') => {
        const { error } = await supabase
            .from('profiles')
            .update({ student_type: newType })
            .eq('id', userId);

        if (error) {
            alert(tc('error') + ': ' + error.message);
        } else {
            fetchUsers();
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm(ta('deleteUserConfirm'))) return;

        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (error) {
            alert(tc('error') + ': ' + error.message);
        } else {
            fetchUsers();
        }
    };

    if (authLoading || !profile?.is_admin) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 mt-6">
            {/* Enhanced Header matching dashboard */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-500 p-8 shadow-xl shadow-indigo-200/50 mb-8">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">{tc('admin')}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
                            <Users className="w-8 h-8 text-white/80" />
                            {ta('manageUsers')}
                        </h1>
                        <p className="text-white/80 text-sm mt-2 max-w-xl leading-relaxed">{ta('usersPageDesc')}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-sm flex items-center gap-3 text-white">
                        <span className="text-3xl font-black">{filteredUsers.length}</span>
                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{ta('totalUsers').replace(' ', '\\n')}</span>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={ta('searchUsers')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all text-gray-900"
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="block w-full md:w-36 py-2.5 px-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700"
                    >
                        <option value="all">{ta('allRoles')}</option>
                        <option value="admin">{ta('userAdmin')}</option>
                        <option value="student">{ta('userStudent')}</option>
                    </select>
                    <select
                        value={trackFilter}
                        onChange={(e) => setTrackFilter(e.target.value as any)}
                        className="block w-full md:w-36 py-2.5 px-3 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-gray-700"
                    >
                        <option value="all">{ta('allTracks')}</option>
                        <option value="C">{ta('bacC')}</option>
                        <option value="D">{ta('bacD')}</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tl-xl border-b border-gray-100">{ta('userUser')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">{ta('userRole')}</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-gray-100">{ta('userTrack')}</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 rounded-tr-xl border-b border-gray-100">{ta('userActions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                                            {ta('noUsers')}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{u.full_name || 'No Name'}</span>
                                                    <span className="text-gray-500 text-xs">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {u.is_admin ? (
                                                        <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-indigo-100">
                                                            <Shield className="w-3 h-3" /> {ta('userAdmin')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-lg text-xs border border-gray-200">
                                                            {ta('userStudent')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className={`w-4 h-4 ${u.student_type === 'C' ? 'text-blue-500' : 'text-emerald-500'}`} />
                                                    <span className="font-semibold text-gray-700 text-xs">
                                                        {u.student_type === 'C' ? ta('bacC') : ta('bacD')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => toggleAdminStatus(u.id, u.is_admin)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${u.is_admin
                                                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'
                                                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100'
                                                        }`}
                                                >
                                                    {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                                                </button>
                                                <select
                                                    value={u.student_type}
                                                    onChange={(e) => changeStudentType(u.id, e.target.value as 'C' | 'D')}
                                                    className="px-2 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-700 shadow-sm hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500 outline-none transition-all cursor-pointer"
                                                >
                                                    <option value="C">Bac C</option>
                                                    <option value="D">Bac D</option>
                                                </select>
                                                <button
                                                    onClick={() => deleteUser(u.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-2"
                                                    title={tc('delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
