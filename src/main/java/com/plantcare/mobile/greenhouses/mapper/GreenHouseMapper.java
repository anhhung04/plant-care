package com.plantcare.mobile.greenhouses.mapper;

import com.plantcare.mobile.greenhouses.dto.request.GreenHouseCreateRequest;
import com.plantcare.mobile.greenhouses.dto.response.GreenHouseResponse;
import com.plantcare.mobile.greenhouses.entity.GreenHouses;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface GreenHouseMapper {
    GreenHouses toGreenHouses(GreenHouseCreateRequest greenHouseCreateRequest);
    GreenHouseResponse toGreenHouseResponse(GreenHouses greenHouses);
}
