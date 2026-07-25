import styled from 'styled-components';

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  padding: 20px;
`;

export const FormTitle = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  text-shadow: 1px 2px 4px rgba(0, 0, 0, 0.1);
`;

export const InputField = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #0083B0;
    outline: none;
  }

  @media screen and (max-width: 768px) {
    max-width: 100%;
  }
`;

export const SubmitButton = styled.button`
  width: 100%;
  max-width: 200px;
  padding: 12px;
  background-color: #00B4DB;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #0083B0;
    transform: translateY(-2px);
  }

  @media screen and (max-width: 768px) {
    max-width: 100%;
  }
`;
