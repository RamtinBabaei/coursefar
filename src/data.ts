export type Role = 'student' | 'instructor' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  avatarUrl?: string | null;
  specialty?: string;
  createdAt: string;
};

export type Instructor = {
  id: string;
  name: string;
  avatar: string | null;
  specialty: string;
  bio: string;
  skills: string[];
  teachingStyle: string;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  rating: string;
  students: number;
  price: string;
  instructorId: string;
  cover: string;
  objectives: string[];
  prerequisites: string;
  published: boolean;
  createdAt: string;
  pathIds: string[];
};

export type Enrollment = {
  id: string;
  userId: string;
  courseId: string;
  progress: number;
  completedLessons: number;
  enrolledAt: string;
};

export type PathStep = {
  courseId: string;
  why: string;
  learn: string;
  prerequisite: string;
  next: string;
};

export type LearningPath = {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  color: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
  icon: string;
  steps: PathStep[];
};

export const instructors: Instructor[] = [
  { id: 'ins-sara', name: 'سارا احمدی', avatar: '/assets/instructors/sara.png', specialty: 'طراحی محصول و UI/UX', bio: 'طراح محصول و مدرس تجربه کاربری با بیش از ۸ سال تجربه در ساخت محصولات دیجیتال.', skills: ['تحقیق کاربر', 'Figma و Design System', 'طراحی محصول'], teachingStyle: 'پروژه‌محور و همراه با بازخورد' },
  { id: 'ins-arash', name: 'آرش نوذری', avatar: '/assets/instructors/arash.png', specialty: 'پایتون و یادگیری ماشین', bio: 'مهندس یادگیری ماشین که مفاهیم پیچیده را با مثال‌های واقعی و قابل اجرا آموزش می‌دهد.', skills: ['Python', 'Machine Learning', 'تحلیل داده'], teachingStyle: 'مفهومی، عملی و مرحله‌به‌مرحله' },
  { id: 'ins-nazanin', name: 'نازنین کریمی', avatar: '/assets/instructors/nazanin.png', specialty: 'تحلیل داده و هوش تجاری', bio: 'تحلیل‌گر ارشد داده و مشاور هوش تجاری در پروژه‌های سازمانی و استارتاپی.', skills: ['Power BI', 'Excel پیشرفته', 'داشبورد مدیریتی'], teachingStyle: 'مسئله‌محور با داده‌های واقعی' },
  { id: 'ins-mohsen', name: 'محسن رضایی', avatar: '/assets/instructors/mohsen.png', specialty: 'توسعه وب و React', bio: 'توسعه‌دهنده فرانت‌اند و رهبر تیم که روی معماری مقیاس‌پذیر وب تمرکز دارد.', skills: ['React', 'TypeScript', 'معماری فرانت‌اند'], teachingStyle: 'کدنویسی تمیز و ساخت محصول' },
  { id: 'ins-leila', name: 'دکتر لیلا موسوی', avatar: '/assets/instructors/leila.png', specialty: 'امنیت سایبری', bio: 'پژوهشگر امنیت اطلاعات و مدرس مباحث امنیت کاربردی برای توسعه‌دهندگان.', skills: ['امنیت وب', 'شبکه', 'OWASP'], teachingStyle: 'آزمایشگاهی و سناریومحور' },
  { id: 'ins-kian', name: 'کیان مرادی', avatar: '/assets/instructors/kian.png', specialty: 'بک‌اند و پایگاه داده', bio: 'مهندس نرم‌افزار بک‌اند با تمرکز بر Node.js، API و طراحی پایگاه داده.', skills: ['Node.js', 'Express', 'SQL و معماری API'], teachingStyle: 'از ایده تا API قابل انتشار' },
  { id: 'ins-maryam', name: 'مریم یوسفی', avatar: '/assets/instructors/maryam.png', specialty: 'مبانی برنامه‌نویسی', bio: 'مدرس مبانی کامپیوتر که شروع برنامه‌نویسی را برای مبتدیان ساده و لذت‌بخش می‌کند.', skills: ['الگوریتم', 'حل مسئله', 'مبانی برنامه‌نویسی'], teachingStyle: 'آرام، روشن و مناسب شروع از صفر' },
  { id: 'ins-omid', name: 'امید حیدری', avatar: '/assets/instructors/omid.png', specialty: 'Git، تیم و مهندسی نرم‌افزار', bio: 'مهندس نرم‌افزار و منتور تیم‌های فنی در مسیر ساخت و انتشار محصول.', skills: ['Git و GitHub', 'Code Review', 'کار تیمی'], teachingStyle: 'استانداردهای واقعی تیم‌های حرفه‌ای' },
];

const course = (data: Omit<Course, 'createdAt' | 'published'> & Partial<Pick<Course, 'createdAt' | 'published'>>): Course => ({ createdAt: data.createdAt ?? '2026-09-01', published: data.published ?? true, ...data });

export const initialCourses: Course[] = [
  course({ id: 'c-programming', title: 'مبانی برنامه‌نویسی و حل مسئله', slug: 'programming-fundamentals', category: 'برنامه‌نویسی', level: 'مقدماتی', duration: '۱۸ ساعت', lessons: 32, rating: '۴.۹', students: 14800, price: 'رایگان', instructorId: 'ins-maryam', cover: '/assets/covers/programming.svg', description: 'شروع مطمئن برنامه‌نویسی با الگوریتم، تفکر منطقی و تمرین‌های قابل فهم.', objectives: ['درک الگوریتم و فلوچارت', 'حل مسئله با کد', 'آشنایی با ساختارهای داده پایه'], prerequisites: 'بدون پیش‌نیاز؛ فقط انگیزه یادگیری', pathIds: ['path-frontend', 'path-backend', 'path-data'] }),
  course({ id: 'c-python', title: 'برنامه‌نویسی پایتون از صفر تا پروژه', slug: 'python-programming', category: 'پایتون', level: 'مقدماتی تا متوسط', duration: '۲۴ ساعت', lessons: 46, rating: '۴.۹', students: 12400, price: '۸۹۰ هزار تومان', instructorId: 'ins-arash', cover: '/assets/covers/python.svg', description: 'پایتون را با تمرین‌های کاربردی، پروژه‌های کوچک و اصول کدنویسی تمیز یاد بگیر.', objectives: ['نوشتن برنامه‌های پایتون', 'کار با فایل و API', 'ساخت پروژه خط فرمان'], prerequisites: 'آشنایی مقدماتی با برنامه‌نویسی', pathIds: ['path-ai', 'path-ml', 'path-data'] }),
  course({ id: 'c-html-css', title: 'HTML و CSS؛ ساخت اولین وب‌سایت', slug: 'html-css', category: 'توسعه وب', level: 'مقدماتی', duration: '۱۴ ساعت', lessons: 28, rating: '۴.۸', students: 9700, price: '۵۹۰ هزار تومان', instructorId: 'ins-mohsen', cover: '/assets/covers/html-cover.png', description: 'ساخت صفحات semantic، واکنش‌گرا و زیبا با HTML و CSS مدرن.', objectives: ['ساخت صفحه semantic', 'طراحی Responsive', 'استفاده از Flexbox و Grid'], prerequisites: 'بدون پیش‌نیاز', pathIds: ['path-frontend', 'path-fullstack'] }),
  course({ id: 'c-js', title: 'جاوااسکریپت مدرن و پروژه‌های تعاملی', slug: 'modern-javascript', category: 'توسعه وب', level: 'متوسط', duration: '۲۲ ساعت', lessons: 41, rating: '۴.۸', students: 11300, price: '۷۹۰ هزار تومان', instructorId: 'ins-mohsen', cover: '/assets/covers/javascript.svg', description: 'از مبانی زبان تا async، DOM و ساخت اپلیکیشن‌های تعاملی واقعی.', objectives: ['تسلط بر ES2022', 'کار با DOM و Fetch', 'ساخت پروژه تعاملی'], prerequisites: 'HTML و CSS مقدماتی', pathIds: ['path-frontend', 'path-fullstack'] }),
  course({ id: 'c-react', title: 'React حرفه‌ای؛ ساخت رابط‌های مقیاس‌پذیر', slug: 'react-professional', category: 'React', level: 'متوسط', duration: '۲۶ ساعت', lessons: 48, rating: '۴.۹', students: 8900, price: '۹۹۰ هزار تومان', instructorId: 'ins-mohsen', cover: '/assets/covers/react.svg', description: 'ساخت رابط کاربری حرفه‌ای با کامپوننت‌ها، state، فرم‌ها و معماری قابل توسعه.', objectives: ['طراحی کامپوننت‌های reusable', 'مدیریت state', 'ساخت SPA با React'], prerequisites: 'JavaScript مدرن', pathIds: ['path-frontend', 'path-fullstack'] }),
  course({ id: 'c-typescript', title: 'TypeScript برای پروژه‌های واقعی', slug: 'typescript-real-projects', category: 'TypeScript', level: 'متوسط', duration: '۱۲ ساعت', lessons: 22, rating: '۴.۷', students: 6400, price: '۶۹۰ هزار تومان', instructorId: 'ins-mohsen', cover: '/assets/covers/typescript.svg', description: 'کدهای امن‌تر و قابل نگهداری‌تر با TypeScript و قراردادهای دقیق داده.', objectives: ['Typeها و interfaceها', 'Generic و Utility Type', 'مهاجرت پروژه React'], prerequisites: 'JavaScript و React مقدماتی', pathIds: ['path-frontend', 'path-fullstack'] }),
  course({ id: 'c-git', title: 'Git و GitHub برای تیم‌های حرفه‌ای', slug: 'git-github', category: 'مهندسی نرم‌افزار', level: 'مقدماتی', duration: '۸ ساعت', lessons: 17, rating: '۴.۹', students: 15600, price: 'رایگان', instructorId: 'ins-omid', cover: '/assets/covers/git.svg', description: 'مدیریت نسخه، branching، pull request و همکاری حرفه‌ای روی پروژه‌ها.', objectives: ['کار با Git در خط فرمان', 'ساخت workflow تیمی', 'انتشار پروژه روی GitHub'], prerequisites: 'آشنایی با فایل‌ها و ترمینال', pathIds: ['path-frontend', 'path-backend', 'path-fullstack'] }),
  course({ id: 'c-node', title: 'Node.js و Express؛ ساخت API', slug: 'node-express-api', category: 'بک‌اند', level: 'متوسط', duration: '۲۰ ساعت', lessons: 36, rating: '۴.۸', students: 7800, price: '۸۴۰ هزار تومان', instructorId: 'ins-kian', cover: '/assets/covers/node.svg', description: 'ساخت APIهای امن و قابل توسعه با Node.js، Express و معماری لایه‌ای.', objectives: ['ساخت REST API', 'اعتبارسنجی و middleware', 'مدیریت خطا و احراز هویت'], prerequisites: 'JavaScript مقدماتی', pathIds: ['path-backend', 'path-fullstack'] }),
  course({ id: 'c-sql', title: 'پایگاه داده و SQL کاربردی', slug: 'sql-databases', category: 'پایگاه داده', level: 'مقدماتی تا متوسط', duration: '۱۵ ساعت', lessons: 30, rating: '۴.۷', students: 6800, price: '۶۹۰ هزار تومان', instructorId: 'ins-kian', cover: '/assets/covers/sql.svg', description: 'طراحی جداول، query نویسی و ساخت مدل داده قابل اتکا برای محصول.', objectives: ['طراحی relational schema', 'نوشتن queryهای SQL', 'ایندکس و بهینه‌سازی'], prerequisites: 'مبانی برنامه‌نویسی', pathIds: ['path-backend', 'path-data', 'path-fullstack'] }),
  course({ id: 'c-cyber', title: 'مبانی امنیت سایبری و امنیت وب', slug: 'cybersecurity-fundamentals', category: 'امنیت سایبری', level: 'مقدماتی', duration: '۱۶ ساعت', lessons: 27, rating: '۴.۸', students: 5200, price: '۷۹۰ هزار تومان', instructorId: 'ins-leila', cover: '/assets/covers/cyber.svg', description: 'آشنایی کاربردی با تهدیدها، OWASP و راه‌های امن‌تر ساختن وب‌اپلیکیشن.', objectives: ['شناخت تهدیدهای رایج', 'بررسی OWASP Top 10', 'امن‌سازی ورودی و session'], prerequisites: 'مبانی وب و شبکه', pathIds: ['path-cyber'] }),
  course({ id: 'c-ai', title: 'مقدمه هوش مصنوعی برای توسعه‌دهندگان', slug: 'ai-for-developers', category: 'هوش مصنوعی', level: 'مقدماتی', duration: '۱۰ ساعت', lessons: 20, rating: '۴.۸', students: 6100, price: '۷۲۰ هزار تومان', instructorId: 'ins-arash', cover: '/assets/covers/ai.svg', description: 'مفاهیم اصلی AI و روش استفاده از مدل‌ها در پروژه‌های نرم‌افزاری.', objectives: ['درک مفاهیم AI', 'ساخت اولین پروژه هوشمند', 'آشنایی با مدل و داده'], prerequisites: 'پایتون مقدماتی', pathIds: ['path-ai', 'path-ml'] }),
  course({ id: 'c-ml', title: 'یادگیری ماشین با Python', slug: 'machine-learning-python', category: 'یادگیری ماشین', level: 'متوسط', duration: '۲۸ ساعت', lessons: 52, rating: '۴.۹', students: 7300, price: '۱,۱۹۰ هزار تومان', instructorId: 'ins-arash', cover: '/assets/covers/ml.svg', description: 'از آماده‌سازی داده تا آموزش، ارزیابی و انتشار مدل‌های یادگیری ماشین.', objectives: ['کار با Scikit-learn', 'ارزیابی مدل', 'ساخت پروژه پیش‌بینی'], prerequisites: 'پایتون و آمار مقدماتی', pathIds: ['path-ml', 'path-ai', 'path-data'] }),
  course({ id: 'c-data-python', title: 'تحلیل داده با Python و Pandas', slug: 'data-analysis-python', category: 'تحلیل داده', level: 'متوسط', duration: '۲۱ ساعت', lessons: 38, rating: '۴.۸', students: 8400, price: '۸۹۰ هزار تومان', instructorId: 'ins-nazanin', cover: '/assets/covers/data.svg', description: 'تمیزکاری، تحلیل و مصورسازی داده با Pandas، NumPy و Matplotlib.', objectives: ['تمیزکاری داده', 'تحلیل اکتشافی', 'ساخت گزارش تصویری'], prerequisites: 'پایتون مقدماتی', pathIds: ['path-data', 'path-ml'] }),
  course({ id: 'c-ds', title: 'مسیر کامل علم داده', slug: 'data-science-path', category: 'علم داده', level: 'متوسط تا پیشرفته', duration: '۳۲ ساعت', lessons: 60, rating: '۴.۷', students: 4100, price: '۱,۳۹۰ هزار تومان', instructorId: 'ins-arash', cover: '/assets/covers/datascience.svg', description: 'ترکیب آمار، داده و مدل‌سازی برای حل مسئله‌های واقعی کسب‌وکار.', objectives: ['طراحی پروژه داده', 'تحلیل آماری', 'ارائه insight به تیم'], prerequisites: 'پایتون و آمار مقدماتی', pathIds: ['path-data', 'path-ml'] }),
  course({ id: 'c-figma', title: 'طراحی رابط کاربری با Figma', slug: 'figma-ui-design', category: 'UI/UX و Figma', level: 'مقدماتی تا متوسط', duration: '۱۲ ساعت', lessons: 25, rating: '۴.۹', students: 8700, price: '۷۶۰ هزار تومان', instructorId: 'ins-sara', cover: '/assets/covers/figma.svg', description: 'از wireframe تا prototype و ساخت یک فایل طراحی حرفه‌ای در Figma.', objectives: ['ساخت wireframe', 'طراحی component', 'پروتوتایپ تعاملی'], prerequisites: 'بدون پیش‌نیاز', pathIds: ['path-uiux'] }),
  course({ id: 'c-ux', title: 'اصول تجربه کاربری و تحقیق کاربر', slug: 'ux-research', category: 'UI/UX و Figma', level: 'مقدماتی', duration: '۹ ساعت', lessons: 18, rating: '۴.۸', students: 5600, price: '۶۴۰ هزار تومان', instructorId: 'ins-sara', cover: '/assets/covers/ux.svg', description: 'شناخت کاربر، تعریف مسئله و تبدیل insight به تصمیم‌های طراحی.', objectives: ['مصاحبه کاربر', 'ساخت persona', 'تست کاربردپذیری'], prerequisites: 'علاقه به طراحی محصول', pathIds: ['path-uiux'] }),
  course({ id: 'c-powerbi', title: 'Power BI برای داشبوردهای مدیریتی', slug: 'power-bi-business-intelligence', category: 'هوش تجاری', level: 'مقدماتی تا متوسط', duration: '۱۷ ساعت', lessons: 31, rating: '۴.۷', students: 6200, price: '۸۲۰ هزار تومان', instructorId: 'ins-nazanin', cover: '/assets/covers/powerbi.svg', description: 'ساخت داشبوردهای تصمیم‌ساز با مدل داده، DAX و نمودارهای حرفه‌ای.', objectives: ['اتصال منابع داده', 'ساخت مدل داده', 'طراحی dashboard'], prerequisites: 'آشنایی عمومی با Excel', pathIds: ['path-powerbi', 'path-data'] }),
  course({ id: 'c-excel', title: 'Excel کاربردی برای کار و دانشگاه', slug: 'excel-practical', category: 'Excel', level: 'مقدماتی', duration: '۱۰ ساعت', lessons: 22, rating: '۴.۸', students: 11000, price: '۵۴۰ هزار تومان', instructorId: 'ins-nazanin', cover: '/assets/covers/excel.svg', description: 'فرمول‌ها، مرتب‌سازی، نمودار و گزارش‌سازی در Excel برای استفاده روزمره.', objectives: ['فرمول‌های کاربردی', 'تحلیل جدول‌ها', 'ساخت گزارش ساده'], prerequisites: 'آشنایی با کامپیوتر', pathIds: ['path-excel', 'path-powerbi', 'path-data'] }),
  course({ id: 'c-excel-advanced', title: 'Excel پیشرفته و تحلیل داده', slug: 'advanced-excel-data', category: 'Excel', level: 'متوسط تا پیشرفته', duration: '۱۵ ساعت', lessons: 29, rating: '۴.۷', students: 4800, price: '۷۹۰ هزار تومان', instructorId: 'ins-nazanin', cover: '/assets/covers/excel-advanced.svg', description: 'Power Query، Pivot Table و مدل‌سازی برای تحلیل داده‌های بزرگ‌تر.', objectives: ['Pivot Table حرفه‌ای', 'Power Query', 'داشبورد تعاملی'], prerequisites: 'Excel مقدماتی', pathIds: ['path-excel', 'path-powerbi'] }),
];

const makeSteps = (ids: string[], why: string, learn: string, prerequisite: string): PathStep[] => ids.map((courseId, index) => ({ courseId, why, learn, prerequisite, next: ids[index + 1] ?? 'آماده ورود به پروژه نهایی و بازار کار' }));

export const learningPaths: LearningPath[] = [
  { id: 'path-frontend', title: 'توسعه‌دهنده Frontend', description: 'از ساخت اولین صفحه تا توسعه رابط‌های مقیاس‌پذیر با React و TypeScript.', level: 'مقدماتی تا پیشرفته', duration: '۶ تا ۸ ماه', color: 'violet', icon: '⌘', steps: makeSteps(['c-programming', 'c-html-css', 'c-js', 'c-git', 'c-react', 'c-typescript'], 'برای ساخت مسیر منظم و جلوگیری از یادگیری پراکنده.', 'مفاهیم و ابزارهای کلیدی توسعه فرانت‌اند را با پروژه‌های واقعی تمرین می‌کنی.', 'با مرحله قبل مسیر یا آشنایی عمومی با کامپیوتر شروع کن.') },
  { id: 'path-backend', title: 'توسعه‌دهنده Backend', description: 'یادگیری API، پایگاه داده و اصول سرویس‌های قابل اتکا با Node.js.', level: 'مقدماتی تا متوسط', duration: '۵ تا ۷ ماه', color: 'cyan', icon: '◈', steps: makeSteps(['c-programming', 'c-js', 'c-sql', 'c-node', 'c-git'], 'بک‌اند خوب از منطق، داده و قراردادهای API ساخته می‌شود.', 'از JavaScript تا ساخت API امن و قابل انتشار پیش می‌روی.', 'مبانی برنامه‌نویسی و JavaScript مقدماتی.') },
  { id: 'path-fullstack', title: 'مسیر Full-Stack', description: 'ترکیب React و Node.js برای ساخت محصول از رابط تا API و داده.', level: 'متوسط', duration: '۸ تا ۱۰ ماه', color: 'emerald', icon: '◉', steps: makeSteps(['c-html-css', 'c-js', 'c-react', 'c-typescript', 'c-node', 'c-sql'], 'برای ساخت محصول کامل باید مرز بین UI، API و داده را بشناسی.', 'ساخت یک اپلیکیشن end-to-end را مرحله‌به‌مرحله انجام می‌دهی.', 'HTML، CSS و JavaScript.') },
  { id: 'path-cyber', title: 'امنیت سایبری', description: 'مبانی امنیت وب، تهدیدشناسی و ساخت نرم‌افزار امن.', level: 'مقدماتی تا متوسط', duration: '۴ تا ۶ ماه', color: 'rose', icon: '⌁', steps: makeSteps(['c-programming', 'c-html-css', 'c-cyber'], 'شناخت اصول قبل از ابزارهای امنیتی ضروری است.', 'تهدیدهای رایج و راه‌های کاهش ریسک را در سناریوهای واقعی می‌بینی.', 'مبانی برنامه‌نویسی و وب.') },
  { id: 'path-ai', title: 'هوش مصنوعی کاربردی', description: 'از Python و داده تا اولین پروژه‌های هوشمند.', level: 'متوسط', duration: '۶ تا ۹ ماه', color: 'amber', icon: '✦', steps: makeSteps(['c-python', 'c-data-python', 'c-ai', 'c-ml'], 'مدل خوب بدون داده تمیز و فهم مسئله نتیجه نمی‌دهد.', 'داده را آماده می‌کنی و مدل را برای یک مسئله واقعی ارزیابی می‌کنی.', 'پایتون مقدماتی و ریاضی پایه.') },
  { id: 'path-ml', title: 'یادگیری ماشین', description: 'ساخت، ارزیابی و توضیح مدل‌های یادگیری ماشین با Python.', level: 'متوسط تا پیشرفته', duration: '۷ تا ۱۰ ماه', color: 'violet', icon: '◎', steps: makeSteps(['c-python', 'c-data-python', 'c-ds', 'c-ml'], 'ترتیب صحیح یادگیری باعث می‌شود مدل‌ها را فقط اجرا نکنی، بلکه بفهمی.', 'تحلیل، ویژگی‌سازی و انتخاب مدل را با داده‌های واقعی تمرین می‌کنی.', 'پایتون، آمار و جبر پایه.') },
  { id: 'path-data', title: 'Data Science و تحلیل داده', description: 'تبدیل داده خام به insight قابل استفاده برای تصمیم‌گیری.', level: 'مقدماتی تا متوسط', duration: '۶ تا ۸ ماه', color: 'cyan', icon: '▦', steps: makeSteps(['c-excel', 'c-python', 'c-data-python', 'c-ds'], 'تحلیل‌گر خوب باید هم ابزار و هم زبان کسب‌وکار را بداند.', 'از جدول‌های ساده تا پروژه داده و گزارش تحلیلی پیش می‌روی.', 'Excel مقدماتی و مبانی برنامه‌نویسی.') },
  { id: 'path-uiux', title: 'طراحی UI/UX با Figma', description: 'حل مسئله کاربر و تبدیل آن به رابط کاربری قابل استفاده.', level: 'مقدماتی تا متوسط', duration: '۳ تا ۵ ماه', color: 'rose', icon: '◌', steps: makeSteps(['c-ux', 'c-figma'], 'قبل از زیبایی بصری باید مسئله و کاربر را درک کنی.', 'تحقیق، wireframe، component و prototype را می‌سازی.', 'بدون پیش‌نیاز؛ تمرین و مشاهده محصولات.') },
  { id: 'path-powerbi', title: 'هوش تجاری با Power BI', description: 'ساخت مدل داده و داشبورد مدیریتی برای تصمیم‌های بهتر.', level: 'مقدماتی تا متوسط', duration: '۳ تا ۵ ماه', color: 'amber', icon: '▥', steps: makeSteps(['c-excel', 'c-excel-advanced', 'c-powerbi'], 'داده تمیز و مدل درست پایه هر داشبورد قابل اعتماد است.', 'از آماده‌سازی داده تا روایت‌سازی با داشبورد پیش می‌روی.', 'Excel مقدماتی.') },
  { id: 'path-excel', title: 'Excel و مدیریت داده', description: 'مهارت‌های ضروری Excel از فرمول تا تحلیل پیشرفته.', level: 'مقدماتی تا پیشرفته', duration: '۲ تا ۴ ماه', color: 'emerald', icon: '▤', steps: makeSteps(['c-excel', 'c-excel-advanced'], 'Excel در بسیاری از نقش‌های فنی و مدیریتی ابزار روزمره است.', 'کار با داده، فرمول، Pivot و گزارش حرفه‌ای را یاد می‌گیری.', 'آشنایی با کامپیوتر.') },
];

export const initialUsers: User[] = [
  { id: 'u-student', name: 'سارا احمدی', email: 'student@coursefar.test', role: 'student', avatar: '/assets/instructors/sara.png', createdAt: '2026-08-01' },
  { id: 'u-instructor', name: 'آرش نوذری', email: 'instructor@coursefar.test', role: 'instructor', avatar: '/assets/instructors/arash.png', specialty: 'پایتون و یادگیری ماشین', createdAt: '2026-07-12' },
  { id: 'u-admin', name: 'مدیر Coursefar', email: 'admin@coursefar.test', role: 'admin', avatar: '/assets/instructors/omid.png', createdAt: '2026-06-10' },
];

export const initialEnrollments: Enrollment[] = [
  { id: 'enroll-1', userId: 'u-student', courseId: 'c-react', progress: 72, completedLessons: 12, enrolledAt: '2026-09-18' },
  { id: 'enroll-2', userId: 'u-student', courseId: 'c-figma', progress: 35, completedLessons: 5, enrolledAt: '2026-09-24' },
  { id: 'enroll-3', userId: 'u-student', courseId: 'c-powerbi', progress: 28, completedLessons: 4, enrolledAt: '2026-10-01' },
];
