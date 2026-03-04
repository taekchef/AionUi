/**
 * @license
 * Copyright 2025 AionUi (aionui.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import type { IMessageText, TMessage } from '@/common/chatLib';
import { dispatchChatMessageJump } from '@/renderer/utils/chatMinimapEvents';
import { Empty, Popover, Spin } from '@arco-design/web-react';
import classNames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ConversationTitleMinimapProps {
  title?: React.ReactNode;
  conversationId?: string;
}

interface TurnPreviewItem {
  index: number;
  question: string;
  answer: string;
  messageId?: string;
  msgId?: string;
}

const MAX_LINE_LEN = 92;

const isTextMessage = (message: TMessage): message is IMessageText => {
  return message.type === 'text' && typeof message.content?.content === 'string';
};

const normalizeText = (value: string) => value.replace(/\s+/g, ' ').trim();

const truncate = (value: string, maxLen = MAX_LINE_LEN) => {
  if (value.length <= maxLen) return value;
  return `${value.slice(0, maxLen - 1)}…`;
};

const buildTurnPreview = (messages: TMessage[]): TurnPreviewItem[] => {
  const turns: TurnPreviewItem[] = [];
  let turnIndex = 0;
  let currentTurn: TurnPreviewItem | null = null;

  for (const message of messages) {
    if (!isTextMessage(message)) continue;

    const text = normalizeText(message.content.content || '');
    if (!text) continue;

    if (message.position === 'right') {
      if (currentTurn) {
        turns.push(currentTurn);
      }
      turnIndex += 1;
      currentTurn = {
        index: turnIndex,
        question: truncate(text),
        answer: '',
        messageId: message.id,
        msgId: message.msg_id,
      };
      continue;
    }

    if (message.position === 'left' && currentTurn) {
      if (!currentTurn.answer) {
        currentTurn.answer = truncate(text);
      }
      continue;
    }
  }

  if (currentTurn) {
    turns.push(currentTurn);
  }

  return turns;
};

const ConversationTitleMinimap: React.FC<ConversationTitleMinimapProps> = ({ title, conversationId }) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<TurnPreviewItem[]>([]);

  useEffect(() => {
    setVisible(false);
    setLoading(false);
    setItems([]);
  }, [conversationId]);

  const fetchTurnPreview = useCallback(async () => {
    if (!conversationId) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const messages = await ipcBridge.database.getConversationMessages.invoke({
        conversation_id: conversationId,
        page: 0,
        pageSize: 10000,
      });
      setItems(buildTurnPreview(messages || []));
    } catch (error) {
      console.error('[ConversationTitleMinimap] Failed to load conversation messages:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const handleVisibleChange = useCallback(
    (nextVisible: boolean) => {
      setVisible(nextVisible);
      if (nextVisible) {
        void fetchTurnPreview();
      }
    },
    [fetchTurnPreview]
  );

  const contentNode = useMemo(() => {
    if (loading) {
      return (
        <div className='w-360px h-180px flex-center'>
          <Spin />
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className='w-360px p-12px'>
          <Empty description={t('conversation.minimap.empty', { defaultValue: 'No Q&A turns yet' })} />
        </div>
      );
    }

    return (
      <div className='w-420px max-w-[72vw] max-h-420px flex flex-col'>
        <div className='px-12px py-8px border-b border-solid border-[var(--color-border-2)] text-12px text-t-secondary'>
          {t('conversation.minimap.title', { defaultValue: 'Conversation Minimap' })} · {items.length}
        </div>
        <div className='overflow-y-auto py-6px'>
          {items.map((item) => (
            <button
              key={`${item.index}-${item.messageId || item.msgId || 'unknown'}`}
              type='button'
              className='w-full text-left px-12px py-8px border-none bg-transparent hover:bg-fill-2 transition-colors cursor-pointer'
              onClick={() => {
                if (!conversationId) return;
                dispatchChatMessageJump({
                  conversationId,
                  messageId: item.messageId,
                  msgId: item.msgId,
                  align: 'start',
                  behavior: 'smooth',
                });
                setVisible(false);
              }}
            >
              <div className='text-11px text-t-secondary mb-2px'>#{item.index}</div>
              <div className='text-13px text-t-primary font-medium leading-18px'>Q: {item.question}</div>
              {item.answer && <div className='text-12px text-t-secondary leading-18px mt-2px'>A: {item.answer}</div>}
            </button>
          ))}
        </div>
      </div>
    );
  }, [conversationId, items, loading, t]);

  return (
    <Popover trigger='hover' position='bottom' content={contentNode} popupVisible={visible} onVisibleChange={handleVisibleChange} unmountOnExit popupHoverStay>
      <span className={classNames('font-bold text-16px text-t-primary inline-block overflow-hidden text-ellipsis whitespace-nowrap max-w-full cursor-pointer', visible && 'text-[rgb(var(--primary-6))]')}>{title}</span>
    </Popover>
  );
};

export default ConversationTitleMinimap;
