# Chill City

Game xây thành phố 3D thư giãn chạy trên trình duyệt (Three.js, đã đóng gói sẵn trong `vendor/`, không cần cài đặt).

## Cách chạy

Mở `index.html` bằng trình duyệt (cần hỗ trợ WebGL), hoặc chạy một máy chủ tĩnh:

```bash
python3 -m http.server 8000
```

rồi vào http://localhost:8000.

## Cách chơi

- **Nhà ở**: tăng dân số, thu tiền thuê định kỳ. **Cửa hàng**: cần hàng hóa để mở bán, bán xong thu xu.
- **Đường**: nhà và cửa hàng phải kề đường mới hoạt động; xe cộ chạy trên đường.
- **Trồng trọt**: gieo hạt, tưới nước (lớn nhanh hơn 30%), bắt sâu (không bắt thì mất 30% sản lượng), rồi thu hoạch. Cây chín để quá lâu sẽ **héo**; có thể dọn ruộng hoặc dùng kim cương để hồi sinh. Thỉnh thoảng trời mưa sẽ tưới giúp.
- **Chăn nuôi** (Chuồng gà, Trại bò sữa, Trại cừu): cho vật nuôi ăn bằng nông sản, chờ rồi thu trứng, sữa, len. Vật nuôi đi lại trong chuồng.
- **Nhà máy chế biến** (Lò bánh mì, Nhà máy sữa, Xưởng dệt, Xưởng bánh ngọt): biến trứng, sữa, len thành bánh mì, bánh quy, phô mai, bơ, khăn len, áo len, bánh kem. Nhà máy bốc khói khi đang làm.
- **Đơn hàng**: xe tải đặt hàng trong 🧺 Chợ; giao đủ hàng để nhận nhiều xu và XP hơn bán lẻ.
- **Nâng cấp** nhà và cửa hàng tối đa cấp 3 (mỗi cấp +50% thu nhập và dân số).
- **Chợ** (nút 🧺 trên thanh công cụ): mua bán nông sản, bán sản phẩm trong kho, giao đơn hàng.
- **Trang trí / công trình công cộng**: tăng độ hạnh phúc và thu nhập của công trình xung quanh.
- **Năng lượng**, lên cấp, nhiệm vụ, mở rộng đất, quà đăng nhập hằng ngày.
- **Camera 3D**: kéo để di chuyển; chuột phải hoặc Shift + kéo để xoay và nghiêng; lăn chuột để thu phóng; trên điện thoại chụm hoặc xoay hai ngón; phím Q/E xoay, mũi tên/WASD di chuyển; có nút điều khiển bên phải. Ngày và đêm, đổ bóng, mưa có thể bật tắt trong Cài đặt.

Tiến trình tự lưu trong `localStorage`; thời gian (kể cả cây héo) vẫn chạy khi bạn thoát game.
