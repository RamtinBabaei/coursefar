import type {Activity, Course, Enrollment, LearningPath, Role, Snapshot, User} from './types';
import {z} from 'zod';

export type DemoState = {
  version: 1;
  users: User[];
  instructors: User[];
  courses: Course[];
  paths: LearningPath[];
  enrollments: Enrollment[];
  bookmarks: Array<{userId: string; courseId: string}>;
  activity: Activity[];
  why: Record<string, string>;
};
export type DemoPersistence = {
  load: () => Promise<DemoState | null>;
  save: (state: DemoState) => Promise<void>;
};
export type DemoSession = {read: () => string | null; write: (id: string | null) => void};
export type DemoSeed = {
  profiles: Array<{id: string; name: string; avatar: string | null; specialty: string; bio: string; skills: string[]; portraitIndex?: number}>;
  users: Array<{id: string; name: string; email: string; role: string; avatar: string | null; createdAt: string}>;
  courses: unknown[];
  paths: LearningPath[];
  enrollments: Array<{id: string; userId: string; courseId: string; progress: number; enrolledAt: string}>;
  why: Record<string, string>;
};

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(180),
  role: z.enum(['student', 'instructor']),
});
const courseSchema = z.object({
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(20).max(1000),
  category: z.string().trim().min(2).max(80),
  level: z.string().trim().min(2).max(60),
  duration: z.string().trim().min(2).max(60),
  priceValue: z.number().int().min(0).max(100000000),
  prerequisites: z.string().trim().min(2).max(300),
  objectives: z.array(z.string().trim().min(3).max(180)).min(2).max(8),
  cover: z.string().max(700000).optional(),
  status: z.enum(['draft', 'published']).default('published'),
});
function validated<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error('اطلاعات واردشده معتبر نیست. نام، ایمیل و مشخصات فرم را بررسی کنید.');
  return result.data;
}

export function createDemoSeed(seed: DemoSeed): DemoState {
  const instructors: User[] = seed.profiles.map((profile, index) => ({
    ...profile, email: '', role: 'instructor', status: 'active',
    avatarUrl: profile.avatar, portraitIndex: profile.portraitIndex ?? index,
    profileId: profile.id, demo: true, createdAt: '2026-01-01',
  }));
  const users: User[] = seed.users.map(user => {
    const profile = user.role === 'instructor' ? instructors.find(item => item.name === user.name) : null;
    return {
      ...user, role: user.role as Role, status: 'active', avatarUrl: user.avatar,
      specialty: profile?.specialty ?? '', bio: profile?.bio ?? '', skills: profile?.skills ?? [],
      portraitIndex: profile?.portraitIndex ?? null, profileId: profile?.id ?? null, demo: true,
    };
  });
  const courses = structuredClone(seed.courses) as Course[];
  const enrollments = seed.enrollments.map(item => {
    const course = courses.find(value => value.id === item.courseId);
    if (course) course.students++;
    return {
      id: item.id, userId: item.userId, courseId: item.courseId, enrolledAt: item.enrolledAt,
      completed: course?.lessons.slice(0, Math.round(item.progress * course.lessons.length / 100)).map(lesson => lesson.id) ?? [],
    };
  });
  return {version: 1, users, instructors, courses, paths: structuredClone(seed.paths), enrollments, bookmarks: [], activity: [], why: {...seed.why}};
}

/** This is an openly accessible portfolio simulation, never an authentication backend. */
export function createDemoService(initial: DemoState, persistence: DemoPersistence, session: DemoSession) {
  let state = structuredClone(initial);
  let currentId = session.read();
  let queue: Promise<unknown> = Promise.resolve();
  const ready = persistence.load().then(saved => {if (saved?.version === 1) state = saved;}).catch(() => {
    // Browsing demo content still works; a failed write is reported to the user.
  });
  const currentUser = (data: DemoState) => data.users.find(user => user.id === currentId && user.status === 'active') ?? null;
  const requireUser = (data: DemoState, ...roles: Role[]) => {
    const user = currentUser(data);
    if (!user) throw new Error('برای این عملیات وارد یکی از حساب‌های نمایشی شوید.');
    if (roles.length && !roles.includes(user.role)) throw new Error('این بخش برای نقش انتخاب‌شده در دمو مجاز نیست.');
    return user;
  };
  const snapshot = (data: DemoState): Snapshot => {
    const user = currentUser(data);
    return {
      user, csrf: user ? `demo-${user.id}` : null,
      users: user?.role === 'admin' ? data.users : [], instructors: data.instructors,
      courses: data.courses.filter(course => course.status === 'published'), paths: data.paths,
      enrollments: data.enrollments.filter(item => item.userId === user?.id),
      bookmarks: data.bookmarks.filter(item => item.userId === user?.id).map(item => item.courseId),
      activity: user?.role === 'admin' ? data.activity : [], why: data.why,
    };
  };
  const activity = (data: DemoState, user: User, description: string) => {
    data.activity.unshift({id: crypto.randomUUID(), actorId: user.id, description, createdAt: new Date().toISOString()});
    data.activity = data.activity.slice(0, 100);
  };

  async function execute(path: string, options: RequestInit) {
    await ready;
    const method = (options.method ?? 'GET').toUpperCase();
    const body = typeof options.body === 'string' ? JSON.parse(options.body) as Record<string, unknown> : {};
    const data = structuredClone(state);
    let result: unknown;
    let changed = false;
    let nextId = currentId;
    if (path === '/api/health') return {ok: true, service: 'coursefar-pages-demo'};
    if (path === '/api/bootstrap') return structuredClone(snapshot(state));
    if (path === '/api/auth/login' && method === 'POST') {
      const user = data.users.find(item => item.email.toLowerCase() === String(body.email).trim().toLowerCase());
      if (!user || body.password !== 'demo') throw new Error('برای ورود نمایشی، ایمیل حساب دمو و رمز demo را وارد کنید.');
      if (user.status !== 'active') throw new Error('این حساب نمایشی تعلیق شده است.');
      nextId = user.id;
      result = {user, csrf: `demo-${user.id}`};
    } else if (path === '/api/auth/register' && method === 'POST') {
      // The demo ignores and never stores supplied passwords or hashes.
      const input = validated(registrationSchema, body);
      if (data.users.some(user => user.email.toLowerCase() === input.email.toLowerCase())) throw new Error('این ایمیل قبلاً در همین مرورگر ثبت شده است.');
      const id = crypto.randomUUID();
      const user: User = {
        id, ...input, email: input.email.toLowerCase(), avatar: null, avatarUrl: null,
        status: 'active', specialty: '', bio: '', skills: [], portraitIndex: null,
        profileId: input.role === 'instructor' ? `ins-${id}` : null,
        demo: true, createdAt: new Date().toISOString(),
      };
      data.users.push(user);
      if (user.profileId) data.instructors.push({...user, id: user.profileId});
      activity(data, user, 'یک حساب نمایشی ایجاد کرد');
      changed = true; nextId = id;
      result = {user, csrf: `demo-${id}`};
    } else if (path === '/api/auth/logout' && method === 'POST') {
      nextId = null; result = {ok: true};
    } else if (path === '/api/enrollments' && method === 'POST') {
      const user = requireUser(data, 'student');
      const course = data.courses.find(item => item.id === body.courseId && item.status === 'published');
      if (!course) throw new Error('دوره منتشرشده پیدا نشد.');
      if (data.enrollments.some(item => item.userId === user.id && item.courseId === course.id)) throw new Error('قبلاً در این دوره ثبت‌نام کرده‌اید.');
      const enrollment: Enrollment = {id: crypto.randomUUID(), userId: user.id, courseId: course.id, completed: [], enrolledAt: new Date().toISOString()};
      data.enrollments.push(enrollment); course.students++;
      activity(data, user, `در دوره «${course.title}» ثبت‌نام کرد`);
      changed = true; result = {enrollment};
    } else if (/^\/api\/enrollments\/[^/]+\/progress$/.test(path) && method === 'PATCH') {
      const user = requireUser(data, 'student');
      const enrollment = data.enrollments.find(item => item.id === path.split('/')[3] && item.userId === user.id);
      const course = data.courses.find(item => item.id === enrollment?.courseId);
      if (!enrollment || !course?.lessons.some(lesson => lesson.id === body.lessonId) || typeof body.completed !== 'boolean') throw new Error('درس یا ثبت‌نام معتبر پیدا نشد.');
      enrollment.completed = enrollment.completed.filter(id => id !== body.lessonId);
      if (body.completed) enrollment.completed.push(String(body.lessonId));
      changed = true; result = {enrollment};
    } else if ((path === '/api/bookmarks' && method === 'POST') || (path.startsWith('/api/bookmarks/') && method === 'DELETE')) {
      const user = requireUser(data);
      const courseId = method === 'POST' ? String(body.courseId) : path.split('/')[3];
      if (!data.courses.some(course => course.id === courseId)) throw new Error('دوره پیدا نشد.');
      data.bookmarks = data.bookmarks.filter(item => !(item.userId === user.id && item.courseId === courseId));
      if (method === 'POST') data.bookmarks.push({userId: user.id, courseId});
      changed = true; result = {ok: true};
    } else if (path === '/api/instructor/courses' && method === 'POST') {
      const user = requireUser(data, 'instructor');
      const input = validated(courseSchema, body);
      if (!user.profileId) throw new Error('پروفایل مدرس پیدا نشد.');
      const id = crypto.randomUUID();
      const course: Course = {
        ...input, id, slug: `demo-course-${id}`, instructorId: user.profileId,
        cover: input.cover || '/assets/covers/programming.svg', skills: input.objectives,
        pathIds: [], rating: 'جدید', students: 0, createdAt: new Date().toISOString(),
        lessons: input.objectives.map((objective, index) => ({id: `${id}-lesson-${index + 1}`, title: objective, content: input.description, duration: 20, preview: index === 0})),
      };
      data.courses.unshift(course); activity(data, user, `دوره «${course.title}» را ایجاد کرد`);
      changed = true; result = {course};
    } else if (path === '/api/student/dashboard') {
      const user = requireUser(data, 'student');
      result = {enrollments: data.enrollments.filter(item => item.userId === user.id).map(item => ({...item, course: data.courses.find(course => course.id === item.courseId)})), bookmarks: data.bookmarks.filter(item => item.userId === user.id).map(item => item.courseId), certificates: [], notifications: []};
    } else if (path === '/api/instructor/dashboard') {
      const user = requireUser(data, 'instructor');
      const courses = data.courses.filter(course => course.instructorId === user.profileId);
      const submissions = data.enrollments.filter(item => courses.some(course => course.id === item.courseId)).map(item => ({...item, courseTitle: courses.find(course => course.id === item.courseId)?.title, student: data.users.find(student => student.id === item.userId)}));
      result = {courses, submissions};
    } else if (path === '/api/admin/overview') {
      requireUser(data, 'admin');
      result = {stats: {
        students: data.users.filter(user => user.role === 'student').length,
        instructors: data.users.filter(user => user.role === 'instructor').length,
        courses: data.courses.filter(course => course.status === 'published').length,
        enrollments: data.enrollments.length,
      }, users: data.users, courses: data.courses, activities: data.activity};
    } else if (path.startsWith('/api/admin/users/') && method === 'PATCH') {
      const admin = requireUser(data, 'admin');
      const user = data.users.find(item => item.id === path.split('/')[4]);
      if (!user || !['active', 'suspended'].includes(String(body.status))) throw new Error('کاربر یا وضعیت معتبر نیست.');
      if (user.id === admin.id) throw new Error('حساب مدیر فعال را نمی‌توان تعلیق کرد.');
      user.status = body.status as User['status'];
      changed = true; result = {user};
    } else {
      throw new Error('این عملیات در نسخه نمایشی پشتیبانی نمی‌شود.');
    }
    // Commit only after persistence succeeds: storage failures do not fake a saved change.
    if (changed) {await persistence.save(data); state = data;}
    if (nextId !== currentId) {session.write(nextId); currentId = nextId;}
    return structuredClone(result);
  }
  return {
    request<T>(path: string, options: RequestInit = {}): Promise<T> {
      const task = queue.then(() => execute(path, options));
      queue = task.catch(() => undefined);
      return task as Promise<T>;
    },
  };
}
