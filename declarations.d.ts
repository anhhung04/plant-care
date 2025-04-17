declare module "*.svg" {
  import * as React from "react";
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}

declare module "expo-radio-button" {
  import { ComponentType } from "react";

  export const RadioButtonGroup: ComponentType<any>;
  export const RadioButtonItem: ComponentType<any>;
}
