/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Button, Popconfirm } from '@arco-design/web-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './SideConversationDock.module.css';

type Props = {
  parentRunning: boolean;
  onPromote: () => void;
  onDiscard: () => void;
  onCollapse: () => void;
};

const SideConversationHeader: React.FC<Props> = ({ parentRunning, onPromote, onDiscard, onCollapse }) => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <span className={styles.badge}>⑂ {t('conversation.sideConversation.badge')}</span>
      <span className={parentRunning ? styles.statusRun : styles.statusDone}>
        {parentRunning
          ? t('conversation.sideConversation.parentRunning')
          : t('conversation.sideConversation.parentFinished')}
      </span>
      <div className={styles.actions}>
        <Button size='mini' type='text' onClick={onPromote}>
          {t('conversation.sideConversation.promote')}
        </Button>
        <Popconfirm title={t('conversation.sideConversation.discardConfirm')} onOk={onDiscard}>
          <Button size='mini' type='text' status='danger'>
            {t('conversation.sideConversation.discard')}
          </Button>
        </Popconfirm>
        <Button size='mini' type='text' onClick={onCollapse}>
          {t('conversation.sideConversation.close')}
        </Button>
      </div>
    </div>
  );
};

export default SideConversationHeader;
