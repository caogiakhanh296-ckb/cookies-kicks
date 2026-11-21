(function () {
  if (typeof window !== 'undefined' && typeof window.fetch === 'function' && !window.__ckOrigFetch) {
    window.__ckOrigFetch = window.fetch.bind(window);
  }
  if (typeof window !== 'undefined' && window.location && /\.github\.io$/i.test(window.location.hostname) && typeof window.fetch === 'function' && !window.__ckGhApiHooked) {
    window.__ckGhApiHooked = true;
    const origFetch = window.__ckOrigFetch || window.fetch.bind(window);
    const apiBase = 'https://cookieskicks-store-2026.netlify.app';
    window.fetch = function (input, init) {
      if (typeof input === 'string' && input.startsWith('/api/')) {
        if (typeof window.__ckGhApiHandler === 'function') {
          return window.__ckGhApiHandler(input, init);
        }
        return origFetch(apiBase + input, init);
      }
      return origFetch(input, init);
    };
  }
  const SIZE_CHARTS = {
    nike_jordan: {
      key: 'nike_jordan',
      label: 'Nike & Jordan',
      shortLabel: 'Nike / Jordan',
      officialTitle: "Bảng Size Chính Hãng Nike & Jordan (Men's Footwear — nike.com)",
      sourceDomain: 'nike.com',
      brands: ['Nike', 'Jordan'],
      tagColLabel: 'Tem JP / CM',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Bảng size Nam chính hãng Nike & Jordan không sản xuất các nấc lẻ EU 39.5, 41.5 và 43.5. Lưu ý thông số CM/JP in trên tem hộp lớn hơn chiều dài bàn chân thực tế khoảng 0.7–0.8 cm (ví dụ US 9 = EU 42.5 = Tem 27.0 cm, vừa đẹp cho bàn chân dài ~26.2 cm).',
      rows: [
        { eu: '38', us: '5.5', uk: '5', tag: '24.0 cm', footCm: 23.3 },
        { eu: '38.5', us: '6', uk: '5.5', tag: '24.0 cm', footCm: 23.7 },
        { eu: '39', us: '6.5', uk: '6', tag: '24.5 cm', footCm: 24.1 },
        { eu: '40', us: '7', uk: '6', tag: '25.0 cm', footCm: 24.5 },
        { eu: '40.5', us: '7.5', uk: '6.5', tag: '25.5 cm', footCm: 25.0 },
        { eu: '41', us: '8', uk: '7', tag: '26.0 cm', footCm: 25.4 },
        { eu: '42', us: '8.5', uk: '7.5', tag: '26.5 cm', footCm: 25.8 },
        { eu: '42.5', us: '9', uk: '8', tag: '27.0 cm', footCm: 26.2 },
        { eu: '43', us: '9.5', uk: '8.5', tag: '27.5 cm', footCm: 26.7 },
        { eu: '44', us: '10', uk: '9', tag: '28.0 cm', footCm: 27.1 },
        { eu: '44.5', us: '10.5', uk: '9.5', tag: '28.5 cm', footCm: 27.5 },
        { eu: '45', us: '11', uk: '10', tag: '29.0 cm', footCm: 27.9 },
        { eu: '45.5', us: '11.5', uk: '10.5', tag: '29.5 cm', footCm: 28.3 },
        { eu: '46', us: '12', uk: '11', tag: '30.0 cm', footCm: 28.8 },
      ],
    },
    anta: {
      key: 'anta',
      label: 'Anta',
      shortLabel: 'Anta',
      officialTitle: "Bảng Size Chính Hãng ANTA (Men's Basketball & Running — anta.com)",
      sourceDomain: 'anta.com',
      brands: ['Anta', '361°', 'Peak', 'Volanti'],
      tagColLabel: 'Tem CHN (mm)',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Tem hộp ANTA chính hãng in chỉ số CHN (mm) trùng sát với chiều dài bàn chân thực tế: US 8.5 = EUR 42 = CHN 260 (bàn chân ~26.0 cm); US 9 = EUR 42.5 = CHN 265 (bàn chân ~26.5 cm). Phom mũi giày châu Á thoải mái hơn Nike EP.',
      rows: [
        { eu: '39', us: '6.5', uk: '5.5', tag: '245 mm', footCm: 24.5 },
        { eu: '40', us: '7', uk: '6', tag: '250 mm', footCm: 25.0 },
        { eu: '40.5', us: '7.5', uk: '6.5', tag: '252 mm', footCm: 25.2 },
        { eu: '41', us: '8', uk: '7', tag: '255 mm', footCm: 25.5 },
        { eu: '42', us: '8.5', uk: '7.5', tag: '260 mm', footCm: 26.0 },
        { eu: '42.5', us: '9', uk: '8', tag: '265 mm', footCm: 26.5 },
        { eu: '43', us: '9.5', uk: '8.5', tag: '270 mm', footCm: 26.8 },
        { eu: '44', us: '10', uk: '9', tag: '275 mm', footCm: 27.2 },
        { eu: '44.5', us: '10.5', uk: '9.5', tag: '278 mm', footCm: 27.6 },
        { eu: '45', us: '11', uk: '10', tag: '280 mm', footCm: 28.0 },
        { eu: '46', us: '12', uk: '11', tag: '290 mm', footCm: 29.0 },
      ],
    },
    wade: {
      key: 'wade',
      label: 'Way of Wade',
      shortLabel: 'Way of Wade',
      officialTitle: 'Bảng Size Chính Hãng Way of Wade (wayofwade.com)',
      sourceDomain: 'wayofwade.com',
      brands: ['Way of Wade'],
      tagColLabel: 'Tem CHN (mm)',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Lưu ý quan trọng: Way of Wade (Dwyane Wade) sử dụng thang đo EU phân số 1/3 & 2/3 khác với Nike! Ví dụ cùng size US 9 (CHN 265 mm) thì Way of Wade ghi EU 42 1/3 trong khi Nike ghi EU 42.5. Hãy đối chiếu theo size US hoặc chiều dài bàn chân (cm)!',
      rows: [
        { eu: '38 1/3', us: '6', uk: '5', tag: '235 mm', footCm: 23.5 },
        { eu: '39', us: '6.5', uk: '5.5', tag: '240 mm', footCm: 24.0 },
        { eu: '39 2/3', us: '7', uk: '6', tag: '245 mm', footCm: 24.5 },
        { eu: '40 1/3', us: '7.5', uk: '6.5', tag: '250 mm', footCm: 25.0 },
        { eu: '41', us: '8', uk: '7', tag: '255 mm', footCm: 25.5 },
        { eu: '41 2/3', us: '8.5', uk: '7.5', tag: '260 mm', footCm: 26.0 },
        { eu: '42 1/3', us: '9', uk: '8', tag: '265 mm', footCm: 26.5 },
        { eu: '43', us: '9.5', uk: '8.5', tag: '270 mm', footCm: 27.0 },
        { eu: '43 2/3', us: '10', uk: '9', tag: '275 mm', footCm: 27.5 },
        { eu: '44 1/3', us: '10.5', uk: '9.5', tag: '280 mm', footCm: 28.0 },
        { eu: '45', us: '11', uk: '10', tag: '285 mm', footCm: 28.5 },
        { eu: '45 2/3', us: '11.5', uk: '10.5', tag: '290 mm', footCm: 29.0 },
        { eu: '46 1/3', us: '12', uk: '11', tag: '295 mm', footCm: 29.5 },
      ],
    },
    lining: {
      key: 'lining',
      label: 'Li-Ning Basketball',
      shortLabel: 'Li-Ning',
      officialTitle: 'Bảng Size Chính Hãng Li-Ning Basketball (lining.com)',
      sourceDomain: 'lining.com',
      brands: ['Li-Ning'],
      tagColLabel: 'Tem CHN (mm)',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Lưu ý quan trọng: Li-Ning Basketball (Gamma, Liren, YuShuai, Sonic, BadFive) sử dụng thang đo EU phân số 1/3 & 2/3 (US 9 = CHN 265 mm = EU 42 1/3). Hãy đối chiếu theo size US hoặc chiều dài bàn chân (cm)!',
      rows: [
        { eu: '38 1/3', us: '6', uk: '5', tag: '235 mm', footCm: 23.5 },
        { eu: '39', us: '6.5', uk: '5.5', tag: '240 mm', footCm: 24.0 },
        { eu: '39 2/3', us: '7', uk: '6', tag: '245 mm', footCm: 24.5 },
        { eu: '40 1/3', us: '7.5', uk: '6.5', tag: '250 mm', footCm: 25.0 },
        { eu: '41', us: '8', uk: '7', tag: '255 mm', footCm: 25.5 },
        { eu: '41 2/3', us: '8.5', uk: '7.5', tag: '260 mm', footCm: 26.0 },
        { eu: '42 1/3', us: '9', uk: '8', tag: '265 mm', footCm: 26.5 },
        { eu: '43', us: '9.5', uk: '8.5', tag: '270 mm', footCm: 27.0 },
        { eu: '43 2/3', us: '10', uk: '9', tag: '275 mm', footCm: 27.5 },
        { eu: '44 1/3', us: '10.5', uk: '9.5', tag: '280 mm', footCm: 28.0 },
        { eu: '45', us: '11', uk: '10', tag: '285 mm', footCm: 28.5 },
        { eu: '45 2/3', us: '11.5', uk: '10.5', tag: '290 mm', footCm: 29.0 },
        { eu: '46 1/3', us: '12', uk: '11', tag: '295 mm', footCm: 29.5 },
      ],
    },
    rigorer: {
      key: 'rigorer',
      label: 'Rigorer',
      shortLabel: 'Rigorer',
      officialTitle: 'Bảng Size Chính Hãng Rigorer Austin Reaves Series (rigorer.com)',
      sourceDomain: 'rigorer.com',
      brands: ['Rigorer', 'SPO'],
      tagColLabel: 'Tem CHN (mm)',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Cảnh báo lệch hệ EU của Rigorer: Trên bảng hãng Rigorer, US 8.5 = EU 41.5 (260 mm), US 9 = EU 42 (265 mm) và US 10 = EU 43 (270 mm) — nhỏ hơn 0.5 đến 1 số EU so với Nike ở cùng size US! Luôn chọn theo size US hoặc chiều dài bàn chân (cm).',
      rows: [
        { eu: '39.5', us: '7', uk: '6', tag: '245 mm', footCm: 24.5 },
        { eu: '40', us: '7.5', uk: '6.5', tag: '250 mm', footCm: 25.0 },
        { eu: '41', us: '8', uk: '7', tag: '255 mm', footCm: 25.5 },
        { eu: '41.5', us: '8.5', uk: '7.5', tag: '260 mm', footCm: 26.0 },
        { eu: '42', us: '9', uk: '8', tag: '265 mm', footCm: 26.5 },
        { eu: '42.5', us: '9.5', uk: '8.5', tag: '268 mm', footCm: 26.8 },
        { eu: '43', us: '10', uk: '9', tag: '270 mm', footCm: 27.0 },
        { eu: '44', us: '10.5', uk: '9.5', tag: '275 mm', footCm: 27.5 },
        { eu: '44.5', us: '11', uk: '10', tag: '280 mm', footCm: 28.0 },
        { eu: '45', us: '11.5', uk: '10.5', tag: '285 mm', footCm: 28.5 },
        { eu: '46', us: '12', uk: '11', tag: '290 mm', footCm: 29.0 },
      ],
    },
    adidas: {
      key: 'adidas',
      label: 'Adidas Adizero',
      shortLabel: 'Adidas',
      officialTitle: 'Bảng Size Chính Hãng Adidas Running / Adizero (adidas.com)',
      sourceDomain: 'adidas.com',
      brands: ['Adidas'],
      tagColLabel: 'Tem JP (mm)',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Adidas dùng hệ EU phân số 1/3 và 2/3 chuẩn châu Âu (40 2/3, 41 1/3, 42, 42 2/3, 43 1/3, 44 2/3). Ví dụ US 9 = UK 8.5 = EU 42 2/3 = JP 270 (chân ~26.3 cm). Khi chạy cự ly 21km–42km nên tăng thêm +2/3 EU (+0.5 US) để trừ hao bàn chân nở nhiệt.',
      rows: [
        { eu: '38', us: '5.5', uk: '5', tag: '235 mm', footCm: 23.3 },
        { eu: '38 2/3', us: '6', uk: '5.5', tag: '240 mm', footCm: 23.8 },
        { eu: '39 1/3', us: '6.5', uk: '6', tag: '245 mm', footCm: 24.2 },
        { eu: '40', us: '7', uk: '6.5', tag: '250 mm', footCm: 24.6 },
        { eu: '40 2/3', us: '7.5', uk: '7', tag: '255 mm', footCm: 25.0 },
        { eu: '41 1/3', us: '8', uk: '7.5', tag: '260 mm', footCm: 25.5 },
        { eu: '42', us: '8.5', uk: '8', tag: '265 mm', footCm: 25.9 },
        { eu: '42 2/3', us: '9', uk: '8.5', tag: '270 mm', footCm: 26.3 },
        { eu: '43 1/3', us: '9.5', uk: '9', tag: '275 mm', footCm: 26.7 },
        { eu: '44', us: '10', uk: '9.5', tag: '280 mm', footCm: 27.1 },
        { eu: '44 2/3', us: '10.5', uk: '10', tag: '285 mm', footCm: 27.6 },
        { eu: '45 1/3', us: '11', uk: '10.5', tag: '290 mm', footCm: 28.0 },
        { eu: '46', us: '11.5', uk: '11', tag: '295 mm', footCm: 28.4 },
      ],
    },
    shimano: {
      key: 'shimano',
      label: 'Shimano Cycling',
      shortLabel: 'Shimano',
      officialTitle: 'Bảng Size Chính Hãng Giày Đạp Xe Shimano Road (SH-RC502 — bike.shimano.com)',
      sourceDomain: 'bike.shimano.com',
      brands: ['Shimano'],
      tagColLabel: 'Tem CM',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Đế nylon gia cố sợi thủy tinh của Shimano RC502 cứng hoàn toàn để truyền lực bàn đạp tối đa và không co giãn theo thời gian. Chân thon đi đúng bảng CM; bàn chân bè ngang bắt buộc tăng +0.5 đến +1.0 EU.',
      rows: [
        { eu: '38', us: '5.2', uk: '4.2', tag: '23.8 cm', footCm: 23.8 },
        { eu: '39', us: '5.8', uk: '4.8', tag: '24.5 cm', footCm: 24.5 },
        { eu: '39.5', us: '6.2', uk: '5.2', tag: '24.8 cm', footCm: 24.8 },
        { eu: '40', us: '6.5', uk: '5.5', tag: '25.2 cm', footCm: 25.2 },
        { eu: '40.5', us: '7.2', uk: '6.2', tag: '25.5 cm', footCm: 25.5 },
        { eu: '41', us: '7.6', uk: '6.6', tag: '25.8 cm', footCm: 25.8 },
        { eu: '41.5', us: '8.0', uk: '7.0', tag: '26.2 cm', footCm: 26.2 },
        { eu: '42', us: '8.3', uk: '7.3', tag: '26.5 cm', footCm: 26.5 },
        { eu: '42.5', us: '8.7', uk: '7.7', tag: '26.8 cm', footCm: 26.8 },
        { eu: '43', us: '8.9', uk: '7.9', tag: '27.2 cm', footCm: 27.2 },
        { eu: '43.5', us: '9.5', uk: '8.5', tag: '27.5 cm', footCm: 27.5 },
        { eu: '44', us: '9.7', uk: '8.7', tag: '27.8 cm', footCm: 27.8 },
        { eu: '44.5', us: '10.1', uk: '9.1', tag: '28.2 cm', footCm: 28.2 },
        { eu: '45', us: '10.5', uk: '9.5', tag: '28.5 cm', footCm: 28.5 },
        { eu: '46', us: '11.2', uk: '10.2', tag: '29.2 cm', footCm: 29.2 },
      ],
    },
    yonex_victor: {
      key: 'yonex_victor',
      label: 'Yonex & Victor Badminton',
      shortLabel: 'Yonex / Victor',
      officialTitle: 'Bảng Size Chính Hãng Cầu Lông Yonex & Victor (yonex.com / victorsport.com)',
      sourceDomain: 'yonex.com',
      brands: ['Yonex', 'Victor'],
      tagColLabel: 'Tem CM / MM',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Giày cầu lông Yonex (65Z3/65Z4) và Victor (A970 NitroLite) tính chuẩn theo thông số CM in trên tem lưỡi gà (ví dụ 26.5 cm = EU 41 Yonex / EU 42 Victor). Hãy đo chiều dài bàn chân (cm) và cộng +0.5 cm trừ hao vớ cầu lông dày khi dậm nhảy cứu cầu.',
      rows: [
        { eu: '39', us: '6.5', uk: '6', tag: '24.5 cm', footCm: 24.2 },
        { eu: '39.5', us: '7', uk: '6.5', tag: '25.0 cm', footCm: 24.7 },
        { eu: '40', us: '7.5', uk: '7', tag: '25.5 cm', footCm: 25.2 },
        { eu: '40.5', us: '8', uk: '7.5', tag: '26.0 cm', footCm: 25.7 },
        { eu: '41', us: '8.5', uk: '8', tag: '26.5 cm', footCm: 26.2 },
        { eu: '42', us: '9', uk: '8.5', tag: '27.0 cm', footCm: 26.7 },
        { eu: '43', us: '9.5', uk: '9', tag: '27.5 cm', footCm: 27.2 },
        { eu: '44', us: '10', uk: '9.5', tag: '28.0 cm', footCm: 27.7 },
        { eu: '44.5', us: '10.5', uk: '10', tag: '28.5 cm', footCm: 28.2 },
        { eu: '45', us: '11', uk: '10.5', tag: '29.0 cm', footCm: 28.7 },
      ],
    },
    asics_court: {
      key: 'asics_court',
      label: 'Asics Tennis & Pickleball',
      shortLabel: 'Asics Court',
      officialTitle: 'Bảng Size Chính Hãng Asics Tennis & Pickleball (Court FF 3 / Gel-Resolution — asics.com)',
      sourceDomain: 'asics.com',
      brands: ['Asics'],
      tagColLabel: 'Tem CM',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Asics Tennis/Pickleball sử dụng hệ EU chuẩn (không có EU 41 và 43, thay bằng 40.5, 41.5, 42, 42.5, 43.5, 44). Dòng Court FF 3 có lưỡi gà liền MONO-SOCK ôm sát cổ chân, bàn chân bè ngang khuyên tăng +0.5 size US.',
      rows: [
        { eu: '39', us: '6', uk: '5', tag: '24.5 cm', footCm: 24.2 },
        { eu: '39.5', us: '6.5', uk: '5.5', tag: '25.0 cm', footCm: 24.7 },
        { eu: '40', us: '7', uk: '6', tag: '25.25 cm', footCm: 25.0 },
        { eu: '40.5', us: '7.5', uk: '6.5', tag: '25.5 cm', footCm: 25.4 },
        { eu: '41.5', us: '8', uk: '7', tag: '26.0 cm', footCm: 25.8 },
        { eu: '42', us: '8.5', uk: '7.5', tag: '26.5 cm', footCm: 26.2 },
        { eu: '42.5', us: '9', uk: '8', tag: '27.0 cm', footCm: 26.7 },
        { eu: '43.5', us: '9.5', uk: '8.5', tag: '27.5 cm', footCm: 27.1 },
        { eu: '44', us: '10', uk: '9', tag: '28.0 cm', footCm: 27.6 },
        { eu: '44.5', us: '10.5', uk: '9.5', tag: '28.25 cm', footCm: 28.0 },
        { eu: '45', us: '11', uk: '10', tag: '28.5 cm', footCm: 28.4 },
        { eu: '46', us: '11.5', uk: '10.5', tag: '29.0 cm', footCm: 28.9 },
      ],
    },
    kailas_xtep: {
      key: 'kailas_xtep',
      label: 'Kailas Trail · Xtep · Qiaodan',
      shortLabel: 'Kailas / Xtep / Qiaodan',
      officialTitle: 'Bảng Size Chính Hãng Kailas Trail & Xtep / Qiaodan Carbon Running',
      sourceDomain: 'kailasgear.com',
      brands: ['Kailas', 'Xtep', 'Qiaodan'],
      tagColLabel: 'Tem CHN (mm)',
      footColLabel: 'Chiều dài chân (cm)',
      brandNote: 'Các dòng chạy Marathon Carbon (Xtep 160X, Qiaodan Plaid) và chạy địa hình Trail (Kailas Fuga EX3 / DU2 Vibram) tính chuẩn theo hệ CHN (mm): US 8.5 = EU 42 = CHN 260 mm; US 9 = EU 42.5 = CHN 265 mm. Chạy Trail đổ dốc dài nên tăng +0.5 đến +1.0 size EU để bảo vệ móng chân.',
      rows: [
        { eu: '39', us: '6.5', uk: '5.5', tag: '245 mm', footCm: 24.3 },
        { eu: '40', us: '7', uk: '6', tag: '250 mm', footCm: 24.8 },
        { eu: '40.5', us: '7.5', uk: '6.5', tag: '252 mm', footCm: 25.1 },
        { eu: '41', us: '8', uk: '7', tag: '255 mm', footCm: 25.5 },
        { eu: '42', us: '8.5', uk: '7.5', tag: '260 mm', footCm: 26.0 },
        { eu: '42.5', us: '9', uk: '8', tag: '265 mm', footCm: 26.5 },
        { eu: '43', us: '9.5', uk: '8.5', tag: '270 mm', footCm: 26.9 },
        { eu: '44', us: '10', uk: '9', tag: '275 mm', footCm: 27.4 },
        { eu: '44.5', us: '10.5', uk: '9.5', tag: '278 mm', footCm: 27.8 },
        { eu: '45', us: '11', uk: '10', tag: '280 mm', footCm: 28.2 },
        { eu: '46', us: '12', uk: '11', tag: '290 mm', footCm: 29.0 },
      ],
    },
  };

  Object.keys(SIZE_CHARTS).forEach(function (k) {
    SIZE_CHARTS[k].sizes = SIZE_CHARTS[k].rows.map(function (r) { return r.eu; });
  });

  const MODEL_FIT = {
    ja3: {
      group: 'ja3', label: 'Nike Ja 3', brand: 'Nike', chartKey: 'nike_jordan',
      fitBadge: 'Ôm mũi · Chân bè +0.5 US',
      fitAdvice: 'Phom low-top tốc độ ôm sát phần mũi (forefoot lockdown). Chân thon đi chuẩn bảng Nike; chân bè ngang hoặc mang vớ Elite dày nên tăng +0.5 size US (ví dụ 42 lên 42.5).',
      snugExtraCm: 0.2, wideExtraCm: 0.6,
    },
    book1: {
      group: 'book1', label: 'Nike Book 1', brand: 'Nike', chartKey: 'nike_jordan',
      fitBadge: 'Ôm ngang · Chân bè +0.5 US',
      fitAdvice: 'Upper dày dặn phong cách cổ điển hơi bó hai bên mũi trong vài buổi đầu break-in. Chân thon đi đúng size; chân bè hoặc mu bàn chân cao nên tăng +0.5 size US.',
      snugExtraCm: 0.2, wideExtraCm: 0.6,
    },
    lebron23: {
      group: 'lebron23', label: 'Nike LeBron 23', brand: 'Nike', chartKey: 'nike_jordan',
      fitBadge: 'Chuẩn size (True to Size)',
      fitAdvice: 'Khung giày đầm chắc, khoang mũi cân đối chuẩn Nike Basketball. Chân thon/trung bình chọn đúng bảng size; chân bè nhiều tăng +0.5 size US.',
      snugExtraCm: 0.0, wideExtraCm: 0.45,
    },
    tatum4: {
      group: 'tatum4', label: 'Jordan Tatum 4', brand: 'Jordan', chartKey: 'nike_jordan',
      fitBadge: 'Chuẩn size Jordan (TTS)',
      fitAdvice: 'Trọng lượng siêu nhẹ, gót khóa êm và khoang mũi vừa vặn chuẩn Jordan Brand. Đi đúng size thường mang của Nike/Jordan (chân bè nhiều tăng +0.5 size US).',
      snugExtraCm: 0.0, wideExtraCm: 0.45,
    },
    kai2: {
      group: 'kai2', label: 'Anta Kai 2', brand: 'Anta', chartKey: 'anta',
      fitBadge: 'Phom châu Á · Chuẩn CHN mm',
      fitAdvice: 'Khung mũi giày châu Á của Anta thoải mái hơn Nike EP. Chân thon/vừa đi đúng bảng CHN (mm); chân bè dày tăng +0.5 size (ví dụ 42 lên 42.5).',
      snugExtraCm: 0.0, wideExtraCm: 0.5,
    },
    kai3: {
      group: 'kai3', label: 'Anta Kai 3', brand: 'Anta', chartKey: 'anta',
      fitBadge: 'Phom châu Á · Chuẩn CHN mm',
      fitAdvice: 'Đệm Nitrogen êm nảy, phom mũi cân đối chuẩn Anta Basketball. Chọn đúng theo chiều dài bàn chân (CHN mm); chân bè nhiều tăng +0.5 size.',
      snugExtraCm: 0.0, wideExtraCm: 0.5,
    },
    c2026: {
      group: 'c2026', label: 'Anta C2026 Carbon', brand: 'Anta', chartKey: 'anta',
      fitBadge: 'Giày đua Carbon · Dư mũi 0.5cm',
      fitAdvice: 'Giày chạy bộ tấm Carbon đường dài: bàn chân sẽ giãn nở sau km thứ 10–15, nên ưu tiên dư mũi 0.4–0.6 cm (tăng nhẹ +0.5 size nếu chạy 21km/42km).',
      snugExtraCm: 0.4, wideExtraCm: 0.75,
    },
    wade808: {
      group: 'wade808', label: 'Way of Wade 808 5 Ultra V2', brand: 'Way of Wade', chartKey: 'wade',
      fitBadge: 'Lót rời BOOM · Ôm sát chân',
      fitAdvice: 'Sử dụng lót rời Drop-in BOOM dày nên trần mũi giày khá sát. Hãy đối chiếu theo US/CHN mm (US 9 = EU 42 1/3); chân bè bắt buộc tăng +1 nấc (ví dụ 41 2/3 lên 42 1/3).',
      snugExtraCm: 0.2, wideExtraCm: 0.6,
    },
    allcity13: {
      group: 'allcity13', label: 'Way of Wade All City 13 Encore', brand: 'Way of Wade', chartKey: 'wade',
      fitBadge: 'Chuẩn US/CHN · Bền bỉ Indoor/Outdoor',
      fitAdvice: 'Khoang mũi thoải mái hơn dòng 808. Lưu ý quy đổi chuẩn Way of Wade (US 9 = EU 42 1/3 = 265 mm, US 10 = EU 43 2/3 = 275 mm). Chân bè tăng +1 nấc.',
      snugExtraCm: 0.0, wideExtraCm: 0.5,
    },
    ar2: {
      group: 'ar2', label: 'Rigorer AR 2', brand: 'Rigorer', chartKey: 'rigorer',
      fitBadge: 'Chú ý hệ EU Rigorer (US 9 = EU 42)',
      fitAdvice: 'Cánh TPU hai bên khóa chân rất chắc. Đặc biệt lưu ý Rigorer đánh số EU nhỏ hơn Nike (US 9 = EU 42 = 265 mm; US 10 = EU 43 = 270 mm). Hãy chọn theo US hoặc CM chân!',
      snugExtraCm: 0.1, wideExtraCm: 0.5,
    },
    adiospro4: {
      group: 'adiospro4', label: 'Adidas Adizero Adios Pro 4', brand: 'Adidas', chartKey: 'adidas',
      fitBadge: 'Marathon Carbon · Nên +2/3 EU',
      fitAdvice: 'Upper Lightlock ôm gọn midfoot. Để chạy Half/Full Marathon 21km–42km không tức móng khi chân nở nhiệt, runner thường mang 42 nên chọn 42 2/3 (+0.5 US).',
      snugExtraCm: 0.35, wideExtraCm: 0.7,
    },
    rc502: {
      group: 'rc502', label: 'Shimano RC502 Road Cycling', brand: 'Shimano', chartKey: 'shimano',
      fitBadge: 'Đế cứng BOA L6 · Chân bè +0.5/1 EU',
      fitAdvice: 'Thân da tổng hợp ôm gọn bằng núm BOA L6, đế cứng truyền lực đạp xe không giãn. Chân thon đi đúng bảng CM Shimano; chân bè ngang tăng +0.5 đến +1.0 EU.',
      snugExtraCm: 0.05, wideExtraCm: 0.55,
    },
    wow12: { group: 'wow12', label: 'Way of Wade 12', brand: 'Way of Wade', chartKey: 'wade', fitBadge: 'Ôm gót Super BOOM · Chân bè +1 nấc', fitAdvice: 'Flagship WOW 12 khóa gót tuyệt đối. Chân thon/chuẩn đi đúng bảng US/CHN; chân bè tăng +1 nấc EU.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    gamma2: { group: 'gamma2', label: 'Li-Ning Gamma 2', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Siêu nhẹ ~290g · Ôm sát tốc độ', fitAdvice: 'Phom thi đấu tốc độ ôm sát bàn chân. Chọn đúng theo chiều dài CHN (mm); chân bè tăng +1 nấc EU.', snugExtraCm: 0.15, wideExtraCm: 0.55 },
    spo15: { group: 'spo15', label: 'Serious Player Only Player 1.5', brand: 'SPO', chartKey: 'rigorer', fitBadge: 'Lót rời Drop-in kép · Hợp chân bè', fitAdvice: 'Bản 1.5 mở rộng khoang mũi thân thiện chân bè hơn bản 1 Plus. Đi đúng size US thường mang.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    wow11: { group: 'wow11', label: 'Way of Wade 11', brand: 'Way of Wade', chartKey: 'wade', fitBadge: 'Bọc da Carbon Core · Chuẩn US/CHN', fitAdvice: 'Thân giày bọc chắc chắn chống lật cổ chân. Chân chuẩn chọn đúng US/CHN; chân bè tăng +1 nấc.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    kobe8: { group: 'kobe8', label: 'Nike Kobe 8 Protro', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Lót React dày · Nên +0.5 US', fitAdvice: 'Lót rời React Protro dày làm trần mũi thấp trong vài trận đầu. Khuyên tăng +0.5 size US (chân bè tăng +0.5 đến +1 US).', snugExtraCm: 0.3, wideExtraCm: 0.65 },
    kobe6: { group: 'kobe6', label: 'Nike Kobe 6 Protro', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Ôm khít 1:1 · Chân bè +0.5 US', fitAdvice: 'Khuôn Protro ôm sát bàn chân như lớp da thứ hai. Chân thon đi đúng size; chân bè ngang tăng +0.5 size US.', snugExtraCm: 0.25, wideExtraCm: 0.6 },
    aj39: { group: 'aj39', label: 'Air Jordan 39', brand: 'Jordan', chartKey: 'nike_jordan', fitBadge: 'Đệm ZoomX dày · Chuẩn size (TTS)', fitAdvice: 'Khoang mũi thoải mái chuẩn Jordan Brand, đệm ZoomX nguyên bàn cực êm. Chọn đúng size Nike/Jordan.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    gtcut3: { group: 'gtcut3', label: 'Nike G.T. Cut 3', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'ZoomX bứt tốc · Chân bè +0.5 US', fitAdvice: 'Mũi giày vát nhẹ tối ưu đổi hướng. Chân thon đi chuẩn size; chân bè tăng +0.5 size US.', snugExtraCm: 0.15, wideExtraCm: 0.55 },
    wow10low: { group: 'wow10low', label: 'Way of Wade 10 Low', brand: 'Way of Wade', chartKey: 'wade', fitBadge: 'Cổ thấp ôm vòm · Chân bè +1 nấc', fitAdvice: 'WOW 10 Low có vòm carbon ôm sát midfoot. Chân thon chọn đúng US/CHN; chân bè bắt buộc tăng +1 nấc.', snugExtraCm: 0.2, wideExtraCm: 0.6 },
    kt10: { group: 'kt10', label: 'Anta KT10', brand: 'Anta', chartKey: 'anta', fitBadge: 'Phom châu Á · Hợp chân chuẩn & bè', fitAdvice: 'Khung giày ổn định cho Shooter, mũi giày chuẩn châu Á. Chọn đúng theo chiều dài bàn chân CHN (mm).', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    yushuai18: { group: 'yushuai18', label: 'Li-Ning YuShuai 18 Ultra', brand: 'Li-Ning', chartKey: 'lining', fitBadge: '2 tấm Carbon · Chuẩn US/CHN', fitAdvice: 'Khung thân đầm chắc bảo vệ cổ chân. Chọn đúng theo bảng US/CHN của Li-Ning.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    spogame1: { group: 'spogame1', label: 'Serious Player Only Game 1', brand: 'SPO', chartKey: 'rigorer', fitBadge: 'Lót rời mỏng · Chuẩn size US', fitAdvice: 'Thiết kế tối giản cảm giác sân thật chân. Chọn đúng theo size US hoặc chiều dài CM bàn chân.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    ar2pro: { group: 'ar2pro', label: 'Rigorer AR 2', brand: 'Rigorer', chartKey: 'rigorer', fitBadge: 'Khung Cánh Bướm · Chuẩn US/CHN', fitAdvice: 'Thiết kế khung cánh bướm khóa gót, lưu ý hệ EU Rigorer nhỏ hơn Nike (US 9 = EU 42 = 265 mm).', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    liren6v2: { group: 'liren6v2', label: 'Li-Ning Liren 6 V2', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Vua hậu vệ · Hợp chuẩn & bè nhẹ', fitAdvice: 'Bản V2 đã mở rộng mũi thoải mái hơn V1. Đi êm ngay không cần break-in, chọn đúng bảng US/CHN.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    joker2gt: { group: 'joker2gt', label: '361° Joker 2 GT', brand: '361°', chartKey: 'anta', fitBadge: 'Cực hợp chân bè · Đệm CQT Extreme', fitAdvice: 'Signature của Nikola Jokić có khoang mũi rộng rãi, cực kỳ hợp bàn chân dày và bè ngang của người Việt.', snugExtraCm: 0.0, wideExtraCm: 0.35 },
    liren5low: { group: 'liren5low', label: 'Li-Ning Liren 5 Low', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Linh hoạt · Chuẩn US/CHN', fitAdvice: 'Cổ thấp xoay chuyển tự do, ôm gọn gót. Chọn đúng theo bảng chiều dài chân CHN (mm).', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    ag5pro: { group: 'ag5pro', label: '361° AG 5', brand: '361°', chartKey: 'anta', fitBadge: 'Đệm dày chống sốc · Hợp chân bè', fitAdvice: 'Khung giày đầm êm cho lối đánh bật nhảy mạnh, phom mũi châu Á thoải mái.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    volanti911: { group: 'volanti911', label: 'Volanti 911 Rocket Air', brand: 'Volanti', chartKey: 'anta', fitBadge: 'Trợ lực bật nhảy · Chuẩn CHN mm', fitAdvice: 'Đệm khí nén áp suất cao hỗ trợ bật nhảy, phom mũi chuẩn châu Á dễ mang.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    sonic12pro: { group: 'sonic12pro', label: 'Li-Ning Sonic 12', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Bền bỉ · Hợp chân chuẩn & bè', fitAdvice: 'Thân lưới gia cố chịu cày ải tốt, mũi giày dễ chịu cho cả chân chuẩn và bè nhẹ.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    sabrina2: { group: 'sabrina2', label: 'Nike Sabrina 2', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Phom gọn giống Kobe · Chân bè +0.5 US', fitAdvice: 'Phom unisex ôm gọn kiểu Kobe 5/6. Quy đổi theo đúng bảng EU/CM Nam trên web (chân bè tăng +0.5 size).', snugExtraCm: 0.2, wideExtraCm: 0.55 },
    ar1: { group: 'ar1', label: 'Rigorer AR 1', brand: 'Rigorer', chartKey: 'rigorer', fitBadge: 'Êm ái · Lưu ý US 9 = EU 42', fitAdvice: 'Đệm ShowTime Foam êm ngay từ trận đầu. Chọn theo size US hoặc chiều dài bàn chân CM.', snugExtraCm: 0.05, wideExtraCm: 0.45 },
    kt9: { group: 'kt9', label: 'Anta KT9', brand: 'Anta', chartKey: 'anta', fitBadge: 'Quai khóa gót · Hợp chân bè', fitAdvice: 'Độ ổn định cao, phom châu Á chuẩn CHN (mm) không gây tức hai bên mũi.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    badfive3: { group: 'badfive3', label: 'Li-Ning BadFive 3', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Chuyên cày bê tông · Rất hợp chân bè', fitAdvice: 'Dòng Streetball thiết kế khoang mũi rộng rãi, đế TUFF RB siêu dày cày sân xi măng.', snugExtraCm: 0.0, wideExtraCm: 0.4 },
    big3quick: { group: 'big3quick', label: '361° BIG3 5.0 Quick Pro', brand: '361°', chartKey: 'anta', fitBadge: 'Bám sân số 1 · Hợp chân chuẩn & bè', fitAdvice: 'Trọng lượng nhẹ, phom mũi 361° vừa vặn bàn chân người Việt, đi đúng chiều dài CHN (mm).', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    allcity14: { group: 'allcity14', label: 'Way of Wade All City 14', brand: 'Way of Wade', chartKey: 'wade', fitBadge: 'Vua Outdoor · Chuẩn US/CHN', fitAdvice: 'Thế hệ AC 14 mới nhất cân bằng hoàn hảo giữa độ êm BOOM và độ bền outdoor.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    sw8pro: { group: 'sw8pro', label: 'Anta Shock Wave 8 Pro', brand: 'Anta', chartKey: 'anta', fitBadge: 'Cày sân bê tông · Cực hợp chân bè', fitAdvice: 'Đế cao su gai sâu chịu mài mòn, phom bè rộng rãi cực kỳ thoải mái.', snugExtraCm: 0.0, wideExtraCm: 0.35 },
    sw7: { group: 'sw7', label: 'Anta Shock Wave 7', brand: 'Anta', chartKey: 'anta', fitBadge: 'Đầm chắc · Rất hợp chân bè', fitAdvice: 'Ôm mu bàn chân dày rất êm, chọn đúng theo chiều dài bàn chân CHN (mm).', snugExtraCm: 0.0, wideExtraCm: 0.4 },
    taichi5: { group: 'taichi5', label: 'Peak Taichi Flash 6.0', brand: 'Peak', chartKey: 'anta', fitBadge: 'Phom bè rộng · Đệm Taichi siêu êm', fitAdvice: 'Peak có phom mũi rộng hơn Nike. Chân chuẩn có thể đi đúng CM hoặc lùi nhẹ 0.5 nếu chân rất gầy.', snugExtraCm: -0.05, wideExtraCm: 0.35 },
    wadeshadow5: { group: 'wadeshadow5', label: 'Way of Wade Shadow 5', brand: 'Way of Wade', chartKey: 'wade', fitBadge: 'Nhẹ thoáng · Hợp học sinh sinh viên', fitAdvice: 'Phom dễ đi, êm nhẹ cho sân trường học. Chọn đúng theo bảng US/CHN của Way of Wade.', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    dvd2: { group: 'dvd2', label: '361° DVD 2', brand: '361°', chartKey: 'anta', fitBadge: 'Hậu vệ cày sân · Chuẩn CHN mm', fitAdvice: 'Đế bám tốt, thân giày khóa chắc hai bên. Chọn đúng theo chiều dài bàn chân (cm).', snugExtraCm: 0.0, wideExtraCm: 0.45 },
    immortality4: { group: 'immortality4', label: 'Nike Giannis Immortality 4', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Phom Nike EP · Chân bè +0.5 US', fitAdvice: 'Đế cao su dày bền bỉ ngoài trời. Chân thon đi đúng size; chân bè tăng +0.5 size US.', snugExtraCm: 0.15, wideExtraCm: 0.55 },
    ktsplash6: { group: 'ktsplash6', label: 'Anta KT Splash 6', brand: 'Anta', chartKey: 'anta', fitBadge: 'Siêu thoáng mùa hè · Hợp chân bè', fitAdvice: 'Upper lưới thoáng mát, phom mũi ANTA rộng rãi dễ mang cho học sinh sinh viên.', snugExtraCm: 0.0, wideExtraCm: 0.4 },
    kobe3: { group: 'kobe3', label: 'Nike Kobe 3 Low Protro', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Khung lưới TPU · Chân bè +0.5 US', fitAdvice: 'Kobe 3 Low Protro có lồng TPU mắt cáo ôm sát bàn chân. Chân thon đi đúng size; chân bè tăng +0.5 size US.', snugExtraCm: 0.2, wideExtraCm: 0.55 },
    kobe5: { group: 'kobe5', label: 'Nike Kobe 5 Protro', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Ôm sát 1:1 · Khuyên +0.5 US', fitAdvice: 'Kobe 5 Protro sử dụng chất liệu Flywire ép nhiệt rất ôm mũi. Khuyên tăng +0.5 size US để thoải mái khi thi đấu.', snugExtraCm: 0.25, wideExtraCm: 0.6 },
    kobe9: { group: 'kobe9', label: 'Nike Kobe 9 Protro', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Lót rời React · Chuẩn size / +0.5 US', fitAdvice: 'Kobe 9 Protro trang bị lót rời Nike React và đế ngoài vân bàn chân siêu bám. Chân thon đi đúng size; chân bè tăng +0.5 size US.', snugExtraCm: 0.15, wideExtraCm: 0.55 },
    kobe10: { group: 'kobe10', label: 'Nike Kobe 10 Protro', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Đệm Lunarlon + Zoom · Chuẩn size', fitAdvice: 'Khoang mũi Kobe 10 Protro cân đối hơn Kobe 5/6. Chân chuẩn đi đúng size Nike; chân bè tăng +0.5 size US.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    kobe11: { group: 'kobe11', label: 'Nike Kobe 11', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Lót rời Lunarlon · Chuẩn size (TTS)', fitAdvice: 'Thân lưới Engineered Mesh / Flyknit mềm mại ôm chân. Đi đúng size US/EU thường mang của Nike.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    sabrina4: { group: 'sabrina4', label: 'Nike Sabrina 4 EP', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Phom Guard linh hoạt · Chân bè +0.5 US', fitAdvice: 'Sabrina 4 EP nâng cấp đệm Cushlon 3.0 + Zoom Air mũi, phom gọn nhẹ chuẩn hậu vệ. Chân bè tăng +0.5 size US.', snugExtraCm: 0.15, wideExtraCm: 0.5 },
    book2: { group: 'book2', label: 'Nike Book 2 EP', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Đệm êm cổ điển · Chuẩn size Nike', fitAdvice: 'Thế hệ thứ hai của Devin Booker mở rộng nhẹ phần mũi thoải mái hơn Book 1. Chọn đúng bảng size Nike Men.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    gtcutacademy2: { group: 'gtcutacademy2', label: 'Nike G.T. Cut Academy 2 EP', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Đế XDR bền bỉ · Chuẩn size EP', fitAdvice: 'Phom EP châu Á rộng rãi vừa vặn kèm túi khí Zoom Air mũi. Chọn đúng size Nike thường mang.', snugExtraCm: 0.05, wideExtraCm: 0.45 },
    kd18: { group: 'kd18', label: 'Nike KD 18 EP', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Khung TPU xương sườn · Chuẩn size EP', fitAdvice: 'KD 18 EP kết hợp Air Zoom mũi và Air Strobel gót siêu êm, bản EP châu Á dễ mang.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
    bladedf01: { group: 'bladedf01', label: 'Li-Ning Blade II Pro / Thunder II Pro', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Cầu lông BOOM · Chống lật cổ chân', fitAdvice: 'Giày cầu lông cao cấp Li-Ning trang bị đệm BOOM và khung Carbon chống xoắn. Chọn theo chiều dài chân (CHN mm) cộng 0.5 cm cho vớ cầu lông dày.', snugExtraCm: 0.1, wideExtraCm: 0.45 },
    yunting: { group: 'yunting', label: 'Li-Ning Ace V2 All-Around Pro', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Toàn Năng Vương · Chuẩn CHN mm', fitAdvice: 'Phom mũi U-Shape thân thiện với bàn chân bè châu Á. Đi đúng bảng size CHN (mm) của Li-Ning.', snugExtraCm: 0.05, wideExtraCm: 0.4 },
    halbertec: { group: 'halbertec', label: 'Li-Ning Halberd III & Saga III Pro', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Khóa cổ chân vững · Sân thảm PVC', fitAdvice: 'Khung gót khóa chắc hỗ trợ các pha bật nhảy đập cầu liên tục. Chọn đúng theo bảng US/CHN của Li-Ning.', snugExtraCm: 0.05, wideExtraCm: 0.45 },
    yonex65z3: { group: 'yonex65z3', label: 'Yonex Power Cushion 65Z4 / 65Z3', brand: 'Yonex', chartKey: 'yonex_victor', fitBadge: 'Chuẩn CM Yonex · Power Cushion+', fitAdvice: 'Dòng giày cầu lông số 1 thế giới của Yonex. Luôn chọn theo thông số CM trên tem (ví dụ chân 26.0 cm chọn 26.5 cm = EU 41).', snugExtraCm: 0.1, wideExtraCm: 0.45 },
    victora970: { group: 'victora970', label: 'Victor A970 NitroLite / ACE', brand: 'Victor', chartKey: 'yonex_victor', fitBadge: 'Đệm NitroLite êm · Bảo vệ gót', fitAdvice: 'Đôi giày cầu lông bảo vệ khớp gối và cổ chân tốt nhất của Victor (Lee Zii Jia / Tai Tzu Ying). Chọn đúng theo bảng CM.', snugExtraCm: 0.1, wideExtraCm: 0.45 },
    feidian5: { group: 'feidian5', label: 'Li-Ning Feidian 6 Elite Carbon', brand: 'Li-Ning', chartKey: 'lining', fitBadge: 'Marathon Carbon · Khuyên +0.5 US', fitAdvice: 'Siêu giày đua Marathon tấm Carbon vòm + Super BOOM. Chạy cự ly 21km–42km khuyên tăng +0.5 size US để trừ hao chân nở nhiệt.', snugExtraCm: 0.2, wideExtraCm: 0.55 },
    xtep160x6: { group: 'xtep160x6', label: 'Xtep 160X 8.0 Pro / Ultra Carbon', brand: 'Xtep', chartKey: 'kailas_xtep', fitBadge: 'Kỷ lục Marathon · Chuẩn CHN mm', fitAdvice: 'Đôi giày chạy bộ tấm Carbon T700 thống trị các giải Marathon châu Á. Cự ly FM 42km nên tăng +0.5 size EU.', snugExtraCm: 0.15, wideExtraCm: 0.5 },
    qiaodanplaid: { group: 'qiaodanplaid', label: 'Qiaodan Feiying Plaid 3.0 Carbon', brand: 'Qiaodan', chartKey: 'kailas_xtep', fitBadge: 'Siêu đệm Pebax · Êm nhất phân khúc', fitAdvice: 'Đệm KungFu Pro 100% Pebax siêu đàn hồi kèm tấm Carbon 3D. Khoang mũi rộng rãi, chọn chuẩn CHN mm hoặc +0.5 khi chạy Full Marathon.', snugExtraCm: 0.1, wideExtraCm: 0.45 },
    flame4: { group: 'flame4', label: '361° Flame 4.0 Carbon', brand: '361°', chartKey: 'anta', fitBadge: 'CQT Extreme + Quikbone Carbon', fitAdvice: 'Siêu giày đua Carbon của 361° với thân lưới mỏng nhẹ thoáng khí. Đi chuẩn bảng CHN mm (tăng +0.5 cho cự ly 42km).', snugExtraCm: 0.15, wideExtraCm: 0.5 },
    kailasfugaex3: { group: 'kailasfugaex3', label: 'Kailas Fuga EX 3 / EX 330 Vibram', brand: 'Kailas', chartKey: 'kailas_xtep', fitBadge: 'Vua Trail Châu Á · Khuyên +0.5–1.0 EU', fitAdvice: 'Giày chạy địa hình Kailas dùng đế Vibram Megagrip và khóa dây 2 vùng AWS 3.0. Bắt buộc tăng +0.5 đến +1.0 size EU để không thúc móng khi đổ dốc núi.', snugExtraCm: 0.3, wideExtraCm: 0.65 },
    kailasfugadu: { group: 'kailasfugadu', label: 'Kailas Fuga DU 2 / Monster Vibram', brand: 'Kailas', chartKey: 'kailas_xtep', fitBadge: 'Đế rộng 125mm · Chuyên đổ dốc Ultra', fitAdvice: 'Bản DU 2 có mũi giày mở rộng 125mm bám dốc cực đại. Khuyên tăng +0.5 size EU khi chạy địa hình dài.', snugExtraCm: 0.25, wideExtraCm: 0.6 },
    zegama2: { group: 'zegama2', label: 'Nike ZoomX Zegama Trail 2', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'ZoomX + Vibram Megagrip · +0.5 US', fitAdvice: 'Kết hợp đệm ZoomX êm ái của Nike và đế Vibram Megagrip bám đá ướt. Khuyên tăng +0.5 size US khi chạy Trail.', snugExtraCm: 0.25, wideExtraCm: 0.6 },
    courtff3: { group: 'courtff3', label: 'Asics Court FF 3 (Tennis & Pickleball)', brand: 'Asics', chartKey: 'asics_court', fitBadge: 'Cổ MONO-SOCK ôm sát · Chân bè +0.5', fitAdvice: 'Đôi giày Tennis & Pickleball đỉnh nhất của Novak Djokovic. Thiết kế cổ liền MONO-SOCK khóa chặt cổ chân, chân bè nên tăng +0.5 size.', snugExtraCm: 0.2, wideExtraCm: 0.55 },
    gelres9: { group: 'gelres9', label: 'Asics Gel-Resolution X (Tennis & Pickleball)', brand: 'Asics', chartKey: 'asics_court', fitBadge: 'Bền bỉ sân cứng · Chuẩn size Asics', fitAdvice: 'Khung DYNAWALL chống lật ngang tuyệt đối cho các pha di chuyển cứu bóng biên. Đi chuẩn bảng CM của Asics.', snugExtraCm: 0.1, wideExtraCm: 0.45 },
    vapor12: { group: 'vapor12', label: 'Nike Court Vapor Pro 3 HC', brand: 'Nike', chartKey: 'nike_jordan', fitBadge: 'Nhẹ linh hoạt · Sân cứng Tennis/Pickleball', fitAdvice: 'Trọng lượng nhẹ, trọng tâm thấp kèm túi khí Air Zoom mũi giúp bứt tốc lên lưới cực nhanh. Chọn đúng bảng size Nike.', snugExtraCm: 0.1, wideExtraCm: 0.5 },
  };

  function normalizeSizeStr(sz) {
    if (sz == null) return '';
    return String(sz)
      .trim()
      .replace(/,/g, '.')
      .replace(/⅓/g, ' 1/3')
      .replace(/⅔/g, ' 2/3')
      .replace(/\s+/g, ' ')
      .replace(/^(\d+)\.0$/, '$1');
  }

  function parseEuNum(sz) {
    const s = normalizeSizeStr(sz);
    if (!s) return NaN;
    const frac = /^(\d+)\s+(\d+)\/(\d+)$/.exec(s);
    if (frac) {
      const den = Number(frac[3]);
      return den ? Number(frac[1]) + Number(frac[2]) / den : NaN;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }

  function chartKeyForBrand(brand, group) {
    if (group && MODEL_FIT[group] && MODEL_FIT[group].chartKey) {
      return MODEL_FIT[group].chartKey;
    }
    const b = String(brand || '').trim().toLowerCase();
    if (b.includes('yonex') || b.includes('victor')) return 'yonex_victor';
    if (b.includes('asics')) return 'asics_court';
    if (b.includes('kailas') || b.includes('xtep') || b.includes('qiaodan')) return 'kailas_xtep';
    if (b.includes('anta') || b.includes('361') || b.includes('peak') || b.includes('volanti')) return 'anta';
    if (b.includes('wade')) return 'wade';
    if (b.includes('li-ning') || b.includes('lining')) return 'lining';
    if (b.includes('rigorer') || b.includes('spo') || b.includes('serious')) return 'rigorer';
    if (b.includes('adidas')) return 'adidas';
    if (b.includes('shimano')) return 'shimano';
    return 'nike_jordan';
  }

  function getChartForProduct(productOrBrand, group) {
    if (productOrBrand && typeof productOrBrand === 'object') {
      const key = chartKeyForBrand(productOrBrand.brand, productOrBrand.group || group);
      return SIZE_CHARTS[key] || SIZE_CHARTS.nike_jordan;
    }
    const s = String(productOrBrand || '').trim();
    if (SIZE_CHARTS[s]) return SIZE_CHARTS[s];
    const key = chartKeyForBrand(s, group);
    return SIZE_CHARTS[key] || SIZE_CHARTS.nike_jordan;
  }

  function getModelFit(productOrGroup) {
    const grp = productOrGroup && typeof productOrGroup === 'object'
      ? productOrGroup.group
      : String(productOrGroup || '').trim();
    if (grp && MODEL_FIT[grp]) return MODEL_FIT[grp];
    const chart = getChartForProduct(productOrGroup, grp);
    const brandName = (productOrGroup && typeof productOrGroup === 'object' && productOrGroup.brand) || chart.brands[0];
    return {
      group: grp || chart.key,
      label: (productOrGroup && typeof productOrGroup === 'object' && (productOrGroup.model || productOrGroup.name)) || chart.label,
      brand: brandName,
      chartKey: chart.key,
      fitBadge: 'Chuẩn bảng size ' + chart.shortLabel,
      fitAdvice: chart.brandNote,
      snugExtraCm: 0.1,
      wideExtraCm: 0.5,
    };
  }

  function lookupSizeSpec(productOrBrand, sizeEu, group) {
    const chart = getChartForProduct(productOrBrand, group);
    const norm = normalizeSizeStr(sizeEu);
    if (!norm) return null;
    const exact = chart.rows.find(function (r) { return r.eu === norm; });
    if (exact) {
      return Object.assign({ exact: true, chartKey: chart.key, brandLabel: chart.shortLabel, tagColLabel: chart.tagColLabel }, exact);
    }
    const targetNum = parseEuNum(norm);
    if (!Number.isFinite(targetNum)) return null;
    let best = null;
    let bestDiff = Infinity;
    chart.rows.forEach(function (r) {
      const d = Math.abs(parseEuNum(r.eu) - targetNum);
      if (d < bestDiff) { bestDiff = d; best = r; }
    });
    if (best && bestDiff <= 0.4) {
      return Object.assign({ exact: false, requestedEu: norm, chartKey: chart.key, brandLabel: chart.shortLabel, tagColLabel: chart.tagColLabel }, best);
    }
    return null;
  }

  function formatSizeBadge(productOrBrand, sizeEu, mode) {
    const norm = normalizeSizeStr(sizeEu);
    if (!norm) return '';
    const spec = lookupSizeSpec(productOrBrand, norm);
    if (!spec) return 'EU ' + norm;
    if (mode === 'full') {
      return 'EU ' + norm + ' · US ' + spec.us + ' · UK ' + spec.uk + ' · ' + spec.tagColLabel + ' ' + spec.tag + ' · Chân ~' + spec.footCm.toFixed(1) + ' cm';
    }
    if (mode === 'us_cm') {
      return 'US ' + spec.us + ' · ' + spec.footCm.toFixed(1) + 'cm';
    }
    return 'EU ' + norm + ' (US ' + spec.us + ' · ' + spec.footCm.toFixed(1) + 'cm)';
  }

  function recommendSize(footLengthCm, widthType, modelOrProduct) {
    const cm = Number(footLengthCm);
    if (!Number.isFinite(cm) || cm < 20 || cm > 33) return null;
    const fit = getModelFit(modelOrProduct);
    const chart = SIZE_CHARTS[fit.chartKey] || SIZE_CHARTS.nike_jordan;
    const isWide = widthType === 'wide';
    const extra = isWide ? fit.wideExtraCm : fit.snugExtraCm;
    const targetCm = cm + extra;
    const rows = chart.rows;
    let picked = rows[rows.length - 1];
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].footCm >= targetCm - 0.05) {
        picked = rows[i];
        break;
      }
    }
    const outOfRangeLow = targetCm < rows[0].footCm - 0.4;
    const outOfRangeHigh = targetCm > rows[rows.length - 1].footCm + 0.4;
    return {
      eu: picked.eu,
      us: picked.us,
      uk: picked.uk,
      tag: picked.tag,
      tagColLabel: chart.tagColLabel,
      footCm: picked.footCm,
      measuredCm: cm,
      targetCm: Math.round(targetCm * 10) / 10,
      widthType: isWide ? 'wide' : 'normal',
      chartKey: chart.key,
      chartLabel: chart.label,
      fitBadge: fit.fitBadge,
      fitAdvice: fit.fitAdvice,
      modelLabel: fit.label,
      outOfRange: outOfRangeLow ? 'low' : (outOfRangeHigh ? 'high' : null),
    };
  }

  function matchesFilterBucket(productSizes, filterSz) {
    const fNorm = normalizeSizeStr(filterSz);
    if (!fNorm) return true;
    const arr = Array.isArray(productSizes) ? productSizes.map(normalizeSizeStr) : [];
    if (arr.includes(fNorm)) return true;
    if (fNorm.includes('/')) return false;
    const fNum = parseEuNum(fNorm);
    if (!Number.isFinite(fNum)) return false;
    return arr.some(function (s) {
      if (!s.includes('/')) return false;
      const sNum = parseEuNum(s);
      return Number.isFinite(sNum) && Math.abs(sNum - fNum) <= 0.36;
    });
  }

  const CK_SIZING = {
    CHARTS: SIZE_CHARTS,
    MODEL_FIT: MODEL_FIT,
    normalizeSizeStr: normalizeSizeStr,
    parseEuNum: parseEuNum,
    chartKeyForBrand: chartKeyForBrand,
    getChartForProduct: getChartForProduct,
    getModelFit: getModelFit,
    lookupSizeSpec: lookupSizeSpec,
    formatSizeBadge: formatSizeBadge,
    recommendSize: recommendSize,
    matchesFilterBucket: matchesFilterBucket,
  };

  const MODELS = {
    ja3: {
      model: 'Nike Ja 3', brand: 'Nike', category: 'Basketball', poster: 'public/images/posters/poster-62.jpg',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Signature Ja Morant', 'Loại': 'Giày bóng rổ', 'Cổ giày': 'Low-top', 'Đệm': 'ZoomX', 'Hệ quy đổi Size': 'Chuẩn Nike Men (EU 38–46 · có size lẻ .5)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Nike Ja 3 — đôi signature thứ ba của Ja Morant: phom low-top linh hoạt, đệm ZoomX nảy nhẹ cho lối chơi bứt tốc, đổi hướng liên tục. Nhận order đủ phối màu chính hãng về tay sau 12–15 ngày.'
    },
    kai2: {
      model: 'Anta Kai 2', brand: 'Anta', category: 'Basketball', poster: 'public/images/posters/poster-66.jpg',
      specs: { 'Thương hiệu': 'Anta', 'Dòng': 'Signature Kyrie Irving', 'Loại': 'Giày bóng rổ', 'Cổ giày': 'Low-top', 'Hệ quy đổi Size': 'Chuẩn ANTA Men (EU 39–46 · CHN 245–290 mm)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Anta Kai 2 — signature của Kyrie Irving với thiết kế đế răng cưa đặc trưng, ôm chân, bám sân tốt và 14 phối màu cực chất. Khách chọn size chuẩn bảng ANTA, shop nhận order chính hãng 12–15 ngày về kho Huế.'
    },
    rc502: {
      model: 'Shimano RC502', brand: 'Shimano', category: 'Cycling', poster: 'public/images/posters/poster-rc502-pro.jpg?v=5.2',
      specs: { 'Thương hiệu': 'Shimano', 'Dòng': 'RC5 (SH-RC502)', 'Loại': 'Giày đạp xe road', 'Khoá': 'Núm vặn BOA L6 + quai dán', 'Hệ quy đổi Size': 'Chuẩn Shimano Road (EU 38–46 · 23.8–29.2 cm)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Shimano RC502 — giày road cycling tầm trung được ưa chuộng: núm BOA L6 chỉnh nhanh, quai dán ổn định, đế cứng truyền lực tốt. Đặt order chính hãng 12–15 ngày.'
    },
    kai3: {
      model: 'Anta Kai 3', brand: 'Anta', category: 'Basketball',
      specs: { 'Thương hiệu': 'Anta', 'Dòng': 'Signature Kyrie Irving', 'Loại': 'Giày bóng rổ', 'Đệm': 'ANTA Nitrogen', 'Hệ quy đổi Size': 'Chuẩn ANTA Men (EU 39–46 · CHN 245–290 mm)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Anta Kai 3 — thế hệ mới nhất trong dòng signature của Kyrie Irving, đệm Nitrogen êm nảy và độ bám sân vượt trội.'
    },
    tatum4: {
      model: 'Jordan Tatum 4', brand: 'Jordan', category: 'Basketball',
      specs: { 'Thương hiệu': 'Jordan', 'Dòng': 'Signature Jayson Tatum', 'Loại': 'Giày bóng rổ', 'Cổ giày': 'Low-top', 'Hệ quy đổi Size': 'Chuẩn Jordan / Nike Men (EU 38–46 · có size lẻ .5)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Jordan Tatum 4 — signature của Jayson Tatum, trọng lượng nhẹ hàng đầu dòng Jordan, ôm chân và hỗ trợ đổi hướng linh hoạt.'
    },
    lebron23: {
      model: 'Nike LeBron 23', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Signature LeBron James', 'Loại': 'Giày bóng rổ', 'Đệm': 'Zoom Air kép', 'Hệ quy đổi Size': 'Chuẩn Nike Men (EU 38–46 · có size lẻ .5)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Nike LeBron 23 — dòng signature của LeBron James, đệm êm, khung giày chắc chắn, bảo vệ cổ chân và đầu gối tối đa.'
    },
    wade808: {
      model: 'Way of Wade 808 5 Ultra V2', brand: 'Way of Wade', category: 'Basketball',
      specs: { 'Thương hiệu': 'Way of Wade', 'Dòng': 'Way of Wade 808', 'Loại': 'Giày bóng rổ', 'Đệm': 'Drop-in BOOM', 'Hệ quy đổi Size': 'Chuẩn Way of Wade (EU 38 1/3 – 46 1/3 · CHN mm)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Way of Wade 808 5 Ultra V2 — dòng 808 tốc độ với lót rời full-length BOOM siêu nảy của nhà Way of Wade.'
    },
    allcity13: {
      model: 'Way of Wade All City 13 Encore', brand: 'Way of Wade', category: 'Basketball',
      specs: { 'Thương hiệu': 'Way of Wade', 'Dòng': 'Way of Wade All City', 'Loại': 'Giày bóng rổ', 'Đệm': 'Full-length BOOM', 'Hệ quy đổi Size': 'Chuẩn Way of Wade (EU 38 1/3 – 46 1/3 · CHN mm)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Way of Wade All City 13 Encore — phiên bản nâng cấp của dòng All City cày sân bền bỉ từ indoor tới outdoor.'
    },
    ar2: {
      model: 'Rigorer AR 2', brand: 'Rigorer', category: 'Basketball',
      specs: { 'Thương hiệu': 'Rigorer', 'Dòng': 'Signature Austin Reaves', 'Loại': 'Giày bóng rổ', 'Hệ quy đổi Size': 'Chuẩn Rigorer Men (EU 39.5–46 · US 7–12)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Rigorer AR 2 — signature thứ hai của Austin Reaves với thiết kế lấy cảm hứng từ cánh bướm, chống lật cổ chân cực tốt.'
    },
    book1: {
      model: 'Nike Book 1', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Signature Devin Booker', 'Loại': 'Giày bóng rổ / lifestyle', 'Đệm': 'Cushlon 2.0 + Zoom Air', 'Hệ quy đổi Size': 'Chuẩn Nike Men (EU 38–46 · có size lẻ .5)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Nike Book 1 — signature đầu tiên của Devin Booker, phom cổ điển vừa đánh bóng rổ chuyên nghiệp vừa phối đồ đi phố.'
    },
    c2026: {
      model: 'Anta C2026', brand: 'Anta', category: 'Running',
      specs: { 'Thương hiệu': 'Anta', 'Loại': 'Giày chạy bộ Carbon', 'Đệm': 'NitroEdge + Carbon Plate', 'Hệ quy đổi Size': 'Chuẩn ANTA Running (EU 39–46 · CHN 245–290 mm)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Anta C2026 — giày chạy bộ đường dài tích hợp tấm carbon hỗ trợ hoàn trả năng lượng cao.'
    },
    adiospro4: {
      model: 'Adidas Adizero Adios Pro 4', brand: 'Adidas', category: 'Running',
      specs: { 'Thương hiệu': 'Adidas', 'Dòng': 'Adizero Racing', 'Loại': 'Giày chạy bộ thi đấu Marathon', 'Đệm': 'Lightstrike Pro + EnergyRods 2.0', 'Hệ quy đổi Size': 'Chuẩn Adidas Adizero (EU 38 – 46 · hệ 1/3 & 2/3)', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Adidas Adizero Adios Pro 4 — siêu giày chạy giải Full/Half Marathon hàng đầu của Adidas với thanh carbon EnergyRods 2.0.'
    },
    wow12: {
      model: 'Way of Wade 12', brand: 'Way of Wade', category: 'Basketball',
      specs: { 'Thương hiệu': 'Way of Wade', 'Phân khúc': 'Flagship Cao Cấp (S-Tier)', 'Đệm': 'Full-length Super BOOM + 3D Carbon Plate', 'Đế ngoài': 'GCU chống trượt cao cấp', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Way of Wade 12 (WOW 12) — Flagship bóng rổ đỉnh cao nhất của Dwyane Wade năm 2026: đệm kép Super BOOM siêu nảy kết hợp tấm sợi Carbon vòm cung 3D và khóa gót tuyệt đối.'
    },
    gamma2: {
      model: 'Li-Ning Gamma 2', brand: 'Li-Ning', category: 'Basketball',
      specs: { 'Thương hiệu': 'Li-Ning', 'Phân khúc': 'Luxury Flagship (~290g)', 'Đệm': 'Super BOOM đúc liền + Carbon lò xo toàn bàn', 'Trọng lượng': '~290g (Siêu nhẹ)', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Li-Ning Gamma 2 — đôi giày bóng rổ thi đấu nhẹ nhất thế giới (~290g), tích hợp tấm Carbon lò xo kéo dài tới mũi chân cho tốc độ phản xạ tức thì.'
    },
    spo15: {
      model: 'Serious Player Only Player 1.5', brand: 'SPO', category: 'Basketball',
      specs: { 'Thương hiệu': 'SPO (Serious Player Only)', 'Phân khúc': 'Flagship Modular', 'Đệm': 'Drop-in Midsole kép (Quick + Explosive 2.0)', 'Khung đỡ': '3D Carbon Fiber Heel Counter', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Serious Player Only — Player 1.5: được mệnh danh là "Kobe 8/9 thế hệ mới" với lót rời Drop-in Midsole kép tùy chỉnh độ êm, cảm giác mặt sân 10/10 và khoang mũi cải tiến hợp chân bè.'
    },
    wow11: {
      model: 'Way of Wade 11', brand: 'Way of Wade', category: 'Basketball',
      specs: { 'Thương hiệu': 'Way of Wade', 'Phân khúc': 'Flagship Cao Cấp', 'Đệm': 'Carbon Core Drive + Full Super BOOM', 'Đế ngoài': 'GCU Indoor/Outdoor', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Way of Wade 11 (WOW 11) — thiết kế tương lai với hệ thống Carbon Core Drive chống xoắn vặn và lớp đệm Super BOOM giảm chấn hoàn hảo.'
    },
    kobe8: {
      model: 'Nike Kobe 8 Protro', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Kobe Bryant Protro', 'Phân khúc': 'Flagship Huyền Thoại', 'Đệm': 'Drop-in Nike React Foam + Carbon Shank', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Kobe 8 Protro — biểu tượng bất tử cho các hậu vệ dẫn bóng (PG/SG) với trọng lượng siêu nhẹ, thân Engineered Mesh ôm chân và lót rời React Foam.'
    },
    kobe6: {
      model: 'Nike Kobe 6 Protro', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Kobe Bryant Protro', 'Phân khúc': 'Flagship VBA / Pro', 'Đệm': 'Air Zoom Turbo mũi + Cushlon Foam', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Kobe 6 Protro — mẫu giày được các cầu thủ chuyên nghiệp VBA/NBA sử dụng nhiều nhất nhờ lớp vảy rắn ôm sát bàn chân và túi khí Zoom Turbo cực nhạy.'
    },
    aj39: {
      model: 'Air Jordan 39', brand: 'Jordan', category: 'Basketball',
      specs: { 'Thương hiệu': 'Jordan', 'Dòng': 'Air Jordan Flagship XXXIX', 'Phân khúc': 'Flagship Cao Cấp', 'Đệm': 'Full-length ZoomX + Full-length Air Zoom', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Air Jordan 39 (AJ XXXIX) — lần đầu tiên Jordan kết hợp nguyên bàn bọt ZoomX siêu nảy cùng túi khí Air Zoom toàn phần, êm như nhún lò xo suốt 4 hiệp đấu.'
    },
    gtcut3: {
      model: 'Nike G.T. Cut 3', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Greater Than Series', 'Phân khúc': 'Flagship Tốc Độ', 'Đệm': 'Full-length ZoomX Foam + Flywire', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike G.T. Cut 3 — vũ khí bứt tốc và step-back hàng đầu của Nike Basketball với đệm ZoomX nguyên bàn đầu tiên và độ bám sân cực kỳ sắc bén.'
    },
    wow10low: {
      model: 'Way of Wade 10 Low', brand: 'Way of Wade', category: 'Basketball',
      specs: { 'Thương hiệu': 'Way of Wade', 'Phân khúc': 'Flagship Huyền Thoại', 'Đệm': 'Full-length BOOM + Tấm Carbon dạng thìa', 'Cổ giày': 'Low-top linh hoạt', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Way of Wade 10 Low — tượng đài giày bóng rổ toàn diện nhất lịch sử nhà Wade với tấm Carbon hình chiếc thìa trợ lực bật nhảy và phom dáng cực đẹp.'
    },
    kt10: {
      model: 'Anta KT10', brand: 'Anta', category: 'Basketball',
      specs: { 'Thương hiệu': 'Anta', 'Dòng': 'Signature Klay Thompson 10', 'Phân khúc': 'Flagship Shooter', 'Đệm': 'NitroEdge mật độ kép + Carbon Fiber', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Anta KT10 — thế hệ thứ 10 kỷ niệm của xạ thủ Klay Thompson: khóa cổ chân vững chắc khi chạy chỗ Catch & Shoot, đệm NitroEdge êm đầm và đế cực bền.'
    },
    yushuai18: {
      model: 'Li-Ning YuShuai 18 Ultra', brand: 'Li-Ning', category: 'Basketball',
      specs: { 'Thương hiệu': 'Li-Ning', 'Dòng': 'YuShuai Ultra Series', 'Phân khúc': 'Flagship Cao Cấp', 'Đệm': 'Super BOOM + Dual Carbon Sandwich', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Li-Ning YuShuai 18 Ultra — dòng giày thi đấu chuyên nghiệp lâu đời nhất của Li-Ning với cấu trúc 2 tấm sợi Carbon kẹp đệm Super BOOM.'
    },
    spogame1: {
      model: 'Serious Player Only Game 1', brand: 'SPO', category: 'Basketball',
      specs: { 'Thương hiệu': 'SPO (Serious Player Only)', 'Phân khúc': 'Flagship Guard', 'Đệm': 'Drop-in Midsole + Khung Carbon vát cạnh', 'Cổ giày': 'Low-top tối giản', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Serious Player Only — Game 1: thiết kế tối giản mang hơi hướng Kobe AD, trọng lượng nhẹ và cảm giác mặt sàn chân thật tối đa.'
    },
    ar2pro: {
      model: 'Rigorer AR 2', brand: 'Rigorer', category: 'Basketball',
      specs: { 'Thương hiệu': 'Rigorer', 'Dòng': 'Signature Austin Reaves 2', 'Phân khúc': 'Flagship Cao Cấp', 'Đệm': 'ShowTime Foam + TPU Cánh Bướm + Carbon Plate', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Rigorer AR 2 — thế hệ signature thứ 2 của Austin Reaves (LA Lakers) với khung TPU cánh bướm và tấm sợi Carbon chống xoắn cực kỳ ổn định.'
    },
    liren6v2: {
      model: 'Li-Ning Liren 6 V2', brand: 'Li-Ning', category: 'Basketball',
      specs: { 'Thương hiệu': 'Li-Ning', 'Dòng': 'Sharp Edge (Liren) 6 V2', 'Phân khúc': 'Trung Cấp Giải Đấu (A+ Tier)', 'Đệm': 'Dual-Drive (BOOM + Super BOOM) + Probar Loc', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Li-Ning Liren 6 V2 (Sharp Edge 6 V2) — vua giày hậu vệ thực chiến 2026: đi êm ngay không cần break-in, bám sân rít và phom mũi cải tiến thoải mái.'
    },
    joker2gt: {
      model: '361° Joker 2 GT', brand: '361°', category: 'Basketball',
      specs: { 'Thương hiệu': '361° (361 Degrees)', 'Dòng': 'Signature Nikola Jokić', 'Phân khúc': 'Trung Cấp Giải Đấu (A+ Tier)', 'Đệm': 'CQT Extreme + Khung Carbon chịu tải', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: '361° Joker 2 GT — signature của MVP Nikola Jokić, khoang mũi cực kỳ thân thiện với bàn chân bè người Việt, đệm CQT Extreme giảm chấn tuyệt vời.'
    },
    liren5low: {
      model: 'Li-Ning Liren 5 Low', brand: 'Li-Ning', category: 'Basketball',
      specs: { 'Thương hiệu': 'Li-Ning', 'Dòng': 'Sharp Edge 5 Low', 'Phân khúc': 'Trung Cấp Giải Đấu', 'Đệm': 'Full-length BOOM + Khung TPU 360°', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Li-Ning Liren 5 Low — cổ thấp linh hoạt, xoay chuyển cổ chân tự do, là lựa chọn toàn diện và an toàn cho mọi giải đấu phong trào.'
    },
    ag5pro: {
      model: '361° AG 5', brand: '361°', category: 'Basketball',
      specs: { 'Thương hiệu': '361° (361 Degrees)', 'Dòng': 'Signature Aaron Gordon 5', 'Phân khúc': 'Trung Cấp Giải Đấu', 'Đệm': 'ENRG-X + Khung Carbon vòm chân', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: '361° AG 5 — chuyên biệt cho lối đánh bật nhảy úp rổ và tranh chấp rebound mạnh mẽ, triệt tiêu phản lực khi tiếp đất.'
    },
    volanti911: {
      model: 'Volanti 911 Rocket Air', brand: 'Volanti', category: 'Basketball',
      specs: { 'Thương hiệu': 'Volanti', 'Dòng': '911 Rocket Air', 'Phân khúc': 'Trung Cấp Giải Đấu (A-Tier)', 'Đệm': 'Đệm khí nén áp suất cao trợ lực bật nhảy', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Volanti 911 Rocket Air — hiện tượng giày bóng rổ trợ lực bật nhảy được các dunker trẻ săn đón nhờ độ đàn hồi cực mạnh.'
    },
    sonic12pro: {
      model: 'Li-Ning Sonic 12', brand: 'Li-Ning', category: 'Basketball',
      specs: { 'Thương hiệu': 'Li-Ning', 'Dòng': 'Sonic Speed Series', 'Phân khúc': 'Trung Cấp Bền Bỉ', 'Đệm': 'Light Foam Plus + BOOM mũi chân', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Li-Ning Sonic 12 — dòng giày tốc độ chịu cày ải bền bỉ, bám tốt ngay cả trên các mặt sân phong trào có bụi nhẹ.'
    },
    sabrina2: {
      model: 'Nike Sabrina 2', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Signature Sabrina Ionescu', 'Phân khúc': 'Trung Cấp Giải Đấu', 'Đệm': 'Cushlon 3.0 + Forefoot Air Zoom', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Sabrina 2 — phom dáng gọn nhẹ tương tự Kobe 5/6, cảm giác mặt sân tuyệt hảo, được các hậu vệ nam và nữ săn lùng ráo riết.'
    },
    ar1: {
      model: 'Rigorer AR 1', brand: 'Rigorer', category: 'Basketball',
      specs: { 'Thương hiệu': 'Rigorer', 'Dòng': 'Signature Austin Reaves 1', 'Phân khúc': 'Trung Cấp Best-Seller', 'Đệm': 'ShowTime Foam + TPU bọc sườn', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Rigorer AR 1 — đôi giày làm nên tên tuổi Austin Reaves với phối màu bắt mắt, đệm êm ái ngay từ lần xỏ đầu tiên và độ chống lật cực tốt.'
    },
    kt9: {
      model: 'Anta KT9', brand: 'Anta', category: 'Basketball',
      specs: { 'Thương hiệu': 'Anta', 'Dòng': 'Signature Klay Thompson 9', 'Phân khúc': 'Trung Cấp Ổn Định', 'Đệm': 'NitroEdge + Smart S.A.M giảm chấn gót', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Anta KT9 — độ bền trâu bò, khóa gót chắc nịch, bảo vệ cổ chân tối đa cho các tay ném và cầu thủ đánh vòng ngoài.'
    },
    badfive3: {
      model: 'Li-Ning BadFive 3', brand: 'Li-Ning', category: 'Basketball',
      specs: { 'Thương hiệu': 'Li-Ning', 'Dòng': 'BadFive Streetball', 'Phân khúc': 'Trung Cấp Chuyên Outdoor', 'Đệm': 'Full BOOM + Đế cao su TUFF RB siêu bền', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Li-Ning BadFive 3 — thiết kế gai góc đường phố, đế cao su TUFF RB dày dặn chuyên trị sân xi măng và rất hợp bàn chân bè.'
    },
    big3quick: {
      model: '361° BIG3 5.0 Quick Pro', brand: '361°', category: 'Basketball',
      specs: { 'Thương hiệu': '361° (361 Degrees)', 'Dòng': 'BIG3 Quick Pro', 'Phân khúc': 'Trung Cấp Giải Đấu', 'Đệm': 'QUIKCQTECH + Tấm Carbon chống xoắn', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: '361° BIG3 5.0 Quick Pro — đôi giày được chấm điểm độ bám (traction) và chuyển hướng mượt mà cao nhất tầm giá trung cấp.'
    },
    allcity14: {
      model: 'Way of Wade All City 14', brand: 'Way of Wade', category: 'Basketball',
      specs: { 'Thương hiệu': 'Way of Wade', 'Dòng': 'Wade All City 14', 'Phân khúc': 'Học Sinh - Sinh Viên / Outdoor (A+ Tier)', 'Đệm': 'Full-length BOOM + Khung TPU Probar Loc', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Way of Wade All City 14 (AC 14) — thế hệ mới nhất của dòng "Vua cày ải Outdoor" nhà Wade, đệm BOOM êm cả ngày không mỏi gối.'
    },
    sw8pro: {
      model: 'Anta Shock Wave 8 Pro', brand: 'Anta', category: 'Basketball',
      specs: { 'Thương hiệu': 'Anta', 'Dòng': 'Shock Wave Streetball', 'Phân khúc': 'Học Sinh - Sinh Viên / Cày Bê Tông (A-Tier)', 'Đệm': 'NitroEdge + Đế Cement Killer chịu mài mòn', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Anta Shock Wave 8 Pro — chiến thần cày sân bê tông mới nhất của Anta với gai đế sâu chịu ma sát nhiệt độ cao và phom bè cực sướng.'
    },
    sw7: {
      model: 'Anta Shock Wave 7', brand: 'Anta', category: 'Basketball',
      specs: { 'Thương hiệu': 'Anta', 'Dòng': 'Shock Wave Series', 'Phân khúc': 'Bình Dân Học Sinh - Sinh Viên', 'Đệm': 'NitroEdge + Khung TPU chống lật gót', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Anta Shock Wave 7 — phom đầm chắc, ôm mu bàn chân dày của học sinh Việt Nam rất thoải mái, cày sân trường học bền bỉ.'
    },
    taichi5: {
      model: 'Peak Taichi Flash 6.0', brand: 'Peak', category: 'Basketball',
      specs: { 'Thương hiệu': 'Peak', 'Dòng': 'Taichi Flash Series', 'Phân khúc': 'Bình Dân Học Sinh - Sinh Viên', 'Đệm': 'P-Motive + Taichi Foam thích ứng thông minh', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Peak Taichi Flash 6.0 — đệm Taichi thông minh đi bộ mềm êm, bật nhảy đàn hồi mạnh, phom rộng rãi bảo vệ khớp gối cho học sinh.'
    },
    wadeshadow5: {
      model: 'Way of Wade Shadow 5', brand: 'Way of Wade', category: 'Basketball',
      specs: { 'Thương hiệu': 'Way of Wade', 'Dòng': 'Wade Shadow', 'Phân khúc': 'Bình Dân Học Sinh - Sinh Viên', 'Đệm': 'Li-Ning Cloud + Đệm BOOM', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Way of Wade Shadow 5 — bản "tiểu Way of Wade" thiết kế sắc sảo, nhẹ thoáng và bền bỉ cho học sinh sinh viên chơi sân ngoài trời.'
    },
    dvd2: {
      model: '361° DVD 2', brand: '361°', category: 'Basketball',
      specs: { 'Thương hiệu': '361° (361 Degrees)', 'Dòng': 'Signature Spencer Dinwiddie 2', 'Phân khúc': 'Bình Dân Học Sinh - Sinh Viên', 'Đệm': 'ENRG-X + Khung TPU khóa sườn', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: '361° DVD 2 — đôi giày chuyên thủ và đột phá tốc độ cho các hậu vệ sân trường với đế ngoài bám dính và chống mài mòn cao.'
    },
    immortality4: {
      model: 'Nike Giannis Immortality 4', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Giannis Antetokounmpo', 'Phân khúc': 'Bình Dân Học Sinh - Sinh Viên', 'Đệm': 'Dual-density Phylon + Đế cong Euro-step', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Giannis Immortality 4 — mẫu giày bóng rổ Nike chính hãng dễ tiếp cận nhất cho học sinh yêu thích logo Swoosh, đế dày cày sân outdoor ổn định.'
    },
    ktsplash6: {
      model: 'Anta KT Splash 6', brand: 'Anta', category: 'Basketball',
      specs: { 'Thương hiệu': 'Anta', 'Dòng': 'KT Splash Series', 'Phân khúc': 'Bình Dân Học Sinh - Sinh Viên', 'Đệm': 'A-FlashEdge / NitroEdge nhẹ thoáng', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Anta KT Splash 6 — siêu nhẹ, thân lưới cực kỳ thoáng khí cho mùa hè oi bức, đế cao su bền bỉ cho học sinh tập luyện hằng ngày.'
    },
    kobe3: {
      model: 'Nike Kobe 3 Low Protro', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Kobe Bryant Protro', 'Phân khúc': 'Flagship Huyền Thoại', 'Đệm': 'Full-length Air Zoom Strobel + Cushlon', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Kobe 3 Low Protro — sự trở lại lịch sử của thiết kế lưới kim cương Mamba trong phom cổ thấp hiện đại, nâng cấp đệm Zoom Strobel toàn bàn.'
    },
    kobe5: {
      model: 'Nike Kobe 5 Protro', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Kobe Bryant Protro', 'Phân khúc': 'Flagship VBA / NBA', 'Đệm': 'Air Zoom Turbo mũi + Cushlon Foam + Carbon Shank', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Kobe 5 Protro — đỉnh cao giày bóng rổ thực chiến với trọng lượng siêu nhẹ, khóa gót tuyệt đối và cảm giác mặt sân hoàn hảo.'
    },
    kobe9: {
      model: 'Nike Kobe 9 Protro', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Kobe Bryant Protro (EM & Elite)', 'Phân khúc': 'Flagship Huyền Thoại', 'Đệm': 'Drop-in Nike React Foam + Carbon Fiber Heel', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Kobe 9 Protro — huyền thoại sở hữu bộ đế bám sân số 1 lịch sử bóng rổ kết hợp lót rời Nike React Protro và hai bên kẹp Carbon chữ V.'
    },
    kobe10: {
      model: 'Nike Kobe 10 Protro', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Kobe Bryant Protro', 'Phân khúc': 'Flagship Cao Cấp', 'Đệm': 'Lunarlon + Zoom Air gót + Free-inspired Grooves', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Kobe 10 Protro — thiết kế tối giản hiện đại với bộ đế hạt micro-traction bám rít mặt sàn gỗ và đệm gót Zoom Air giảm chấn êm ái.'
    },
    kobe11: {
      model: 'Nike Kobe 11', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Kobe Bryant Signature XI', 'Phân khúc': 'Flagship Sưu Tầm & Thực Chiến', 'Đệm': 'Drop-in Lunarlon + Zoom Air', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Kobe 11 — đôi giày cuối cùng Kobe Bryant mang trên sân đấu NBA, phom low-top thanh thoát với lót rời Lunarlon linh hoạt.'
    },
    sabrina4: {
      model: 'Nike Sabrina 4 EP', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Signature Sabrina Ionescu 4', 'Phân khúc': 'Trung Cấp Giải Đấu', 'Đệm': 'Cushlon 3.0 + Forefoot Air Zoom + Đế XDR', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Sabrina 4 EP — thế hệ thứ 4 của nữ xạ thủ Sabrina Ionescu với bộ khung cáp khóa midfoot chắc chắn và cảm giác sân sắc bén.'
    },
    book2: {
      model: 'Nike Book 2 EP', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Signature Devin Booker 2', 'Phân khúc': 'Flagship Guard / Wing', 'Đệm': 'Cushlon 2.0 + Air Zoom + Đế XDR', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike Book 2 EP — chữ ký thứ hai của Devin Booker mang họa tiết cá tính cùng bộ đệm êm đầm hỗ trợ những pha pull-up jumper mượt mà.'
    },
    gtcutacademy2: {
      model: 'Nike G.T. Cut Academy 2 EP', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Greater Than Cut Academy 2', 'Phân khúc': 'Học Sinh - Sinh Viên / Outdoor', 'Đệm': 'Forefoot Zoom Air + Renew Foam + Đế XDR', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike G.T. Cut Academy 2 EP — mẫu giày bóng rổ quốc dân mới của Nike: có túi khí Zoom Air mũi, đế cao su XDR siêu bền và mức giá cực tốt.'
    },
    kd18: {
      model: 'Nike KD 18 EP', brand: 'Nike', category: 'Basketball',
      specs: { 'Thương hiệu': 'Nike', 'Dòng': 'Signature Kevin Durant 18', 'Phân khúc': 'Flagship All-Around', 'Đệm': 'Forefoot Air Zoom + Air Strobel + Khung TPU', 'Hình thức': 'Order chính hãng 12–15 ngày · Inbox for details' },
      description: 'Nike KD 18 EP — chiến hài thứ 18 của "Slim Reaper" Kevin Durant với khung xương TPU ôm sườn độc bản và hệ thống đệm kép toàn diện.'
    },
    bladedf01: {
      model: 'Li-Ning Blade II Pro', brand: 'Li-Ning', category: 'Badminton',
      specs: { 'Thương hiệu': 'Li-Ning', 'Bộ môn': 'Cầu lông chuyên nghiệp (Badminton)', 'Đệm': 'Full-length Li-Ning BOOM + Carbon Plate', 'Mặt sân': 'Sân thảm PVC tiêu chuẩn BWF', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Li-Ning Blade II Pro & Thunder II Pro — dòng giày cầu lông tốc độ và bảo vệ cổ chân hàng đầu của đội tuyển quốc gia với đệm BOOM toàn bàn và tấm sợi Carbon chống xoắn.'
    },
    yunting: {
      model: 'Li-Ning Ace V2 All-Around', brand: 'Li-Ning', category: 'Badminton',
      specs: { 'Thương hiệu': 'Li-Ning', 'Bộ môn': 'Cầu lông chuyên nghiệp (Badminton)', 'Đệm': 'Li-Ning BOOM + Probar Loc + TUFF RB', 'Mặt sân': 'Sân thảm PVC & Sân gỗ', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Li-Ning Ace V2 (Toàn Năng Vương) — phom mũi U-Shape rộng rãi cực hợp bàn chân người Việt, đế cao su không để lại vết và khóa gót chống lật tối đa khi cứu cầu.'
    },
    halbertec: {
      model: 'Li-Ning Halberd III & Saga Pro', brand: 'Li-Ning', category: 'Badminton',
      specs: { 'Thương hiệu': 'Li-Ning', 'Bộ môn': 'Cầu lông chuyên nghiệp (Badminton)', 'Đệm': 'Li-Ning Cloud + BOOM + Khung TPU', 'Mặt sân': 'Sân thảm PVC & Đa năng', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Li-Ning Halberd III & Saga III Pro — sự kết hợp hoàn hảo giữa trọng lượng nhẹ, thân giày thoáng khí và độ bền cày ải cho người chơi cầu lông phong trào và bán chuyên.'
    },
    yonex65z3: {
      model: 'Yonex Power Cushion 65Z4 / 65Z3', brand: 'Yonex', category: 'Badminton',
      specs: { 'Thương hiệu': 'Yonex', 'Bộ môn': 'Cầu lông chuyên nghiệp (Badminton)', 'Đệm': 'Power Cushion+ + Feather Bounce Foam + Graphite Sheet', 'Mặt sân': 'Sân thảm BWF Quốc Tế', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Yonex Power Cushion 65Z4 & 65Z3 — huyền thoại giày cầu lông số 1 thế giới được Viktor Axelsen và các tay vợt top BWF tin dùng nhờ độ bám Radial Blade và đệm Power Cushion+.'
    },
    victora970: {
      model: 'Victor A970 NitroLite', brand: 'Victor', category: 'Badminton',
      specs: { 'Thương hiệu': 'Victor', 'Bộ môn': 'Cầu lông chuyên nghiệp (Badminton)', 'Đệm': 'NitroLite Supercritical Foam + E-TPU + Carbon Power', 'Mặt sân': 'Sân thảm BWF Quốc Tế', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Victor A970 NitroLite & A970ACE Lee Zii Jia — siêu phẩm cầu lông sử dụng công nghệ bọt khí nitơ siêu tới hạn NitroLite êm nhẹ và bảo vệ gót chân số 1 của Victor.'
    },
    feidian5: {
      model: 'Li-Ning Feidian 6 Elite Carbon', brand: 'Li-Ning', category: 'Running',
      specs: { 'Thương hiệu': 'Li-Ning', 'Bộ môn': 'Chạy bộ Marathon (Road Running)', 'Đệm': 'Super BOOM + Tấm Carbon vòm nguyên khối + Đế GCU', 'Cự ly': '10K · Half Marathon 21K · Full Marathon 42K', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Li-Ning Feidian 6 Elite — vũ khí phá PR Marathon đỉnh cao của Li-Ning với đệm Super BOOM siêu nhẹ, tấm Carbon cong đẩy mũi và đế GCU bám đường ướt vượt trội.'
    },
    xtep160x6: {
      model: 'Xtep 160X 8.0 Pro / Ultra', brand: 'Xtep', category: 'Running',
      specs: { 'Thương hiệu': 'Xtep', 'Bộ môn': 'Chạy bộ Marathon (Road Running)', 'Đệm': 'Xtep ACE PISA Foam + Tấm Carbon T700 Golden', 'Cự ly': 'Half Marathon 21K · Full Marathon 42K', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Xtep 160X 8.0 Pro & Ultra — dòng giày chạy bộ thống trị các bục podium Marathon châu Á với tấm sợi Carbon T700 tiết diện rộng, dễ kiểm soát và hoàn trả năng lượng cực cao.'
    },
    qiaodanplaid: {
      model: 'Qiaodan Feiying Plaid 3.0', brand: 'Qiaodan', category: 'Running',
      specs: { 'Thương hiệu': 'Qiaodan', 'Bộ môn': 'Chạy bộ Marathon (Road Running)', 'Đệm': '100% Pebax KungFu Pro + Tấm Carbon 3D', 'Cự ly': '21K · 42K Marathon Racing', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Qiaodan Feiying Plaid 3.0 — được mệnh danh là đôi giày Carbon có bộ đệm Pebax êm và nảy nhất phân khúc, giúp giữ đôi chân tươi mới ở những km cuối cùng của cự ly 42km.'
    },
    flame4: {
      model: '361° Flame 4.0 Carbon', brand: '361°', category: 'Running',
      specs: { 'Thương hiệu': '361° (361 Degrees)', 'Bộ môn': 'Chạy bộ Marathon (Road Running)', 'Đệm': 'CQT Extreme Nylon Elastomer + Quikbone Carbon', 'Cự ly': '10K · 21K · 42K Racing', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: '361° Flame 4.0 & 3.0 — siêu giày đua Carbon có hiệu năng trên giá thành xuất sắc nhất, thân lưới Mono-mesh thoát nhiệt nhanh cho khí hậu nóng ẩm Việt Nam.'
    },
    kailasfugaex3: {
      model: 'Kailas Fuga EX 3 Vibram', brand: 'Kailas', category: 'Trail',
      specs: { 'Thương hiệu': 'Kailas', 'Bộ môn': 'Chạy địa hình (Trail Running)', 'Đế ngoài': 'Vibram Megagrip + Khóa dây 2 vùng AWS 3.0', 'Địa hình': 'Đường mòn núi đá · Bùn đất · Ultra Trail 50K–100K', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Kailas Fuga EX 3 & EX 330 — ông vua chạy Trail châu Á chiếm sóng tại VMM Sapa và Đà Lạt Ultra Trail: đế Vibram Megagrip bám đá rêu trơn trượt và hệ thống rút dây 2 vùng chống dồn móng.'
    },
    kailasfugadu: {
      model: 'Kailas Fuga DU 2 Vibram', brand: 'Kailas', category: 'Trail',
      specs: { 'Thương hiệu': 'Kailas', 'Bộ môn': 'Chạy địa hình (Trail Running)', 'Đế ngoài': 'Vibram Megagrip Traction Lug · Đế bè 125mm', 'Địa hình': 'Đổ dốc kỹ thuật · Ultra Trail dài ngày', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Kailas Fuga DU 2 & DU Monster — thiết kế mũi đế mở rộng 125mm chuyên trị những cung đường đổ dốc gắt, giảm chấn tối đa và chống lật cổ chân trên địa hình phức tạp.'
    },
    zegama2: {
      model: 'Nike ZoomX Zegama Trail 2', brand: 'Nike', category: 'Trail',
      specs: { 'Thương hiệu': 'Nike', 'Bộ môn': 'Chạy địa hình (Trail Running)', 'Đế ngoài': 'Nike ZoomX + Vibram Megagrip Outsole', 'Địa hình': 'Technical Trail & Mountain Ultra', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Nike ZoomX Zegama Trail 2 — bước đột phá lịch sử khi Nike kết hợp siêu đệm ZoomX với đế ngoài Vibram Megagrip trứ danh, mang lại độ êm và độ bám đỉnh cao trên đường núi.'
    },
    courtff3: {
      model: 'Asics Court FF 3', brand: 'Asics', category: 'Tennis',
      specs: { 'Thương hiệu': 'Asics', 'Bộ môn': 'Tennis & Pro Pickleball', 'Công nghệ': 'FlyteFoam + TWISTRUSS 2 mảnh + Cổ MONO-SOCK', 'Mặt sân': 'Sân cứng (Hard Court) & Sân Pickleball', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Asics Court FF 3 — chiến hài thửa riêng cùng Novak Djokovic, đồng thời là đôi giày được các VĐV Pickleball và Tennis săn đón nhất nhờ khả năng trượt cứu bóng và khóa cổ chân hoàn hảo.'
    },
    gelres9: {
      model: 'Asics Gel-Resolution X', brand: 'Asics', category: 'Tennis',
      specs: { 'Thương hiệu': 'Asics', 'Bộ môn': 'Tennis & Pro Pickleball', 'Công nghệ': 'DYNAWALL chống lật + Forefoot/Rearfoot GEL + AHARPLUS', 'Mặt sân': 'Sân cứng (Hard Court) & Sân Pickleball', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Asics Gel-Resolution X — chuẩn mực của sự ổn định và độ bền đế trên mặt sân cứng Tennis và Pickleball, khóa chặt hai bên bàn chân trong mọi pha đổi hướng ngang gắt.'
    },
    vapor12: {
      model: 'Nike Court Vapor Pro 3 HC', brand: 'Nike', category: 'Tennis',
      specs: { 'Thương hiệu': 'Nike', 'Bộ môn': 'Tennis & Pro Pickleball', 'Công nghệ': 'Forefoot Air Zoom + Hart Outsole nhẹ bền', 'Mặt sân': 'Sân cứng (Hard Court) & Sân Pickleball', 'Hình thức': 'Order chính hãng 12–15 ngày · New Fullbox' },
      description: 'Nike Court Vapor Pro 3 HC — thiết kế trọng tâm thấp, siêu nhẹ và phản hồi tức thì nhờ túi khí Air Zoom mũi, cực kỳ linh hoạt cho cả Tennis lẫn những pha dink/volley tốc độ trên sân Pickleball.'
    },
  };

  let nextId = 1;
  const list = [];
  function add(groupKey, o) {
    const m = MODELS[groupKey];
    const chart = getChartForProduct(m.brand, groupKey);
    const fit = getModelFit(groupKey);
    const p = Object.assign({
      id: nextId++,
      group: groupKey,
      model: m.model,
      brand: m.brand,
      category: m.category,
      sizeChartKey: chart.key,
      fitBadge: fit.fitBadge,
      fitAdvice: fit.fitAdvice,
      orderMode: 'order_12_15',
      orderDays: '12–15 ngày',
      deposit: 500000,
      price: 0,
      priceOnRequest: false,
      originalPrice: null,
      cost: 0,
      stock: 10,
      status: 'active',
      tag: null,
      dealName: null,
      rating: 5.0,
      reviews: 12,
      sold: 18,
      condition: 'New Fullbox',
      conditionDetail: 'Hàng Order chính hãng 100% New Fullbox — Về tay sau 12–15 ngày',
      sizes: chart.sizes.slice(),
      outOfStockSizes: [],
      sizePrices: {},
      specs: Object.assign({}, m.specs),
      description: m.description,
      gallery: [],
      poster: m.poster || null,
      createdAt: '2026-09-01'
    }, o);
    if (!p.price) { p.price = 0; p.priceOnRequest = true; }
    if (!p.cost && p.price) p.cost = Math.round(p.price * 0.78 / 1000) * 1000;
    p.colorways = [{ name: p.colorName, hex: p.hex || '#111111' }];
    p.name = p.dealName ? `${p.model} "${p.dealName}"` : `${p.model} — ${p.colorName}`;
    delete p.hex;
    list.push(p);
  }

  const ja3 = [
    ['Hồng/Cam', '#F472B6', 2750000, 3150000],
    ['Volt/Cam', '#A3E635', 2790000, 3190000],
    ['Trắng Kem', '#F5F0DC', 2950000, null],
    ['Cam Đào', '#FB7A4A', 2690000, 2990000],
    ['Đen/Nâu', '#3F3027', 2690000, null],
    ['Đỏ/Nâu', '#DC2626', 2950000, null],
    ['Xám/Cam', '#A8A8A8', 2850000, null],
    ['Xanh Ngọc/Đen', '#0D9488', 2750000, null],
    ['Xanh Mint', '#5EEAD4', 2950000, null],
    ['Cam/Tím', '#6D5BD0', 4150000, null],
    ['Hồng Magenta', '#DB2777', 3850000, null],
    ['Xanh Lá', '#4ADE80', 3050000, null],
  ];
  ja3.forEach(([colorName, hex, price, originalPrice], i) => add('ja3', {
    colorName, hex, price, originalPrice,
    image: `public/images/products/ja3-${i + 1}.jpg`,
    poster: i < 6 ? 'public/images/posters/poster-62.jpg' : 'public/images/posters/poster-63.jpg',
    createdAt: `2026-09-${String(10 + i).padStart(2, '0')}`,
  }));

  Object.assign(list[0], {
    dealName: 'Pink Foam', tag: 'DEAL', name: 'Nike Ja 3 "Pink Foam"', createdAt: '2026-10-28',
    gallery: ['public/images/deals/ja3-pinkfoam-1.jpg', 'public/images/deals/ja3-pinkfoam-2.jpg', 'public/images/deals/ja3-pinkfoam-3.jpg', 'public/images/deals/ja3-pinkfoam-4.jpg'],
  });

  const kai2 = [
    ['Xanh Royal', '#2563EB', 1980000, 2350000],
    ['Tím Lavender', '#A78BFA', 1850000, 2190000],
    ['Xanh Sky', '#38BDF8', 2350000, null],
    ['Trắng/Xanh', '#E5E7EB', 1690000, 1990000],
    ['Xanh Ngọc Multi', '#2DD4BF', 1690000, null],
    ['Tím Lông Xù', '#8B7A9E', 2490000, null],
    ['Đỏ', '#DC2626', 2190000, null],
    ['San Hô', '#F97362', 1790000, null],
    ['Đen/Kem', '#1F2937', 2950000, null],
    ['Đen Multi', '#111827', 2350000, null],
    ['Đen/Trắng', '#374151', 2250000, null],
    ['Hồng Lông Xù', '#F4A6C0', 2450000, null],
    ['Triple Black', '#0B0B0B', 1890000, null],
    ['Triple White', '#F8FAFC', 1630000, 1950000],
  ];
  kai2.forEach(([colorName, hex, price, originalPrice], i) => add('kai2', {
    colorName, hex, price, originalPrice,
    image: `public/images/products/kai2-${i + 1}.jpg`,
    poster: i < 6 ? 'public/images/posters/poster-66.jpg' : i < 12 ? 'public/images/posters/poster-67.jpg' : 'public/images/posters/poster-68.jpg',
    createdAt: `2026-08-${String(10 + i).padStart(2, '0')}`,
  }));

  [['Đen', '#111111', 2590000], ['Xanh Navy/Đen', '#1E4E8C', 2590000], ['Trắng', '#F8FAFC', 2650000]].forEach(([colorName, hex, price], i) => add('rc502', {
    colorName, hex, price, originalPrice: 2950000,
    image: `public/images/products/rc502-${i + 1}.jpg`,
    createdAt: `2026-07-${String(10 + i).padStart(2, '0')}`,
  }));

  const deals = [
    ['kai3', 'CNY', 'Kem/Cam Tết', '#F5D58A', 'kai3-cny', 1, '2026-10-31', 2890000, 3390000],
    ['tatum4', 'Bloodline', 'Đen/Đỏ/Trắng', '#111111', 'tatum4-bloodline', 4, '2026-10-30', 2950000, 3450000],
    ['lebron23', 'Grand Opening', 'Trắng/Đỏ Rượu', '#8B1E3F', 'lebron23-grandopening', 4, '2026-10-29', 3890000, 4490000],
    ['wade808', 'Lavender', 'Tím Lavender', '#A855F7', 'wade808-lavender', 4, '2026-10-27', 2790000, 3190000],
    ['tatum4', 'St. Louis Siren Red', 'Đỏ Siren', '#EF4444', 'tatum4-sirenred', 4, '2026-10-26', 2990000, 3450000],
    ['allcity13', 'Family Love', 'Hồng Phấn', '#F5C2D7', 'allcity13-familylove', 4, '2026-10-25', 2590000, 2990000],
    ['ar2', "Valentine's Day", 'Hồng/Trắng', '#F472B6', 'ar2-valentine', 4, '2026-10-24', 2290000, 2690000],
    ['book1', 'Halloween', 'Đen/Kem', '#1F1F1F', 'book1-halloween', 4, '2026-10-23', 3250000, 3750000],
    ['c2026', 'White Orange Green', 'Trắng/Cam/Xanh', '#F97316', 'c2026-wog', 1, '2026-10-22', 2450000, 2890000],
    ['adiospro4', 'Flash Aqua', 'Flash Aqua', '#2DD4BF', 'adiospro4-flashaqua', 2, '2026-10-21', 4790000, 5490000],
    ['book1', 'Sedona', 'Đỏ Cam Sedona', '#EF5B4C', 'book1-sedona', 4, '2026-10-20', 3190000, 3690000],
  ];
  deals.forEach(([g, dealName, colorName, hex, slug, n, createdAt, price, originalPrice]) => {
    const gallery = Array.from({ length: n }, (_, i) => `public/images/deals/${slug}-${i + 1}.jpg`);
    add(g, {
      dealName, colorName, hex, price, originalPrice, tag: 'DEAL', createdAt, gallery,
      image: n >= 4 ? gallery[1] : gallery[0], poster: gallery[0],
      conditionDetail: "Hàng Order chính hãng theo đợt Today's Deal — Cam kết về tay sau 12–15 ngày, đầy đủ hộp và phụ kiện",
    });
  });

  const top40NewModels = [

    ['wow12', 'HIGH-END S-TIER', 'HOT', '2026-11-08', [
      ['Cherry Blossom (Hoa Anh Đào)', '#F9A8D4'],
      ['Blaze (Cam Đỏ Rực)', '#FF5722'],
      ['Azure Blue (Xanh Dương)', '#2563EB'],
    ]],
    ['gamma2', 'HIGH-END S-TIER', 'LIMITED', '2026-11-08', [
      ['Starry Black (Đen Ánh Sao)', '#1E293B'],
      ['Ray Burst (Tím Đa Sắc)', '#7C3AED'],
      ['Radiant (Trắng Ánh Kim)', '#F8FAFC'],
    ]],
    ['spo15', 'HIGH-END A+ TIER', 'HOT', '2026-11-07', [
      ['Greedy Dopamine (Vàng Chanh)', '#BEF264'],
      ['Bamboo Snake (Xanh Lục)', '#4ADE80'],
      ['Alice (Xanh Băng)', '#60A5FA'],
    ]],
    ['wow11', 'HIGH-END FLAGSHIP', 'HOT', '2026-11-07', [
      ['Liberty (Xanh Ngọc Mint)', '#5EEAD4'],
      ['South Beach (Hồng Xanh)', '#F472B6'],
      ['Statue (Xám Điêu Khắc)', '#94A3B8'],
    ]],
    ['kobe8', 'HIGH-END PROTRO', 'LIMITED', '2026-11-07', [
      ['Halo (Triple White)', '#F8FAFC'],
      ['Court Purple (Trắng Tím)', '#6B21A8'],
      ['Venice Beach (Đa Sắc)', '#0EA5E9'],
    ]],
    ['kobe6', 'HIGH-END PROTRO', 'LIMITED', '2026-11-06', [
      ['Reverse Grinch (Đỏ Xanh)', '#EF4444'],
      ['Italian Camo (Rằn Ri Ý)', '#3F6212'],
      ['Sail All-Star (Trắng Kem)', '#F5F5F4'],
    ]],
    ['aj39', 'HIGH-END FLAGSHIP', 'NEW', '2026-11-06', [
      ['Sol (Trắng Đỏ)', '#F8FAFC'],
      ['Lumière (Đen Đế Kem)', '#111827'],
      ['Half Blue (Xanh Băng)', '#93C5FD'],
    ]],
    ['gtcut3', 'HIGH-END SPEED', 'HOT', '2026-11-06', [
      ['USA (Trắng Đỏ Navy)', '#1E3A8A'],
      ['Siren Red (Trắng Cam Đỏ)', '#EF4444'],
      ['Easter (Xanh Pastel)', '#7DD3FC'],
    ]],
    ['wow10low', 'HIGH-END LEGEND', 'HOT', '2026-11-05', [
      ['Lavender (Tím Pastel)', '#C084FC'],
      ['Liberty (Xám Xanh Mint)', '#5EEAD4'],
      ['Black Flash (Trắng Đen)', '#18181B'],
    ]],
    ['kt10', 'HIGH-END SHOOTER', 'NEW', '2026-11-05', [
      ['Dallas (Trắng Bạc Navy)', '#1D4ED8'],
      ['Golden (Vàng Kim)', '#FACC15'],
      ['Black (Đen Huyền)', '#111827'],
    ]],
    ['yushuai18', 'HIGH-END ULTRA', 'NEW', '2026-11-05', [
      ['White (Trắng Đen)', '#F8FAFC'],
      ['Cream Gold (Kem Ánh Kim)', '#F5E6CA'],
      ['Oreo Zebra (Đen Trắng)', '#18181B'],
    ]],
    ['spogame1', 'HIGH-END GUARD', 'NEW', '2026-11-04', [
      ['Pure (Trắng Tinh)', '#F8FAFC'],
      ['Panda (Trắng Đen)', '#18181B'],
      ['Blue Scorpion (Đen Xanh Băng)', '#38BDF8'],
    ]],
    ['ar2pro', 'HIGH-END PRO', 'NEW', '2026-11-04', [
      ['Milky Way (Tím Ngân Hà)', '#8B5CF6'],
      ['Monarch (Xanh Bơ Đen)', '#86EFAC'],
      ['Code Blue (Trắng Đen Xanh)', '#38BDF8'],
    ]],

    ['liren6v2', 'MID-RANGE A+ TIER', 'HOT', '2026-11-04', [
      ['3D Broken Shadow (Đen Đa Sắc)', '#18181B'],
      ['Sky (Xanh Ngọc Băng)', '#67E8F9'],
      ['Obsidian Black (Đen Tuyền)', '#0F172A'],
    ]],
    ['joker2gt', 'MID-RANGE A+ TIER', 'HOT', '2026-11-03', [
      ['Lumos (Xanh Ngọc #15)', '#06B6D4'],
      ['Artemis (Trắng Tinh)', '#F8FAFC'],
      ['Legend of Speed (Trắng Xanh Đỏ)', '#38BDF8'],
      ['LA (Vàng Đế Gum)', '#FACC15'],
    ]],
    ['liren5low', 'MID-RANGE TOURNAMENT', 'HOT', '2026-11-03', [
      ['Strawberry Milkshake (Trắng Hồng)', '#F9A8D4'],
      ['Peach Blossom Wine (Hồng Đào)', '#FDA4AF'],
      ['Adverse Winter (Xanh Lá Đen)', '#84CC16'],
    ]],
    ['ag5pro', 'MID-RANGE TOURNAMENT', 'NEW', '2026-11-03', [
      ['The Mile High City (Đen Xanh Vàng)', '#38BDF8'],
      ['Panda (Đen Kem)', '#18181B'],
      ['Road to Gold (Trắng Đỏ Navy)', '#EF4444'],
    ]],
    ['volanti911', 'MID-RANGE A-TIER', 'HOT', '2026-11-02', [
      ['Zeus (Đen Xanh Ánh Kim)', '#1E3A8A'],
      ['Mercury (Trắng Hologram)', '#E2E8F0'],
      ['Neptune (Xanh Băng)', '#38BDF8'],
    ]],
    ['sonic12pro', 'MID-RANGE TOURNAMENT', 'NEW', '2026-11-02', [
      ['Great White Shark (Xám Cá Mập)', '#94A3B8'],
      ['Blood Moon (Hồng Đỏ Đen)', '#F43F5E'],
      ['Blue White (Trắng Xanh)', '#3B82F6'],
    ]],
    ['sabrina2', 'MID-RANGE GUARD', 'HOT', '2026-11-02', [
      ['Court Vision (Tím Đen)', '#7E22CE'],
      ['White Noise (Trắng Bạc)', '#F8FAFC'],
      ['Iron Grey (Đen Xám)', '#4B5563'],
    ]],
    ['ar1', 'MID-RANGE BEST-SELLER', 'HOT', '2026-11-01', [
      ['Iceman (Xanh Băng)', '#93C5FD'],
      ['Juicy Peach (Hồng Đào Kem)', '#F9A8D4'],
      ['17 Rings (Trắng Vàng Tím)', '#FACC15'],
    ]],
    ['kt9', 'MID-RANGE SHOOTER', 'NEW', '2026-11-01', [
      ['Water Rhyme (Xanh Dương Trắng)', '#0284C7'],
      ['White Blue (Trắng Xanh)', '#E0F2FE'],
      ['Sailboat (Trắng Cam Kem)', '#F97316'],
    ]],
    ['badfive3', 'MID-RANGE OUTDOOR', 'NEW', '2026-11-01', [
      ['White Green (Trắng Xanh Rừng)', '#166534'],
      ['Cream White (Kem Đế Hồng)', '#F472B6'],
    ]],
    ['big3quick', 'MID-RANGE TRACTION', 'HOT', '2026-10-31', [
      ['Miro (Trắng Xanh Vàng)', '#FACC15'],
      ['Luck on Fire (Trắng Cam)', '#EA580C'],
      ['Duckyo (Xanh Chuối Pastel)', '#BEF264'],
    ]],

    ['allcity14', 'STUDENT / OUTDOOR A+ TIER', 'HOT', '2026-10-31', [
      ['Tropical Teal (Xanh Ngọc Nhiệt Đới)', '#14B8A6'],
      ['Ice Blood (Trắng Băng)', '#E0F2FE'],
      ['Chemical Reaction (Xanh Mint Pastel)', '#86EFAC'],
    ]],
    ['sw8pro', 'STUDENT / OUTDOOR A-TIER', 'HOT', '2026-10-30', [
      ['Orange (Cam Lửa)', '#FB923C'],
      ['White (Trắng Ánh Xà Cừ)', '#F8FAFC'],
      ['Purple (Tím Đêm)', '#7E22CE'],
    ]],
    ['sw7', 'STUDENT OUTDOOR BEAST', 'NEW', '2026-10-30', [
      ['Impulse (Đen Xanh Galaxy)', '#2563EB'],
      ['Dark Matter (Đen Huyền)', '#18181B'],
      ['Blue (Xanh Băng Đế Cam)', '#60A5FA'],
    ]],
    ['taichi5', 'STUDENT COMFORT', 'NEW', '2026-10-29', [
      ['White Purple (Trắng Navy Tím)', '#312E81'],
      ['White Green (Trắng Xanh Ngọc)', '#2DD4BF'],
      ['White Black (Đen Trắng)', '#18181B'],
    ]],
    ['wadeshadow5', 'STUDENT VALUE', 'NEW', '2026-10-29', [
      ['Liberty (Xanh Mint)', '#5EEAD4'],
      ['Buzzer Beater (Trắng Xanh Hồng)', '#38BDF8'],
      ['Black Neon Pink (Đen Viền Hồng)', '#18181B'],
    ]],
    ['dvd2', 'STUDENT GUARD', 'NEW', '2026-10-28', [
      ['Pink (Đỏ Hồng)', '#FB7185'],
      ['Xiaolongbao SE (Trắng Kem)', '#F5F0DC'],
      ['Toy SE (Xanh Lá)', '#4ADE80'],
    ]],
    ['immortality4', 'STUDENT NIKE', 'NEW', '2026-10-28', [
      ['White Gum (Trắng Đế Gum)', '#F8FAFC'],
      ['Wolf Grey Navy (Xám Navy)', '#64748B'],
      ['Racer Blue (Xanh Hoàng Gia)', '#2563EB'],
    ]],
    ['ktsplash6', 'STUDENT SUMMER', 'NEW', '2026-10-27', [
      ['Pink (Trắng Hồng Đào)', '#FB7185'],
      ['Green (Trắng Xanh Ngọc)', '#2DD4BF'],
    ]],
  ];

  top40NewModels.forEach(([g, _tierLabel, tag, createdAt, colors]) => {
    const m = MODELS[g];
    if (!m) return;
    colors.forEach(([colorName, hex], idx) => {
      const photoPath = `public/images/top40/${g}-${idx + 1}.jpg`;
      add(g, {
        colorName,
        hex,
        price: 0,
        priceOnRequest: true,
        tag,
        createdAt,
        image: photoPath,
        gallery: [photoPath],
        conditionDetail: 'Hàng Order chính hãng 12–15 ngày (Top 40 Bóng Rổ VN 2026) — Nhấn "Inbox for details" để nhắn trực tiếp Fanpage Facebook Cookie\'s Kicks',
      });
    });
  });

  const nikeKobe30 = [
    ['kobe3', 'kobe3-1', 'Pure Platinum Armory Blue (IV7127-001)', '#E2E8F0', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe3', 'kobe3-2', 'Orca (IV7127-002)', '#18181B', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe5', 'kobe5-1', 'Lower Merion Aces Away (IM0557-001)', '#991B1B', 'LIMITED', '2026-11-08', [1, 3, 4]],
    ['kobe5', 'kobe5-2', 'Year of the Mamba Eggplant (IB4481-500)', '#4C1D95', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe5', 'kobe5-3', 'Chaos (386429-531)', '#84CC16', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe5', 'kobe5-4', 'X-Ray (HJ4303-400)', '#2563EB', 'HOT', '2026-11-08', [1, 2, 3, 4]],
    ['kobe6', 'kobe6-4', 'Total Orange (IH1871-800)', '#EA580C', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe6', 'kobe6-5', 'Black History Month (429659-011)', '#D97706', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe8', 'kobe8-4', 'Mambacurial (IO6253-500)', '#DB2777', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe8', 'kobe8-5', 'What The 2025 (HM9621-900)', '#2563EB', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe8', 'kobe8-6', 'Black University Gold (FN0266-002)', '#F59E0B', 'HOT', '2026-11-08', [1, 2, 3, 4]],
    ['kobe8', 'kobe8-7', 'Lakers Home (HF9550-100)', '#7E22CE', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe8', 'kobe8-8', 'Black History Month (583112-001)', '#EA580C', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe9', 'kobe9-1', 'University Red Metallic Gold (IH1400-600)', '#DC2626', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe9', 'kobe9-2', 'Mambacita (FZ7333-002)', '#1F2937', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe9', 'kobe9-3', 'Elite What The 2025 (FZ7335-101)', '#6EE7B7', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe9', 'kobe9-4', 'Elite High Halo (FZ7335-100)', '#F8FAFC', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe9', 'kobe9-5', 'Elite Masterpiece (FZ7335-001)', '#18181B', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe9', 'kobe9-6', 'EM China (683251-670)', '#DC2626', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe9', 'kobe9-7', 'EM Silk (646701-676)', '#9D174D', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe10', 'kobe10-1', 'Halo EP (IO3416-100)', '#F8FAFC', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe10', 'kobe10-2', 'Elite Low Halo GS (IR1850-100)', '#E2E8F0', 'NEW', '2026-11-08', [1, 2, 3, 4]],
    ['kobe10', 'kobe10-3', 'Blackout (705317-005)', '#312E81', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['kobe11', 'kobe11-1', 'Lower Merion (836183-006)', '#94A3B8', 'LIMITED', '2026-11-08', [1, 2, 3, 4]],
    ['sabrina4', 'sabrina4-1', 'Eyes on the Prize (IU4484-400)', '#38BDF8', 'HOT', '2026-11-08', [1, 2, 3, 4]],
    ['sabrina4', 'sabrina4-2', 'Metallic Silver (II0403-101)', '#CBD5E1', 'NEW', '2026-11-08', [1, 2, 3, 4]],
    ['book2', 'book2-1', 'Tiger Camo (IV5770-001)', '#EA580C', 'HOT', '2026-11-08', [1, 3, 4]],
    ['gtcutacademy2', 'gtcutacademy2-1', 'Black University Red (HV9775-003)', '#EF4444', 'NEW', '2026-11-08', [1, 3, 4]],
    ['gtcutacademy2', 'gtcutacademy2-2', 'White (HV9775-101)', '#F8FAFC', 'NEW', '2026-11-08', [1, 3, 4]],
    ['kd18', 'kd18-1', 'Slim Reaper (IM1347-001)', '#18181B', 'HOT', '2026-11-08', [1, 2, 3, 4]],
  ];

  nikeKobe30.forEach(([g, slug, colorName, hex, tag, createdAt, angleIndices]) => {
    const m = MODELS[g];
    if (!m) return;
    const gallery = angleIndices.map(idx => idx === 1 ? `public/images/top40/${slug}.jpg` : `public/images/top40/${slug}-g${idx}.jpg`);
    add(g, {
      colorName,
      hex,
      price: 0,
      priceOnRequest: true,
      tag,
      createdAt,
      image: gallery[0],
      poster: gallery[0],
      gallery,
      conditionDetail: 'Hàng Order chính hãng 100% New Fullbox (Nike Basketball / Kobe Protro Collection) — Nhấn "Inbox for details" để nhận báo giá theo size',
    });
  });

  const multiSport33 = [
    ['bladedf01', 'bladedf01-1', 'Blade II Pro White Gold (AYAT005)', '#EAB308', 2690000, 3150000, 'HOT', '2026-11-09', [1, 2]],
    ['bladedf01', 'bladedf01-2', 'Thunder II Pro Black Red (AYAT001)', '#DC2626', 2890000, 3390000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['yunting', 'yunting-1', 'Ace V2 White Crystal Blue', '#38BDF8', 2190000, 2590000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['yunting', 'yunting-2', 'All-Around King V2 White Red', '#EF4444', 2390000, 2790000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['halbertec', 'halbertec-1', 'Halberd III White Clear Blue (AYZS016-1)', '#60A5FA', 1890000, 2250000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['halbertec', 'halbertec-2', 'Saga III Pro White Gold', '#F59E0B', 2450000, 2890000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['yonex65z3', 'yonex65z3-1', '65Z4 25th Anniversary White Gold', '#D97706', 3190000, 3690000, 'LIMITED', '2026-11-09', [1, 2, 3]],
    ['yonex65z3', 'yonex65z3-2', '65Z4 Viktor Axelsen Edition (Beige)', '#D6D3D1', 3290000, 3790000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['yonex65z3', 'yonex65z3-3', '65Z3 Wide White Orange (SHB65Z3)', '#F97316', 2890000, 3350000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['victora970', 'victora970-1', 'A970 NitroLite White Brook Green', '#10B981', 2950000, 3450000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['victora970', 'victora970-2', 'A970ACE Lee Zii Jia Black Purple', '#7C3AED', 3090000, 3590000, 'LIMITED', '2026-11-09', [1, 2, 3]],
    ['feidian5', 'feidian5-1', 'Feidian 6 Elite White Green Carbon', '#84CC16', 3690000, 4490000, 'HOT', '2026-11-09', [1]],
    ['feidian5', 'feidian5-2', 'Feidian 6 Elite Island Blue Carbon', '#0EA5E9', 3690000, 4490000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['feidian5', 'feidian5-3', 'Feidian 6 Elite Black Red Carbon', '#DC2626', 3690000, 4490000, 'HOT', '2026-11-09', [1]],
    ['xtep160x6', 'xtep160x6-1', '160X 8.0 Ultra Neon Green Carbon', '#A3E635', 3490000, 4190000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['xtep160x6', 'xtep160x6-2', '160X 8.0 Ultra Laser Red Silver', '#EF4444', 3490000, 4190000, 'LIMITED', '2026-11-09', [1, 2, 3]],
    ['xtep160x6', 'xtep160x6-3', '160X 8.0 Pro White Gold Carbon', '#EAB308', 2990000, 3590000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['qiaodanplaid', 'qiaodanplaid-1', 'Feiying Plaid 3.0 Energy Bomb', '#F97316', 3290000, 3890000, 'HOT', '2026-11-09', [1]],
    ['qiaodanplaid', 'qiaodanplaid-2', 'Feiying Plaid 3.0 Sky Line Blue', '#38BDF8', 3290000, 3890000, 'NEW', '2026-11-09', [1]],
    ['flame4', 'flame4-1', 'Flame 4.0 Triple Red Carbon', '#DC2626', 2590000, 3190000, 'HOT', '2026-11-09', [1]],
    ['flame4', 'flame4-2', 'Flame 3.0 Mint Green Carbon', '#34D399', 2290000, 2790000, 'SALE', '2026-11-09', [1, 2, 3]],
    ['kailasfugaex3', 'kailasfugaex3-1', 'Fuga EX 3 Flame Red Vibram', '#DC2626', 3390000, 3990000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['kailasfugaex3', 'kailasfugaex3-2', 'Fuga EX 330 Ultra White Vibram', '#E2E8F0', 3690000, 4290000, 'LIMITED', '2026-11-09', [1, 2, 3]],
    ['kailasfugadu', 'kailasfugadu-1', 'Fuga DU 2 Trail Vibram', '#F59E0B', 3290000, 3850000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['kailasfugadu', 'kailasfugadu-2', 'Fuga DU Monster Vibram', '#18181B', 3590000, 4190000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['zegama2', 'zegama2-1', 'Pure Platinum Pink Foam (FD5190-009)', '#F472B6', 3590000, 4290000, 'HOT', '2026-11-09', [1, 2, 3]],
    ['zegama2', 'zegama2-2', 'White Black Metallic Silver (FD5191-104)', '#18181B', 3590000, 4290000, 'NEW', '2026-11-09', [1, 2, 3]],
    ['courtff3', 'courtff3-1', 'White Black Coffee (1042A220-108)', '#78350F', 3690000, 4290000, 'HOT', '2026-11-09', [1, 2]],
    ['courtff3', 'courtff3-2', 'Night Energy Graphite Grey (1041A569-020)', '#1F2937', 3790000, 4390000, 'LIMITED', '2026-11-09', [1, 2]],
    ['gelres9', 'gelres9-1', 'Midnight White (1041A481-403)', '#1E3A8A', 3190000, 3690000, 'HOT', '2026-11-09', [1, 2]],
    ['gelres9', 'gelres9-2', 'White Black Coffee (1042A279-106)', '#F5F5F4', 3190000, 3690000, 'NEW', '2026-11-09', [1, 2]],
    ['vapor12', 'vapor12-1', 'Smokey Blue Hard Court (FZ2161-121)', '#60A5FA', 2990000, 3590000, 'NEW', '2026-11-09', [1, 2]],
    ['vapor12', 'vapor12-2', 'Triple White Hard Court (FZ2161-102)', '#F8FAFC', 2990000, 3590000, 'HOT', '2026-11-09', [1, 2]],
  ];

  multiSport33.forEach(([g, slug, colorName, hex, price, originalPrice, tag, createdAt, angleIndices]) => {
    const m = MODELS[g];
    if (!m) return;
    const gallery = angleIndices.map(idx => idx === 1 ? `public/images/top40/${slug}.jpg` : `public/images/top40/${slug}-g${idx}.jpg`);
    add(g, {
      colorName,
      hex,
      price,
      originalPrice,
      priceOnRequest: false,
      tag,
      createdAt,
      image: gallery[0],
      poster: gallery[0],
      gallery,
      conditionDetail: 'Hàng Order chính hãng 100% New Fullbox (Asian Performance Lab & Global Authentic) — Giao toàn quốc 12–15 ngày',
    });
  });

  window.CK_SIZE_CHARTS = SIZE_CHARTS;
  window.CK_MODEL_FIT = MODEL_FIT;
  window.CK_SIZING = CK_SIZING;
  window.CK_BASE_PRODUCTS = list;
  window.CK_MODELS = MODELS;
})();
