package com.plantcare.mobile.sensor.entities;

public class Sensor {
    private String id;
    private String name;
    private String value;
    private boolean isEnabled;

    public Sensor() {}

    public Sensor(String id, String name, String value, boolean isEnabled) {
        this.id = id;
        this.name = name;
        this.value = value;
        this.isEnabled = isEnabled;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public boolean isEnabled() {
        return isEnabled;
    }

    public void setEnabled(boolean isEnabled) {
        this.isEnabled = isEnabled;
    }
}
