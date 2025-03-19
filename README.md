# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## Introduction

1. Dự án bao gồm 3 thư mục chính: app, src và assets.

   - /app: bao gồm các route trong ứng dụng
      + _layout: định nghĩa root layer của toàn bộ ứng dụng
      + auth: dùng cho các trang xác thực
      + (tabs): các trang trong ứng dụng
         * dashboard.tsx: Trang tổng quan
         * index.tsx: Trang chủ
         * profile.tsx: Trang hồ sơ người dùng
         * reminder.tsx: Trang nhắc nhở
         * setting.tsx: Trang cài đặt
   
   - /src: bao gồm các component, context, hooks, services, styles và utils bổ trợ cho ứng dụng
      + components: chứa các thành phần giao diện
         * ChangeAreaModal.tsx: Modal thay đổi khu đất
         * CreateReminderModal.tsx: Modal tạo nhắc nhở
         * ListItem.tsx: Thành phần danh sách trong reminder
         * NotiModal.tsx: Modal thông báo
         * ReminerCreateForm.tsx: Biểu mẫu tạo reminder
         * ReportModal.tsx: Modal report bug
         * onboarding/: Các thành phần liên quan đến quá trình onboarding
      + context: chứa các context providers
         * AuthContext.tsx: Context xác thực
      + hooks: chứa các custom hooks
      + services: chứa các hàm dịch vụ cho các API calls và logic khác
      + styles: chứa các định nghĩa style
         * AuthStyle.tsx: Style cho các trang xác thực
         * PageStyle.tsx: Style chung cho các trang
      + utils: chứa các hàm tiện ích và helpers

   - /assets: chứa ảnh và animation
