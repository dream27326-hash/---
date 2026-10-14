/**
 * Compress an image file to a small base64 string (max ~150KB)
 * to store safely in Firestore without external bucket blockers.
 */
export const compressImageFile = (file: File, maxWidth = 800, quality = 0.75): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        elem.width = width;
        elem.height = height;
        const ctx = elem.getContext('2d');
        if (!ctx) {
          resolve(img.src);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = elem.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const PRESET_EQUIPMENT_IMAGES = [
  {
    label: 'กล้อง Sony Mirrorless',
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'กล้อง Lumix Video 4K',
    url: 'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'ไมค์ลอยไร้สาย Rode Wireless',
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'ไมโครโฟนสตูดิโอ Shure',
    url: 'https://images.unsplash.com/photo-1583795128727-6ec3642408f8?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'ขาตั้งกล้อง Manfrotto Fluid Head',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'กิมบอล DJI Ronin Stabilizer',
    url: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'โปรเจกเตอร์เลเซอร์ BenQ',
    url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'ชุดไฟสตูดิโอ Softbox LED',
    url: 'https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Apple iPad Pro & Pencil',
    url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'การ์ดแคปเจอร์ Elgato Cam Link',
    url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
  },
];
