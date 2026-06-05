// ✅ دالة لتنظيف اسم الملف
function sanitizeFileName(fileName: string): string {
  // إزالة المسارات والرموز الخطيرة
  return fileName
    .replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_')  // يسمح بالعربية والإنجليزية والأرقام
    .replace(/\.\./g, '_')  // يمنع path traversal
    .replace(/^\.+/, '')     // يمنع إخفاء الملفات
    .substring(0, 200);      // تحديد طول أقصى
}

// في POST function:
const safeName = sanitizeFileName(file.name);
const fileName = `${user.id}/${Date.now()}_${safeName}`;
