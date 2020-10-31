import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Firebase from 'firebase-initialized';
import { Tooltip } from 'antd';
import {
  MdNotifications as BellIcon,
  MdNotificationsActive as BellEnabledIcon,
  MdNotificationsOff as BellDisabledIcon,
} from 'react-icons/md';

const VAPID_KEY = 'BOjplzf6CjeRCeeGZhIkyMaEoapBwRBdTBxPwr_a8WxobVdygM5IQLpuDC3WH-2ta32n6W9RfTnFZYfKVvkMmYU';

const db = Firebase.firestore();
const messaging = Firebase.messaging();

function NotificationsToggle({ token }) {
  const [enabled, setEnabled] = useState(false);

  const toggle = () => {

    const next = !enabled;
    setEnabled(next);

    db.collection('devices').doc(token).set({
      token,
      enabled: next
    });

  }

  useEffect(() => {
    db.collection('devices').doc(token).get()
      .then(snapshot => setEnabled(snapshot.data().enabled || false));
  }, []);


  const NotificationIcon = enabled ? BellEnabledIcon : BellIcon;

  return (
    <Button enabled={enabled} onClick={toggle}>
      <NotificationIcon />
    </Button>
  )
}

function Notifications({ theme }) {

  const [token, setToken] = useState(null);
  const [rejected, setRejected] = useState(false);

  const setupNotifications = (first = false) => {

    localStorage.setItem('notificationsPermissionRequested', true);

    messaging.getToken({
      vapidKey: VAPID_KEY
    })
      .then(token => {
        if (token) {
          // Permission granted
          db.collection('devices').doc(token).set({ token, ...(first ? { enabled: true } : {}) }, { merge: true })
            .then(() => setToken(token));

          if (first) {
            window.gtag('event', 'notifications-permision-granted');
          }

        } else {
          // Permission denied
          setRejected(true);
        }
      }) 
      .catch(error => {
        setRejected(true);
      })
  }

  const onClick = () => {
    setupNotifications(true);
    window.gtag('event', 'notifications-enable');
  }

  useEffect(() => {
    const requested = localStorage.getItem('notificationsPermissionRequested');
    if (requested) setupNotifications();
  }, [])


  if (rejected) {
    return (
      <Button>
        <Tooltip 
          arrowPointAtCenter
          placement="bottomRight"
          title="Notificaciones bloqueadas. Revisar la configuracion del sitio en tu navegador">
          <BellDisabledIcon />
        </Tooltip>
      </Button>
    );
  }

  if (token) {
    return (
      <NotificationsToggle token={token} />
    );
  }


  return (
    <Button enabled={false} onClick={onClick}>
      <Tooltip 
        arrowPointAtCenter
        placement="bottomRight"
        title="Activar notificaciones">
        <BellIcon />
      </Tooltip>
    </Button>
  )
}

const Button = styled.div`
  display: flex;
  align-items: center;

  svg {
    width: 20px;
    height: 20px;
    margin-right: 20px;
    cursor: pointer;
    color: ${props => props.enabled ? props.theme.highlight : 'inherit' };
  }
`;

export default Notifications;
