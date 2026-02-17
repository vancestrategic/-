import React, { useEffect, useState } from 'react';
import { setToken, getUserFromToken } from '../../services/auth';
import capsuleImage from '../../assets/images/capsule.png';
import './EmailConfirmationPage.css';

function EmailConfirmationPage() {
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const token = urlParams.get('token');
    const emailParam = urlParams.get('email');
    const error = urlParams.get('error');

    if (success === 'true' && token) {
      // Token'ı decode et (URL encoding'den kaynaklanan sorunları önlemek için)
      const decodedToken = decodeURIComponent(token);
      
      // Token formatını kontrol et
      const parts = decodedToken.split('.');
      if (parts.length !== 3) {
        setStatus('error');
        setMessage('Geçersiz token formatı.');
        return;
      }
      
      // Token'ı localStorage'a kaydet
      setToken(decodedToken);
      const user = getUserFromToken(decodedToken);
      setStatus('success');
      setEmail(emailParam || user?.email || '');
      setMessage('E-posta adresiniz başarıyla onaylandı. Otomatik olarak giriş yapılıyor...');
      
      // 2 saniye sonra dashboard'a yönlendir
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } else if (success === 'false' || error) {
      setStatus('error');
      setMessage(error || 'E-posta onayı başarısız oldu. Lütfen geçerli bir onay linki kullanın.');
    } else {
      setStatus('error');
      setMessage('Geçersiz onay linki.');
    }
  }, []);

  if (status === 'loading') {
    return (
      <div className="email-confirmation-page">
        <div className="container">
          <div className="loading-icon"></div>
          <h1>Onaylanıyor...</h1>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="email-confirmation-page">
        <div className="container">
          <div className="error-icon">✕</div>
          <h1>Onay Başarısız</h1>
          <p className="subtitle">{message}</p>
          <button className="button" onClick={() => window.location.href = '/'}>
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="email-confirmation-page">
      <div className="capsule-background">
        <img src={capsuleImage} alt="Capsule" className="capsule-image" />
      </div>
      <div className="container">
        <div className="success-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h1>E-posta Onaylandı!</h1>
        <p className="subtitle">
          <span className="email">{email}</span> adresiniz başarıyla onaylandı.
        </p>
        <p className="subtitle">
          Otomatik olarak giriş yapılıyor...
        </p>
        <p className="loading-text">Dashboard'a yönlendiriliyorsunuz...</p>
      </div>
    </div>
  );
}

export default EmailConfirmationPage;

