// MainbyTabs1.js
import React from 'react';
import { EventNoteOutlined, QuestionAnswerOutlined, SpellcheckOutlined, TranslateOutlined } from '@material-ui/icons';
import LogServer from './LogServer';
import JobStat from './JobStat';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';
import Dashboard from '../Home/Dashboard';
import CallLog from './CallLogs';
import { Routess } from '../../routes';
import TabBar from '../Common/TabBar';

const tabs = [
  {
    to:Routess.CallManagement,
    label: 'Call Management',
    icon: <EventNoteOutlined style={{marginBottom:"0px"}}/>,
    component: <Dashboard/>,
  },
  // {
  //   to: Routess.CallLogs,
  //   label: 'Call Logs',
  //   icon: <QuestionAnswerOutlined style={{marginBottom:"0px"}}/>,
  //   component: <CallLog/>,
  // },
  {
    to: Routess.LogServer,
    label: 'Log Server',
    icon: <SpellcheckOutlined style={{marginBottom:"0px"}}/>,
    component: <LogServer/>,
  },
 
];

export default function MonitorTab() {
  return <TabBar tabs={tabs} />;
}
