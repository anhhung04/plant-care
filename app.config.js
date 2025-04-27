export default {
  expo: {
    name: "greenhouse", // Tên ứng dụng
    version: "1.0.0", // Phiên bản ứng dụng
    icon: "./assets/icons/leaf.png", // Đường dẫn đến biểu tượng ứng dụng
    userInterfaceStyle: "automatic", // Giao diện người dùng tự động
    android: {
      package: "com.bk.greenhouse", // 👈 Must be unique!
      adaptiveIcon: {
        "foregroundImage": "./assets/icons/leaf.png",
        "backgroundColor": "#ffffff"
      },
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "686eed37-8e9a-4ce3-81fe-d07fef74809e"
      },
      API: {
        API_BASE_URL: process.env.API_BASE_URL,
        SOCKET_URL: process.env.SOCKET_URL
      }
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true
          }
        }
      ],
      ["expo-notifications",
        {
          "icon": "./assets/icons/leaf.png",
          "color": "#ffffff",
          "defaultChannel": "default",
          "sounds": [
            "./assets/aria_math.wav"
          ]
        },
      ]
    ]
  }
};