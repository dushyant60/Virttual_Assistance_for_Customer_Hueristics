import React, { useState } from 'react';
import { Stepper, Step, StepLabel, Button } from '@material-ui/core';

function CallLifecycle() {
  const [activeStep, setActiveStep] = useState(3);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const steps = [
    'Incoming Call',
    'Call Queue Started',
    'Ringing',
    'Connected to Freshcaller Support',
    'Unavailable Agent',
    'Call Ended',
    'Call Completed'
  ];

  return (
    <div style={{boxShadow:
      "0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)", borderRadius:"15px", }}>
      <Stepper activeStep={activeStep} alternativeLabel style={{borderRadius: "15px", background: "#ecf5f7a3"}}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {/* <div>
        {activeStep === steps.length ? (
          <div>
            <Button onClick={handleReset}>Reset</Button>
          </div>
        ) : (
          <div>
            <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
            <Button variant="contained" color="primary" onClick={handleNext}>
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        )}
      </div> */}
    </div>
  );
}

export default CallLifecycle;
