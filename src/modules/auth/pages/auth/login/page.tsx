import React from 'react';
import LoginForm from '../../../components/modules/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Login Page (from Auth Module)</h1>
      <p className="text-center mb-8">This is the login page, generated from the auth module.</p>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
