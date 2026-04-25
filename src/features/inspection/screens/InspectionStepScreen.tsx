import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import type { InspectionStackScreenProps } from '../../../navigation/types';
import { InspectionStepId } from '../types';
import Step1BasicVerification from './steps/Step1_BasicVerification';
import Step2AirConditioning from './steps/Step2_Exterior';
import Step3SteeringBrakes from './steps/Step3_Interior';
import Step4EngineTransmission from './steps/Step4_Engine';
import Step5ElectricalsInterior from './steps/Step5_ElectricalsInteriors';
import Step6ExteriorTyres from './steps/Step6_Media';
import { useInspectionStore } from '../store/inspectionStore';

type Props = InspectionStackScreenProps<'InspectionStep'>;

const STEP_ORDER = [
  InspectionStepId.BasicVerification,
  InspectionStepId.Exterior,
  InspectionStepId.Interior,
  InspectionStepId.Engine,
  InspectionStepId.Documents,
  InspectionStepId.Media,
];

const InspectionStepScreen: React.FC<Props> = ({ navigation, route }) => {
  const { stepIndex, inspectionId } = route.params;
  const { currentLead } = useInspectionStore();

  const handleNext = useCallback(() => {
    const nextIndex = stepIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      navigation.replace('InspectionStep', {
        inspectionId,
        stepIndex: nextIndex,
      });
    } else {
      navigation.navigate('ReviewSubmit', { inspectionId });
    }
  }, [navigation, stepIndex, inspectionId]);

  const handleBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('InspectionHome', { inspectionId });
    }
  }, [navigation, inspectionId]);

  const props = { onNext: handleNext, onBack: handleBack };

  switch (stepIndex) {
    case 0:
      return <Step1BasicVerification {...props} />;
    case 1:
      return <Step4EngineTransmission {...props} />;
    case 2:
      return <Step2AirConditioning {...props} />;
    case 3:
      return <Step3SteeringBrakes {...props} />;
    case 4:
      return <Step5ElectricalsInterior {...props} />;
    case 5:
      return <Step6ExteriorTyres {...props} />;
    default:
      navigation.navigate('InspectionHome', { inspectionId });
      return null;
  }
};

export default InspectionStepScreen;
