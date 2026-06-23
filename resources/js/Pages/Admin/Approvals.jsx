import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import axios from 'axios';
import { useToast } from '@/ToastContext';

export default function Approvals({ auth, pendingUsers }) {
    const { showToast } = useToast();

    const onApprove = (userId) => {
        axios.post(route('user.approve', userId))
            .then((res) => {
                showToast(res.data.message);
                router.reload();
            })
            .catch((err) => {
                console.error(err);
                showToast('An error occurred while approving the user.');
            });
    };

    const onDecline = (userId) => {
        if (!confirm('Are you sure you want to decline and remove this request?')) {
            return;
        }
        axios.post(route('user.decline', userId))
            .then((res) => {
                showToast(res.data.message);
                router.reload();
            })
            .catch((err) => {
                console.error(err);
                showToast('An error occurred while declining the user.');
            });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-base-content leading-tight">Pending Approvals</h2>}
        >
            <Head title="Pending Approvals" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-base-100 overflow-hidden shadow-sm sm:rounded-lg border border-base-300">
                        <div className="p-6 text-base-content">
                            {pendingUsers.length === 0 ? (
                                <p className="text-base-content/70 text-center py-8">There are no pending user registrations at this time.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th className="text-left text-sm font-semibold text-base-content/80 uppercase pb-4">Name</th>
                                                <th className="text-left text-sm font-semibold text-base-content/80 uppercase pb-4">Email</th>
                                                <th className="text-left text-sm font-semibold text-base-content/80 uppercase pb-4">Date Requested</th>
                                                <th className="text-right text-sm font-semibold text-base-content/80 uppercase pb-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingUsers.map((user) => (
                                                <tr key={user.id} className="border-t border-base-300">
                                                    <td className="py-4">
                                                        <span className="font-medium">{user.name}</span>
                                                    </td>
                                                    <td className="py-4">{user.email}</td>
                                                    <td className="py-4 text-base-content/70">
                                                        {`${new Date(user.created_at).getDate().toString().padStart(2, '0')}-${(new Date(user.created_at).getMonth() + 1).toString().padStart(2, '0')}-${new Date(user.created_at).getFullYear()}`}
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex justify-end gap-3">
                                                            <button 
                                                                onClick={() => onApprove(user.id)}
                                                                className="inline-flex items-center rounded-md border border-transparent bg-emerald-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-emerald-500 focus:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:bg-emerald-700"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => onDecline(user.id)}
                                                                className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-red-500 focus:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
