// MainbyTabs1.js
import React from 'react';
import { AlbumOutlined, AssessmentOutlined, EventNoteOutlined, PhoneInTalkOutlined, QuestionAnswerOutlined, SpellcheckOutlined, TranslateOutlined } from '@material-ui/icons';
import { Routess } from '../../routes';
import TabBar from '../Common/TabBar';
import RecordedCallAnalysis from './recordedcall/RecordedCallAnalysis';
import AgentCallLog from './agent-call-log/AgentCallSummary';
import RealTimeCallAnalys from './real-time-call/RealTimeCallAnalysis';


const tabs = [
  {
    to: Routess.RealTime,
    label: 'Real Time Call',
    icon: <PhoneInTalkOutlined style={{marginBottom:"0px"}}/>,
    component: <RealTimeCallAnalys/>
  },
  {
    to: Routess.Recorded,
    label: 'Recorded Calls',
    icon: <AlbumOutlined style={{marginBottom:"0px"}}/>,
    component: <RecordedCallAnalysis />,
  },
  {
    to: Routess.CallSummary,
    label: 'Agent Summary',
    icon: <EventNoteOutlined style={{marginBottom:"0px"}}/>,
    component: <AgentCallLog/>,
  },
  {
    to: Routess.PostCall,
    label: 'Call Analytics',
    icon: <AssessmentOutlined style={{marginBottom:"0px"}} />,
    // component:,
  },
//   {
//     to: Routess.ContentModeration,
//     label: 'moderation',
//     icon: <SpellcheckOutlined style={{marginBottom:"0px"}}/>,
//     component: <AzureMOderator/>,
//   },
];

export default function MainTab() {
  return <TabBar tabs={tabs} />;
}
