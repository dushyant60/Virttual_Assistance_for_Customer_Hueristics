import React from 'react';
import Header from './Component/Header';

import { Col, Row } from 'react-bootstrap';
import SideMenu from '../Header/SideMenu';


const LandingPg=()=> {
  return (
    <>
      <Row >
        <Col>
          <Header/>
        </Col>
      </Row>
          <SideMenu/>
    </>
  );
}

export default LandingPg;
