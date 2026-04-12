import React, { memo } from 'react';
import type { CoolantInspectionBlock } from '../types';
import { COOLANT_ISSUE_OPTIONS } from '../../../constants/inspectionSchema';
import InspectionImageDetailPanel from './InspectionImageDetailPanel';

interface Props {
  value: CoolantInspectionBlock | undefined;
  onChange: (next: CoolantInspectionBlock) => void;
  onBack: () => void;
}

const CoolantInspectionPanel: React.FC<Props> = (props) => (
  <InspectionImageDetailPanel
    {...props}
    title="Coolant"
    layout="coolant"
    issueOptions={COOLANT_ISSUE_OPTIONS}
    photoLabel="Coolant photo"
    subtitle="Set status, note any issues, and capture a photo."
  />
);

export default memo(CoolantInspectionPanel);
