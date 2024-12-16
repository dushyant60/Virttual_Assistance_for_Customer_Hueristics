import React from 'react';

import { Col, Row } from 'react-bootstrap';
import Header from './Component/Header/Header';
import SideMenu from './Component/Header/SideMenu';


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
