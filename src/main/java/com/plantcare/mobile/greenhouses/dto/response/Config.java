package com.plantcare.mobile.greenhouses.dto.response;

import lombok.*;

import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Config {
    private String mode;
    private Integer turn_off_after;
    private String turn_on_at;
    private String repeat;
    private List<String> dates;
}