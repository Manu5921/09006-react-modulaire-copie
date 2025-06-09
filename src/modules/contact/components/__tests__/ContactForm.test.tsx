import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactForm from '../ContactForm';

describe('ContactForm', () => {
  it('renders all form fields and the submit button', () => {
    render(<ContactForm />);

    // Vérifier la présence des champs par leur placeholder ou label
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Message')).toBeInTheDocument();

    // Vérifier la présence du bouton de soumission
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });
});
