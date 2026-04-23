# File Management Optimization

## 📋 Tổng quan

Tối ưu hóa hệ thống quản lý file trong frontend, cải thiện performance, memory management và code maintainability.

## ✨ Cải tiến chính

### 1. **Custom Hooks** 

#### `useFileUrl` Hook
- Tự động fetch và cache file URL với authentication
- Cleanup blob URLs khi component unmount
- Loading và error states built-in

```javascript
const { url, loading, error } = useFileUrl(fileId);
```

#### `useFileUrlCache` Hook  
- Quản lý cache cho nhiều files
- Tự động cleanup tất cả blob URLs
- Methods: `fetchFileUrl`, `revokeFileUrl`, `clearCache`

```javascript
const { fetchFileUrl, revokeFileUrl, clearCache } = useFileUrlCache();
```

### 2. **Reusable AuthMedia Component**

Component tái sử dụng để hiển thị authenticated media (images/audio).

**Features:**
- ✅ Auto loading states với skeleton
- ✅ Error handling với UI
- ✅ Lazy loading cho images
- ✅ Metadata preload cho audio
- ✅ Memoized để tránh re-render không cần thiết

**Usage:**
```jsx
<AuthMedia 
  fileId="file-uuid" 
  type="IMAGE" 
  alt="Description"
  className="w-full h-48 object-cover"
  onClick={handleClick}
/>
```

### 3. **Memory Management Improvements**

#### Trước:
```javascript
// ❌ Blob URLs không được cleanup đúng cách
const [fileUrls, setFileUrls] = useState({});

useEffect(() => {
  return () => {
    Object.values(fileUrls).forEach(url => {
      URL.revokeObjectURL(url);
    });
  };
}, [fileUrls]); // ⚠️ Dependencies sai
```

#### Sau:
```javascript
// ✅ Sử dụng useRef và cleanup đúng cách
const fileUrlsRef = useRef({});

useEffect(() => {
  return () => {
    Object.values(fileUrlsRef.current).forEach(url => {
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    fileUrlsRef.current = {};
  };
}, []); // ✅ Chỉ cleanup khi unmount
```

### 4. **Performance Optimizations**

#### useCallback cho functions
```javascript
const handleUpload = useCallback(async (e) => {
  // ... logic
}, [uploadData, loadFiles]);

const handleDelete = useCallback(async (fileId) => {
  revokeFileUrl(fileId); // Cleanup trước khi delete
  // ... logic
}, [files.length, pagination.currentPage, loadFiles]);
```

#### Loại bỏ duplicate useEffect
```javascript
// ❌ Trước: 2 useEffects gọi loadFiles()
useEffect(() => { loadFiles(); }, [fileType, pagination.currentPage]);
useEffect(() => { loadFiles(); }, [fileType]); // Duplicate!

// ✅ Sau: 1 useEffect duy nhất
useEffect(() => { loadFiles(); }, [fileType, pagination.currentPage]);
```

### 5. **Better Error Handling**

#### UI Error Messages
```jsx
{error && (
  <div className={`mb-6 p-4 rounded-lg ${
    error.includes('success') 
      ? 'bg-green-50 text-green-800' 
      : 'bg-red-50 text-red-800'
  }`}>
    <div className="flex items-center justify-between">
      <span>{error}</span>
      <button onClick={() => setError(null)}>✕</button>
    </div>
  </div>
)}
```

#### Replace alert() với state-based messages
```javascript
// ❌ Trước
alert('File uploaded successfully!');

// ✅ Sau  
setError('File uploaded successfully!');
```

### 6. **Code Organization**

```
src/
├── components/
│   └── AuthMedia.jsx          # Reusable media component
├── hooks/
│   └── useFileUrl.js          # Custom hooks for file URL management
├── pages/
│   └── admin/
│       └── AdminFiles.jsx     # Optimized file management page
└── services/
    └── fileService.js         # File API service
```

## 📊 Kết quả

### Memory Leaks
- ✅ **Trước:** Blob URLs không được cleanup → Memory leak
- ✅ **Sau:** Tất cả blob URLs được cleanup tự động

### Performance
- ✅ **Reduced re-renders:** Sử dụng useCallback, useMemo
- ✅ **Lazy loading:** Images chỉ load khi cần
- ✅ **Better caching:** Không fetch lại file đã có trong cache

### Code Quality
- ✅ **DRY:** Loại bỏ duplicate code (AuthImage, AuthAudio → AuthMedia)
- ✅ **Separation of Concerns:** Logic tách ra hooks
- ✅ **Reusability:** Components và hooks có thể tái sử dụng
- ✅ **Maintainability:** Code dễ đọc, dễ maintain hơn

### User Experience
- ✅ **Loading states:** Skeleton loading UX tốt hơn
- ✅ **Error handling:** UI hiển thị lỗi rõ ràng
- ✅ **Better feedback:** Toast messages thay vì alert()

## 🚀 Sử dụng

### Import AuthMedia component
```jsx
import AuthMedia from '../../components/AuthMedia';

// Hiển thị image
<AuthMedia 
  fileId={file.id} 
  type="IMAGE" 
  alt={file.fileName}
  className="w-full h-48 object-cover rounded"
  onClick={() => handlePreview(file)}
/>

// Hiển thị audio
<AuthMedia 
  fileId={file.id} 
  type="AUDIO" 
  className="w-full"
/>
```

### Sử dụng useFileUrl hook
```jsx
import useFileUrl from '../hooks/useFileUrl';

function MyComponent({ fileId }) {
  const { url, loading, error } = useFileUrl(fileId);
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage />;
  
  return <img src={url} />;
}
```

### Sử dụng useFileUrlCache hook
```jsx
import { useFileUrlCache } from '../hooks/useFileUrl';

function MyComponent() {
  const { fetchFileUrl, revokeFileUrl } = useFileUrlCache();
  
  const handleDelete = async (fileId) => {
    revokeFileUrl(fileId); // Cleanup cache
    await deleteFile(fileId);
  };
}
```

## 📝 Best Practices

1. **Always cleanup blob URLs**
   - Sử dụng useEffect cleanup function
   - Revoke URL trước khi delete file

2. **Use custom hooks**
   - Tách logic phức tạp ra hooks
   - Reuse logic across components

3. **Memoization**
   - useCallback cho event handlers
   - useMemo cho computed values
   - memo() cho components

4. **Error handling**
   - UI-based error messages
   - Loading states
   - Fallback UI cho failed loads

5. **State management**
   - useRef cho values không trigger re-render
   - useState cho UI state
   - Avoid unnecessary state updates

## 🔧 Future Improvements

- [ ] Add image compression before upload
- [ ] Implement drag & drop upload
- [ ] Add bulk operations (select multiple, delete all)
- [ ] Implement infinite scroll instead of pagination
- [ ] Add file preview in modal for audio files
- [ ] Implement file search/filter
- [ ] Add file metadata editing
- [ ] Implement file versioning
