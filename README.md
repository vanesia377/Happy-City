# Chill City

Game xây thành phố thư giãn chạy trên trình duyệt (HTML5 Canvas, không cần cài đặt hay thư viện ngoài).

## Cách chạy

Mở `index.html` bằng trình duyệt, hoặc chạy một máy chủ tĩnh:

```bash
python3 -m http.server 8000
```

rồi vào http://localhost:8000.

## Cách chơi

- **Nhà ở**: tăng dân số, cho thu tiền thuê định kỳ.
- **Ruộng**: gieo trồng nông sản để lấy hàng hóa.
- **Cửa hàng**: cần hàng hóa để mở bán, bán xong thì thu xu.
- **Đường**: nhà và cửa hàng phải kề đường mới hoạt động.
- **Trang trí / công trình công cộng**: tăng độ hạnh phúc (nhân hệ số thu nhập); trang trí còn cộng % thu nhập cho công trình xung quanh.
- **Năng lượng**: mỗi thao tác tốn 1 điểm, hồi dần theo thời gian và đầy lại khi lên cấp.
- Lên cấp để mở khóa công trình mới, làm nhiệm vụ nhận thưởng, mở rộng đất, nhận quà đăng nhập hằng ngày.
- Kéo để di chuyển bản đồ, lăn chuột / chụm hai ngón để thu phóng.

Tiến trình được lưu tự động trong `localStorage` của trình duyệt; thời gian vẫn chạy khi bạn thoát game.
