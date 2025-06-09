import React from 'react';
import ContactForm from '../../../components/modules/contact/ContactForm';

const ContactPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact Us (from Contact Module)</h1>
      <p className="text-lg text-gray-700 text-center mb-10">This is the contact page, generated from the contact module. Please fill out the form below to get in touch.</p>
      <ContactForm />
    </div>
  );
};

export default ContactPage;
