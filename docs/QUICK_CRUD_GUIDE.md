# 🚀 Hướng dẫn thêm CRUD cho Table mới

> Chỉ cần **5 bước đơn giản** để có đầy đủ CRUD cho một table mới!

---

## Flow: 5 bước

```
1. Tạo model trong prisma/schema.prisma
2. pnpm db:push
3. pnpm generate:crud ModelName
4. Register router + export config + sidebar link
5. Done! 🎉
```

---

## Ví dụ: Thêm quản lý **Product**

### Bước 1: Tạo Prisma Model

📁 **File:** `prisma/schema.prisma`

```prisma
model Product {
    id          String   @id @default(cuid())
    name        String
    slug        String   @unique
    description String?
    price       Float
    stock       Int      @default(0)
    isActive    Boolean  @default(true)
    categoryId  String
    category    Category @relation(fields: [categoryId], references: [id])
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
}
```

> 💡 **Tips:**
> - Luôn có `id`, `createdAt`, `updatedAt`
> - Dùng `String?` cho optional fields
> - Dùng `@default()` cho giá trị mặc định
> - Thêm relation nếu cần (như `categoryId` → `Category`)

---

### Bước 2: Push Database

```bash
pnpm db:push
```

---

### Bước 3: Chạy Generator

```bash
pnpm generate:crud Product
```

**Kết quả:**
```
🔍 Reading Prisma schema...
✅ Found model: Product (10 fields)

🚀 Generating CRUD files...
✅ src/lib/trpc/routers/product.ts
✅ src/lib/form-configs/product.config.ts
✅ src/app/(dashboard)/products/page.tsx
✅ src/app/(dashboard)/products/new/page.tsx
✅ src/app/(dashboard)/products/[id]/edit/page.tsx
```

Generator tự động:
- ✅ Đọc tất cả fields từ schema
- ✅ Map types đúng (String → text, Int → number, Boolean → checkbox)
- ✅ Tạo validation với Zod
- ✅ Detect relations → tạo `getFormData` query
- ✅ Generate List page với columns đầy đủ
- ✅ Generate Create/Edit pages với đúng fields

---

### Bước 4: Register & Link

**4.1. Register router** trong `src/lib/trpc/routers/_app.ts`:

```typescript
import { productRouter } from './product'

export const appRouter = router({
    // ... existing routers
    product: productRouter,
})
```

**4.2. Export form config** trong `src/lib/form-configs/index.ts`:

```typescript
export { productFormConfig } from './product.config'
```

**4.3. Thêm sidebar link** trong `src/components/dashboard/sidebar.tsx`:

```typescript
import { Package } from 'lucide-react'

// Thêm vào contentItems hoặc managementItems
{ icon: Package, label: "Products", href: "/products" },
```

---

### Bước 5: Done! 🎉

Truy cập: http://localhost:3000/products

---

## 📋 Checklist nhanh

```
[ ] Thêm model vào prisma/schema.prisma
[ ] pnpm db:push
[ ] pnpm generate:crud ModelName
[ ] Register router trong _app.ts
[ ] Export config trong form-configs/index.ts
[ ] Thêm sidebar link
[ ] Test CRUD!
```

---

## 🔧 Tùy chỉnh (nếu cần)

### Các loại field được hỗ trợ

| Prisma Type | Form Type | Ghi chú |
|-------------|-----------|---------|
| `String` | text | Mặc định |
| `String` (email) | email | Nếu tên field chứa "email" |
| `String` (password) | password | Nếu tên field chứa "password" |
| `String` (description/content) | textarea | Nếu tên field chứa "description" hoặc "content" |
| `Int`, `Float` | number | |
| `Boolean` | checkbox | |
| `DateTime` | datetime | |
| `Relation` | relation | Tự động detect từ schema |

### Thêm multi-relation (many-to-many)

Generator chưa hỗ trợ auto-detect many-to-many. Nếu cần, thêm thủ công vào form config:

```typescript
{
    name: 'tagIds',
    label: 'Tags',
    type: 'multi-relation',
    relation: {
        model: 'Tag',
        displayField: 'name',
        valueField: 'id',
        dataKey: 'tags',
    },
}
```

---

## 💡 Tips

1. **Đặt tên field rõ ràng** - Generator dựa vào tên để chọn field type (email, password, description)

2. **Thêm relation trước** - Nếu Product cần Category, đảm bảo Category model đã tồn tại

3. **Xem files generated** - Nếu cần customize, mở file và sửa trực tiếp

4. **Restart server** - Sau khi register router, có thể cần restart dev server

---

## 🚀 Chạy lại generator

Nếu files đã tồn tại, generator sẽ skip. Muốn generate lại:

```bash
# Xóa files cũ trước
Remove-Item -Recurse -Force src\app\(dashboard)\products
Remove-Item -Force src\lib\trpc\routers\product.ts
Remove-Item -Force src\lib\form-configs\product.config.ts

# Chạy lại
pnpm generate:crud Product
```
