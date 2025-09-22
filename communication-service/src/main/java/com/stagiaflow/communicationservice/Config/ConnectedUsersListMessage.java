package com.stagiaflow.communicationservice.Config;

import java.util.Set;

public class ConnectedUsersListMessage {

    private String type = "CONNECTED_USERS_LIST";
    private Set<String> users;

    // ✅ Constructeur vide nécessaire pour la sérialisation JSON
    public ConnectedUsersListMessage() {
    }

    public ConnectedUsersListMessage(Set<String> users) {
        this.users = users;
    }

    public String getType() {
        return type;
    }

    public Set<String> getUsers() {
        return users;
    }

    public void setUsers(Set<String> users) {
        this.users = users;
    }
}
