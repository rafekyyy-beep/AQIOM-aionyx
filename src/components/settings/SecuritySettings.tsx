'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';

export function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleChangePassword = () => {
    // API call to change password
    console.log('Changing password');
  };

  return (
    <div className="space-y-6">
      <Card title="تغيير كلمة المرور">
        <div className="space-y-4">
          <Input
            type="password"
            label="كلمة المرور الحالية"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <Input
            type="password"
            label="كلمة المرور الجديدة"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button onClick={handleChangePassword}>تغيير كلمة المرور</Button>
        </div>
      </Card>

      <Card title="الأمان">
        <Checkbox
          label="تفعيل المصادقة الثنائية (2FA)"
          checked={twoFactor}
          onChange={(e) => setTwoFactor(e.target.checked)}
        />
      </Card>
    </div>
  );
}
