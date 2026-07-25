import React, { useState } from 'react';
import { FormContainer, InputField, SubmitButton, FormTitle } from '../styles/GestStyle';

const Gest = () => {
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    regId: '',
    contact: '',
    email: '',
    address: '',
    classSection: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for form submission, such as sending data to an API or saving it locally
    console.log(formData);
  };

  return (
    <FormContainer>
      <FormTitle>Registeration</FormTitle>
      <form onSubmit={handleSubmit}>
        <InputField
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <InputField
          type="text"
          name="fatherName"
          placeholder="Father's Name"
          value={formData.fatherName}
          onChange={handleChange}
          required
        />
        <InputField
          type="text"
          name="regId"
          placeholder="Registration ID"
          value={formData.regId}
          onChange={handleChange}
          required
        />
        <InputField
          type="tel"
          name="contact"
          placeholder="Contact No"
          value={formData.contact}
          onChange={handleChange}
          required
        />
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <InputField
          type="text"
          name="address"
          placeholder="Home Address"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <InputField
          type="text"
          name="classSection"
          placeholder="Class Section"
          value={formData.classSection}
          onChange={handleChange}
          required
        />
        <SubmitButton type="submit">Register</SubmitButton>
      </form>
    </FormContainer>
  );
};

export default Gest;
