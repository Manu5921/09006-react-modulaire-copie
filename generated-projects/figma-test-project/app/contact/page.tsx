import React from 'react';
import ContactForm from '../../../components/modules/contact/ContactForm';

const ContactPage = () => {
  return (
    <div className="container mx-auto p-4 py-8">
      <p className="text-lg text-gray-700 text-center mb-10">
        Have a question or want to work together? Fill out the form below to get in touch with us.
      </p>
      <ContactForm />
    </div>
  );
};

export default ContactPage;
