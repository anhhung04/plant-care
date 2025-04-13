package com.plantcare.mobile.greenhouses.dto.request;

import lombok.*;

import java.lang.reflect.Array;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GreenHouseDataServiceCreateRequest {
    private String name;
    private String location;
    private String owner;
    private Object metadata;
}
