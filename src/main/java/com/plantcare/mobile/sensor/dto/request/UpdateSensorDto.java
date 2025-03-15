package com.plantcare.mobile.sensor.dto.request;


public class UpdateSensorDto {
    private String name;
    private String value;
    private boolean isEnabled;

    public UpdateSensorDto() {}

    public UpdateSensorDto(String name, String value, boolean isEnabled) {
        this.name = name;
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}