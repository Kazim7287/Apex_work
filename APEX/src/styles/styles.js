import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Navbar
export const Navbar = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 40px;
  background: linear-gradient(90deg, #00B4DB, #0083B0);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: background-color 0.3s ease;

  &:hover {
    background: linear-gradient(90deg, #0083B0, #005f73);
  }

  @media screen and (max-width: 768px) {
    flex-direction: column;
    padding: 10px 20px;
  }
`;

// Logo
export const Logo = styled.img`
  width: 50px;
  height: auto;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }

  @media screen and (max-width: 768px) {
    margin-bottom: 10px;
  }
`;

// Navigation Links
export const NavigationLinks = styled.div`
  display: flex;
  align-items: center;

  @media screen and (max-width: 768px) {
    margin-top: 10px;
  }
`;

export const NavLink = styled.a`
  margin-right: 20px;
  color: white;
  text-decoration: none;
  font-size: 18px;
  font-weight: bold;
  transition: color 0.3s ease;

  &:hover {
    color: #FFDD57;
    text-decoration: underline;
  }

  @media screen and (max-width: 768px) {
    margin: 0 10px;
    font-size: 16px;
  }
`;

// Buttons
export const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 35px;

  @media screen and (max-width: 768px) {
    margin-top: 10px;
    margin-right: 0;
  }
`;

export const LoginButton = styled.button`
  background-color: #FF5722;
  color: white;
  border: none;
  padding: 10px 20px;
  margin-right: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #E64A19;
    transform: translateY(-2px);
  }

  @media screen and (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

export const GuestButton = styled.button`
  color: #FF5722;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  margin:20px 20px 20px;
  border: 2px solid #FF5722;
  border-radius: 5px;
  background-color: transparent;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #FF5722;
    color: white;
  }

  @media screen and (max-width: 768px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

// Home Container
export const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #00C9FF, #92FE9D);
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  padding-top: 80px;

  @media screen and (max-width: 768px) {
    padding-top: 60px;
  }
`;

// School Info and Image
export const SchoolInfo = styled.div`
  margin-top: 20px;
  color: white;
`;

export const SchoolImage = styled.img`
  width: 80%;
  max-height: 80vh;
  object-fit: cover;
  margin-top: 20px;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);

  @media screen and (max-width: 768px) {
    width: 100%;
  }
`;

// Title
export const Title = styled.h1`
  font-size: 42px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.5);
  margin-bottom: 20px;

  @media screen and (max-width: 768px) {
    font-size: 32px;
  }
`;

// Text Container
export const LoremTextContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  font-size: 18px;
  color: white;
  text-align: justify;
  padding: 0 20px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

  @media screen and (max-width: 768px) {
    font-size: 16px;
  }
`;

// Admin Register Link
export const AdminRegisterLink = styled(Link)`
  color: #FFDD57;
  font-size: 14px;
  font-weight: bold;
  text-decoration: none;
  margin-top: 10px;

  &:hover {
    text-decoration: underline;
  }

  @media screen and (max-width: 768px) {
    font-size: 12px;
  }
`;

// // styles.js
// import styled from 'styled-components';
// import { Link } from 'react-router-dom';

// export const Navbar = styled.nav`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 20px;
//   background-color: #6BD4E7;
//   color: black;
//   font-family: Arial, sans-serif;
//   z-index: 1000;

//   @media screen and (max-width: 768px) {
//     flex-direction: column;
//     padding: 10px;
//   }
// `;

// export const Logo = styled.img`
//   width: 50px;
//   height: auto;

//   @media screen and (max-width: 768px) {
//     margin-bottom: 10px;
//   }
// `;

// export const NavigationLinks = styled.div`
//   display: flex;
//   align-items: center;

//   @media screen and (max-width: 768px) {
//     margin-top: 10px;
//   }
// `;

// export const NavLink = styled.a`
//   margin-right: 20px;
//   color: black;
//   text-decoration: none;
//   font-size: 18px;
//   font-weight: bold;

//   &:hover {
//     text-decoration: underline;
//   }

//   @media screen and (max-width: 768px) {
//     margin: 0 10px;
//     font-size: 16px;
//   }
// `;

// export const ButtonsContainer = styled.div`
//   display: flex;
//   align-items: center;
//   margin-right: 35px;

//   @media screen and (max-width: 768px) {
//     margin-top: 10px;
//     margin-right: 0;
//   }
// `;

// export const LoginButton = styled.button`
//   background-color: orange;
//   color: white;
//   border: none;
//   padding: 10px 20px;
//   margin-right: 10px;
//   cursor: pointer;
//   font-size: 16px;
//   font-weight: bold;

//   @media screen and (max-width: 768px) {
//     padding: 8px 16px;
//     font-size: 14px;
//   }
// `;

// export const GuestButton = styled.button`
//   color: white;
//   border: none;
//   padding: 10px 20px;
//   cursor: pointer;
//   font-size: 16px;
//   font-weight: bold;
//   border: 2px solid orange;
//   border-radius: 5px;
//   background-color: transparent;
//   transition: background-color 0.3s ease;

//   &:hover {
//     background-color: orange;
//   }

//   @media screen and (max-width: 768px) {
//     padding: 8px 16px;
//     font-size: 14px;
//   }
// `;

// export const HomeContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   text-align: center;
//   background: linear-gradient(45deg, #6BD4E7, #6FC3DF);
//   background-size: cover;
//   background-position: center;
//   min-height: 100vh;
//   padding-top: 80px;

//   @media screen and (max-width: 768px) {
//     padding-top: 60px;
//   }
// `;

// export const SchoolInfo = styled.div`
//   margin-top: 20px;
// `;

// export const SchoolImage = styled.img`
//   width: 80%;
//   max-height: 80vh;
//   object-fit: cover;
//   margin-top: 20px;

//   @media screen and (max-width: 768px) {
//     width: 100%;
//   }
// `;

// export const Title = styled.h1`
//   font-size: 36px;
//   font-weight: bold;
//   color: white;
//   text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

//   @media screen and (max-width: 768px) {
//     font-size: 28px;
//   }
// `;

// export const LoremTextContainer = styled.div`
//   max-width: 800px;
//   margin: 0 auto;
//   font-size: 18px;
//   color: white;
//   text-align: justify;
//   padding: 0 20px;

//   @media screen and (max-width: 768px) {
//     font-size: 16px;
//   }
// `;

// export const AdminRegisterLink = styled(Link)`
//   color: white;
//   font-size: 12px;
//   font-weight: bold;
//   text-decoration: none;
//   margin-top: 10px;

//   &:hover {
//     text-decoration: underline;
//   }

//   @media screen and (max-width: 768px) {
//     font-size: 10px;
//   }
// `;
