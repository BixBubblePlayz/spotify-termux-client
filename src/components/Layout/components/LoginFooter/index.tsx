import { memo, useState } from 'react';
import { WhiteButton } from '../../../Button';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../../../store/store';
import { loginToSpotify } from '../../../../store/slices/auth';
import useIsMobile from '../../../../utils/isMobile';
import { Input, message } from 'antd';
import { authService } from '../../../../services/auth';

export const LoginFooter = memo(() => {
  const isMobile = useIsMobile();
  const [t] = useTranslation(['home']);
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handlePasswordLogin = async () => {
    setBusy(true);
    try {
      await authService.login(password);
      await dispatch(loginToSpotify());
    } catch {
      message.error('Wrong password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className='login-footer' style={{ margin: '0px 10px' }}>
      <div className='login-container' style={{ flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
        <div>
          <p className='title'>{t('Preview')}</p>
          <p className='description'>{t('Log In to access all the features of the app')}.</p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input.Password
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handlePasswordLogin}
            style={{ width: 180 }}
          />
          <WhiteButton title={busy ? '...' : t('Log In')} onClick={handlePasswordLogin} />
        </div>
      </div>
    </div>
  );
});
