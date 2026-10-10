import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
function loadTypeScript(file, replacements = []) {
  let source = readFileSync(new URL(file, import.meta.url), 'utf8');
  for (const [before, after] of replacements) source = source.replaceAll(before, after);
  const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}});
  const exports = {};
  new Function('require', 'exports', outputText)(require, exports);
  return exports;
}
const {createDemoSeed, createDemoService} = loadTypeScript('../src/demoStore.ts');
const {assetUrl, withAssetUrls} = loadTypeScript('../src/assets.ts', [['import.meta.env.BASE_URL', "'/coursefar/'"]]);
const seed = JSON.parse(readFileSync(new URL('../server/seed.json', import.meta.url), 'utf8'));
function harness() {
  let saved = null;
  let currentId = null;
  let failWrites = false;
  const persistence = {
    async load() {return structuredClone(saved);},
    async save(data) {if (failWrites) throw new Error('فضای ذخیره‌سازی کافی نیست'); saved = structuredClone(data);},
  };
  const session = {read: () => currentId, write: id => {currentId = id;}};
  let service = createDemoService(createDemoSeed(seed), persistence, session);
  return {
    call: (path, body, method = body ? 'POST' : 'GET') => service.request(path, {method, ...(body ? {body: JSON.stringify(body)} : {})}),
    refresh() {service = createDemoService(createDemoSeed(seed), persistence, session);},
    get saved() {return saved;},
    fail(value) {failWrites = value;},
  };
}
const login = (demo, role) => demo.call('/api/auth/login', {email: `${role}@coursefar.test`, password: 'demo'});

test('public catalog has connected courses, instructors and learning paths', async () => {
  const demo = harness();
  const data = await demo.call('/api/bootstrap');
  assert.equal(data.courses.length, 20);
  assert.equal(data.instructors.length, 8);
  assert.equal(data.paths.length, 10);
  assert.equal(data.user, null);
  assert.deepEqual(data.users, []);
  for (const course of data.courses) assert.ok(data.instructors.some(instructor => instructor.id === course.instructorId));
  for (const path of data.paths) for (const id of path.steps) assert.ok(data.courses.some(course => course.id === id));
});

test('new demo accounts have no photo or stored password, persist and keep separate progress', async () => {
  const demo = harness();
  const {user} = await demo.call('/api/auth/register', {name: 'دانشجوی آزمایشی', email: 'learner@example.test', role: 'student', password: 'never-store-this-password'});
  assert.equal(user.avatarUrl, null);
  assert.equal(user.avatar, null);
  const initial = await demo.call('/api/bootstrap');
  assert.equal(initial.user.id, user.id);
  assert.deepEqual(initial.enrollments, []);
  const course = initial.courses[0];
  const {enrollment} = await demo.call('/api/enrollments', {courseId: course.id});
  await demo.call(`/api/enrollments/${enrollment.id}/progress`, {lessonId: course.lessons[0].id, completed: true}, 'PATCH');
  await demo.call('/api/bookmarks', {courseId: course.id});
  demo.refresh();
  const restored = await demo.call('/api/bootstrap');
  assert.equal(restored.user.id, user.id);
  assert.deepEqual(restored.enrollments[0].completed, [course.lessons[0].id]);
  assert.deepEqual(restored.bookmarks, [course.id]);
  assert.equal(restored.courses.find(item => item.id === course.id).students, course.students + 1);
  assert.ok(!JSON.stringify(demo.saved).includes('never-store-this-password'));
  assert.ok(!Object.hasOwn(demo.saved.users.at(-1), 'password'));
  await demo.call('/api/auth/logout', {}, 'POST');
  await assert.rejects(demo.call('/api/auth/login', {email: user.email, password: 'never-store-this-password'}));
  await demo.call('/api/auth/login', {email: user.email, password: 'demo'});
  assert.equal((await demo.call('/api/bootstrap')).enrollments.length, 1);
  await demo.call('/api/bookmarks/' + course.id, undefined, 'DELETE');
  assert.deepEqual((await demo.call('/api/bootstrap')).bookmarks, []);
  await login(demo, 'student');
  assert.ok((await demo.call('/api/bootstrap')).enrollments.every(item => item.userId !== user.id));
});

test('instructor publication and enrollment are reflected in student, instructor and admin views', async () => {
  const demo = harness();
  const {user} = await demo.call('/api/auth/register', {name: 'مدرس آزمایشی', email: 'teacher@example.test', role: 'instructor'});
  assert.equal(user.avatarUrl, null);
  const {course} = await demo.call('/api/instructor/courses', {
    title: 'دوره تست انتشار در دمو', description: 'توضیح کامل دوره برای بررسی انتشار و ثبت نام در نسخه نمایشی.',
    category: 'پایتون', level: 'مقدماتی', duration: '۱۲ ساعت', priceValue: 0,
    prerequisites: 'آشنایی با کامپیوتر', objectives: ['تمرین مفاهیم اصلی', 'ساخت یک پروژه نمونه'], status: 'published', cover: '',
  });
  const catalog = await demo.call('/api/bootstrap');
  assert.ok(catalog.courses.some(item => item.id === course.id));
  assert.equal(course.instructorId, user.profileId);
  assert.ok(catalog.instructors.some(item => item.id === user.profileId));
  await login(demo, 'student');
  const {enrollment} = await demo.call('/api/enrollments', {courseId: course.id});
  assert.ok((await demo.call('/api/student/dashboard')).enrollments.some(item => item.id === enrollment.id));
  await demo.call('/api/auth/login', {email: user.email, password: 'demo'});
  const teacherView = await demo.call('/api/instructor/dashboard');
  assert.equal(teacherView.courses.find(item => item.id === course.id).students, 1);
  assert.equal(teacherView.submissions[0].id, enrollment.id);
  assert.equal(teacherView.submissions[0].student.email, 'student@coursefar.test');
  await login(demo, 'admin');
  const admin = await demo.call('/api/admin/overview');
  assert.equal(admin.stats.courses, 21);
  assert.ok(admin.users.some(item => item.id === user.id));
  assert.ok(admin.activities.some(item => item.actorId === user.id));
  await demo.call(`/api/admin/users/${user.id}`, {status: 'suspended'}, 'PATCH');
  await assert.rejects(demo.call('/api/auth/login', {email: user.email, password: 'demo'}), /تعلیق/);
});

test('validation, role boundaries and duplicate enrollment work in the simulation', async () => {
  const demo = harness();
  await assert.rejects(demo.call('/api/admin/overview'));
  await assert.rejects(demo.call('/api/auth/register', {name: 'مدیر', email: 'new-admin@example.test', role: 'admin'}));
  await assert.rejects(demo.call('/api/auth/register', {name: 'الف', email: 'invalid', role: 'student'}));
  await login(demo, 'student');
  await assert.rejects(demo.call('/api/admin/overview'));
  await assert.rejects(demo.call('/api/instructor/courses', {}));
  const data = await demo.call('/api/bootstrap');
  const existing = data.enrollments[0];
  assert.ok(existing);
  await assert.rejects(demo.call('/api/enrollments', {courseId: existing.courseId}), /قبلاً/);
  await assert.rejects(demo.call(`/api/enrollments/${existing.id}/progress`, {lessonId: 'missing', completed: true}, 'PATCH'));
  await assert.rejects(demo.call('/api/auth/register', {name: 'کاربر تکراری', email: 'STUDENT@COURSEFAR.TEST', role: 'student'}), /قبلاً/);
  await login(demo, 'instructor');
  await assert.rejects(demo.call(`/api/enrollments/${existing.id}/progress`, {lessonId: 'missing', completed: true}, 'PATCH'));
  await login(demo, 'admin');
  const admin = (await demo.call('/api/bootstrap')).user;
  await assert.rejects(demo.call(`/api/admin/users/${admin.id}`, {status: 'suspended'}, 'PATCH'));
});

test('failed storage writes report an error without losing the last saved state', async () => {
  const demo = harness();
  await login(demo, 'student');
  const before = await demo.call('/api/bootstrap');
  const course = before.courses.find(item => !before.enrollments.some(enrollment => enrollment.courseId === item.id));
  demo.fail(true);
  await assert.rejects(demo.call('/api/enrollments', {courseId: course.id}), /ذخیره/);
  assert.deepEqual(await demo.call('/api/bootstrap'), before);
  demo.fail(false);
  await demo.call('/api/enrollments', {courseId: course.id});
  assert.equal((await demo.call('/api/bootstrap')).enrollments.length, before.enrollments.length + 1);
});

test('unavailable storage still allows public browsing', async () => {
  const demo = createDemoService(createDemoSeed(seed), {
    load: async () => {throw new Error('Browser storage unavailable');},
    save: async () => {throw new Error('Browser storage unavailable');},
  }, {read: () => null, write: () => {}});
  assert.equal((await demo.request('/api/bootstrap')).courses.length, 20);
});

test('Pages prefixes nested project assets and preserves external, uploaded and null images', () => {
  assert.equal(assetUrl('/assets/instructors/arash.png'), '/coursefar/assets/instructors/arash.png');
  assert.equal(assetUrl('/assets/covers/html.svg', '/'), '/assets/covers/html.svg');
  assert.equal(assetUrl('/assets/covers/html.svg', '/another-repo/'), '/another-repo/assets/covers/html.svg');
  for (const url of [null, undefined, 'data:image/png;base64,example', 'blob:example', 'https://example.test/portrait.jpg']) assert.equal(assetUrl(url), url);
  const mapped = withAssetUrls({courses: [{cover: '/assets/covers/html.svg'}], user: {avatarUrl: '/assets/instructors/arash.png', avatar: null}, title: '/assets/is-not-an-image'});
  assert.equal(mapped.courses[0].cover, '/coursefar/assets/covers/html.svg');
  assert.equal(mapped.user.avatarUrl, '/coursefar/assets/instructors/arash.png');
  assert.equal(mapped.user.avatar, null);
  assert.equal(mapped.title, '/assets/is-not-an-image');
});
