/* eslint-disable no-unused-vars */
// LibrarySection.js
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

import {
  LibraryContainer,
  SidebarContainer,
  Content,
  LibraryHeader,
  BookList,
  BookItem,
  BookTitle,
  BorrowButton,
} from '../../styles/LibraryStyles';

const LibrarySection = () => {
  const [books, setBooks] = useState([]);

  


  const handleBorrowBook = (id) => {

    console.log(`Book with ID ${id} has been borrowed.`);
  };

  return (
    <LibraryContainer>
      <SidebarContainer>
        <Sidebar />
      </SidebarContainer>
      <Content>
        <LibraryHeader>Library</LibraryHeader>
        <BookList>

            <BookItem >
              <BookTitle></BookTitle>
              <p>Author: </p>
              <BorrowButton ><handleBorrowBook>Borrow</handleBorrowBook></BorrowButton>
            </BookItem>

        </BookList>
      </Content>
    </LibraryContainer>
  );
};

export default LibrarySection;