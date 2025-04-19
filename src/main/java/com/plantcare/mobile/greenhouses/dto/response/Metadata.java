package com.plantcare.mobile.greenhouses.dto.response;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Metadata {
    private Config config_led;
    private Config config_fan;
    private Config config_pump;
    private Object additionalProp1;
}