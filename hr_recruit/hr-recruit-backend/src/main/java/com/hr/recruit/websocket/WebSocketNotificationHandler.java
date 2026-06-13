package com.hr.recruit.websocket;

import com.hr.recruit.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class WebSocketNotificationHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(Notification notification) {
        String destination = "/user/" + notification.getRecipientId() + "/queue/notifications";
        messagingTemplate.convertAndSend(destination, notification);
    }

    public void sendBroadcast(String topic, Object payload) {
        messagingTemplate.convertAndSend("/topic/" + topic, payload);
    }
}
