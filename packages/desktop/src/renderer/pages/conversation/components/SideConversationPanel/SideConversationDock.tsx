/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import type { TChatConversation } from '@/common/config/storage';
import { renderPlatformChat } from '@/renderer/pages/conversation/components/renderPlatformChat';
import React from 'react';
import useSWR from 'swr';
import SideConversationHeader from './SideConversationHeader';
import styles from './SideConversationDock.module.css';

type Props = {
  childId: string;
  parentRunning: boolean;
  onPromote: () => void;
  onDiscard: () => void;
  onCollapse: () => void;
};

const SideConversationDock: React.FC<Props> = ({ childId, parentRunning, onPromote, onDiscard, onCollapse }) => {
  const { data: conversation } = useSWR(['conversation', childId], () =>
    ipcBridge.conversation.get.invoke({ id: childId })
  );

  return (
    <div className={styles.dock}>
      <SideConversationHeader
        parentRunning={parentRunning}
        onPromote={onPromote}
        onDiscard={onDiscard}
        onCollapse={onCollapse}
      />
      <div className={styles.body}>
        {conversation ? renderPlatformChat({ conversation: conversation as TChatConversation }) : null}
      </div>
    </div>
  );
};

export default SideConversationDock;
