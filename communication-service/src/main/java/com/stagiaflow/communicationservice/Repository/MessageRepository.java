package com.stagiaflow.communicationservice.Repository;

import com.stagiaflow.communicationservice.Model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByReceiverIsNullOrderByTimestampAsc();

    @Query("SELECT m FROM Message m " +
            "WHERE (m.sender.id = :senderId AND m.receiver.id = :receiverId) " +
            "   OR (m.sender.id = :receiverId AND m.receiver.id = :senderId) " +
            "ORDER BY m.timestamp ASC")
    List<Message> findPrivateMessages(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId
    );
    List<Message> findByRoomIdOrderByTimestampAsc(String roomId);
    List<Message> findByReceiverIsNullAndRoomIdIsNullOrderByTimestampAsc();


}
