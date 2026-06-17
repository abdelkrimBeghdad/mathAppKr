import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import LoadingScreen from './LoadingScreen';
import PremiumLock from './common/PremiumLock';

export default function FeatureGate({ children, featureName }) {
    const [status, setStatus] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    const checkAccess = async () => {
        try {
            const { data } = await api.get('/settings/features');
            const feature = data.find(f => f.name === featureName);
            setStatus(feature);
        } catch (e) {
            console.error('Failed to fetch feature status', e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        checkAccess();
    }, [featureName]);

    if (loading) return <LoadingScreen message="جاري التحقق من صلاحيات الوصول..." />;

    if (status && !status.is_unlocked) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="w-full max-w-4xl">
                    <PremiumLock
                        accessibleId={status.id || featureName} // Use record ID if available, or name
                        accessibleType="feature"
                        price={status.price}
                        onUnlocked={() => {
                            setStatus(prev => ({ ...prev, is_unlocked: true }));
                            window.location.reload(); // Refresh to clear any middleware cache/state
                        }}
                    />
                </div>
            </div>
        );
    }

    return children;
}
