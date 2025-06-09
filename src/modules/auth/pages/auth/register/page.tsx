import React from 'react';
import RegisterForm from '../../../components/modules/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Register Page (from Auth Module)</h1>
      <p className="text-center mb-8">This is the registration page, generated from the auth module.</p>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
