package com.plantcare.mobile.greenhouses.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import java.util.List;
import java.util.UUID;

public class SubscribeRequest {
    @JsonDeserialize(contentAs = String.class)
    private List<String> greenhouseIds;

    public List<String> getGreenhouseIds() {
        return greenhouseIds;
    }

    public void setGreenhouseIds(List<String> greenhouseIds) {
        this.greenhouseIds = greenhouseIds;
    }
}
