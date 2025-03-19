import { useFonts } from "expo-font";
import {
  NotoSans_300Light,
  NotoSans_400Regular,
  NotoSans_500Medium,
  NotoSans_600SemiBold,
  NotoSans_700Bold,
} from '@expo-google-fonts/noto-sans';

export async function useCustomFonts() {
  let [fontsLoaded] = useFonts({
    NotoSans_300Light,
    NotoSans_400Regular,
    NotoSans_500Medium,
    NotoSans_600SemiBold,
    NotoSans_700Bold,
  });

  return fontsLoaded;
}

export const fonts = {
  Bold: "NotoSans_700Bold",
  Light: "NotoSans_300Light",
  Regular: "NotoSans_400Regular",
  Medium: "NotoSans_500Medium",
  SemiBold: "NotoSans_600SemiBold",
};
