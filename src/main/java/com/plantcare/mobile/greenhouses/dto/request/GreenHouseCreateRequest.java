package com.plantcare.mobile.greenhouses.dto.request;

import lombok.*;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GreenHouseCreateRequest {
    private String name;
    private String location;
    private Boolean status;
    private String description;
}
