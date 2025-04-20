export default {
    name: "greenhouse", // Tên ứng dụng
    version: "1.0.0", // Phiên bản ứng dụng
    android: {
      package: "com.bk.greenhouse" // 👈 Must be unique!
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
  };