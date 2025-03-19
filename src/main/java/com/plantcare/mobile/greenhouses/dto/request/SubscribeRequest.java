package com.plantcare.mobile.greenhouses.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.util.List;
import java.util.UUID;

public class SubscribeRequest {
    @JsonDeserialize(contentAs = UUID.class)
    private List<UUID> greenhouseIds;

    public List<UUID> getGreenhouseIds() {
        return greenhouseIds;
    }

    public void setGreenhouseIds(List<UUID> greenhouseIds) {
        this.greenhouseIds = greenhouseIds;
    }
}
