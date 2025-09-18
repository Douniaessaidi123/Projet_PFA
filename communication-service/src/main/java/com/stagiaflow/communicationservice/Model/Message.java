package com.stagiaflow.communicationservice.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.stagiaflow.communicationservice.Controler.WsChatMessageType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;
    private LocalDateTime timestamp;
    private WsChatMessageType type;

    // CHAT, PRIVATE_CHAT, JOIN, LEAVE

    @Column(name = "room_id")
    private String roomId;

    @ManyToOne
    @JoinColumn(name = "user_id") // expéditeur
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id") // 🆕 destinataire (null si message public)
    private User receiver;


    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senderEmail; // pour WebSocket (non stocké en base)

    @Transient
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String receiverEmail;
}




