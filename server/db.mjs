import {mkdirSync,readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {hashPassword} from './security.mjs';
const root=dirname(fileURLToPath(import.meta.url));
mkdirSync(join(root,'data'),{recursive:true});
const db=new DatabaseSync(join(root,'data','coursefar.sqlite'));
export const roadmapWhy=JSON.parse(readFileSync(join(root,'seed.json'),'utf8')).why;
db.exec(`PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,role TEXT NOT NULL CHECK(role IN ('student','instructor','admin')),status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended')),avatar TEXT,specialty TEXT NOT NULL,bio TEXT NOT NULL,skills_json TEXT NOT NULL,portrait_index INTEGER,profile_id TEXT, demo INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,password_hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS instructors (id TEXT PRIMARY KEY,name TEXT NOT NULL,avatar TEXT,specialty TEXT NOT NULL,bio TEXT NOT NULL,skills_json TEXT NOT NULL,teaching_style TEXT NOT NULL,demo INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS courses (id TEXT PRIMARY KEY,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL,description TEXT NOT NULL,instructor_id TEXT NOT NULL REFERENCES instructors(id),category TEXT NOT NULL,level TEXT NOT NULL,duration TEXT NOT NULL,price_value INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),cover TEXT NOT NULL,objectives_json TEXT NOT NULL,skills_json TEXT NOT NULL,prerequisites TEXT NOT NULL,lessons_json TEXT NOT NULL,path_ids_json TEXT NOT NULL,rating TEXT NOT NULL,students INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS paths (id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL,level TEXT NOT NULL,duration TEXT NOT NULL,color TEXT NOT NULL,steps_json TEXT NOT NULL,icon TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS enrollments (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,completed_json TEXT NOT NULL DEFAULT '[]',enrolled_at TEXT NOT NULL,UNIQUE(user_id,course_id));
CREATE TABLE IF NOT EXISTS bookmarks (user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,course_id TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,PRIMARY KEY(user_id,course_id));
CREATE TABLE IF NOT EXISTS activities (id TEXT PRIMARY KEY,actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,description TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);`);

function migrateAvatarColumn(table, createSql, columns) {
 const avatarInfo=db.prepare(`PRAGMA table_info(${table})`).all().find(column=>column.name==='avatar');
 if(!avatarInfo?.notnull)return;
 const temporary=`${table}_avatar_migration`;
 db.exec(`PRAGMA foreign_keys=OFF; DROP TABLE IF EXISTS ${temporary}; BEGIN; ${createSql.replaceAll(table,temporary)}; INSERT INTO ${temporary} (${columns.join(',')}) SELECT ${columns.join(',')} FROM ${table}; DROP TABLE ${table}; ALTER TABLE ${temporary} RENAME TO ${table}; COMMIT; PRAGMA foreign_keys=ON;`);
}
const userColumns=['id','name','email','role','status','avatar','specialty','bio','skills_json','portrait_index','profile_id','demo','created_at','password_hash'];
const instructorColumns=['id','name','avatar','specialty','bio','skills_json','teaching_style','demo'];
migrateAvatarColumn('users',"CREATE TABLE users (id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT NOT NULL UNIQUE,role TEXT NOT NULL CHECK(role IN ('student','instructor','admin')),status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','suspended')),avatar TEXT,specialty TEXT NOT NULL,bio TEXT NOT NULL,skills_json TEXT NOT NULL,portrait_index INTEGER,profile_id TEXT, demo INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,password_hash TEXT NOT NULL)",userColumns);
migrateAvatarColumn('instructors',"CREATE TABLE instructors (id TEXT PRIMARY KEY,name TEXT NOT NULL,avatar TEXT,specialty TEXT NOT NULL,bio TEXT NOT NULL,skills_json TEXT NOT NULL,teaching_style TEXT NOT NULL,demo INTEGER NOT NULL DEFAULT 1)",instructorColumns);
// Migrate the HTML/CSS cover from the old SVG asset to the stable PNG cover.
db.prepare("UPDATE courses SET cover='/assets/covers/html-cover.png' WHERE id='c-html-css' AND cover='/assets/covers/html.svg'").run();
const count=Number(db.prepare('SELECT COUNT(*) AS count FROM users').get().count);
if(!count){await seed();}
function json(value){return JSON.stringify(value??[]);}
function now(){return new Date().toISOString();}
async function seed(){
 const seed=JSON.parse(readFileSync(join(root,'seed.json'),'utf8'));
 const addInstructor=db.prepare('INSERT INTO instructors(id,name,avatar,specialty,bio,skills_json,teaching_style,demo) VALUES(?,?,?,?,?,?,?,1)');
 for(const p of seed.profiles){addInstructor.run(p.id,p.name,p.avatar,p.specialty,p.bio,json(p.skills),p.teachingStyle);}
 const addUser=db.prepare('INSERT INTO users(id,name,email,role,status,avatar,specialty,bio,skills_json,portrait_index,profile_id,demo,created_at,password_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
 for(const u of seed.users){const profile=seed.profiles.find(p=>p.name===u.name);addUser.run(u.id,u.name,u.email,u.role,'active',u.avatar,u.specialty??profile?.specialty??'',profile?.bio??'Demo platform account.',json(profile?.skills??[]),profile?.portraitIndex??null,profile?.id??null,1,u.createdAt,await hashPassword('demo'));}
 const addCourse=db.prepare('INSERT INTO courses(id,slug,title,description,instructor_id,category,level,duration,price_value,status,cover,objectives_json,skills_json,prerequisites,lessons_json,path_ids_json,rating,students,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
 for(const c of seed.courses){addCourse.run(c.id,c.slug,c.title,c.description,c.instructorId,c.category,c.level,c.duration,c.priceValue,'published',c.cover,json(c.objectives),json(c.skills),c.prerequisites,json(c.lessons),json(c.pathIds),c.rating,c.students,c.createdAt);}
 const addPath=db.prepare('INSERT INTO paths(id,title,description,level,duration,color,steps_json,icon) VALUES(?,?,?,?,?,?,?,?)');
 for(const p of seed.paths){addPath.run(p.id,p.title,p.description,p.level,p.duration,p.color,json(p.steps),p.icon);}
 const addEnrollment=db.prepare('INSERT INTO enrollments(id,user_id,course_id,completed_json,enrolled_at) VALUES(?,?,?,?,?)');
 for(const e of seed.enrollments){const course=seed.courses.find(c=>c.id===e.courseId); const completed=course?course.lessons.slice(0,Math.max(0,Math.round(e.progress/100*course.lessons.length))).map(l=>l.id):[];addEnrollment.run(e.id,e.userId,e.courseId,json(completed),e.enrolledAt);db.prepare('UPDATE courses SET students=students+1 WHERE id=?').run(e.courseId);}
 for(const e of seed.enrollments){db.prepare('INSERT INTO activities(id,actor_id,description,created_at) VALUES(?,?,?,?)').run(`activity-${e.id}`,e.userId,'در یک دوره ثبت‌نام کرد',e.enrolledAt);}
}
export function query(sql,params=[]){return db.prepare(sql).all(...params);}
export function one(sql,params=[]){return db.prepare(sql).get(...params);}
export function run(sql,params=[]){return db.prepare(sql).run(...params);}
export function transaction(fn){db.exec('BEGIN');try{const result=fn();db.exec('COMMIT');return result;}catch(error){db.exec('ROLLBACK');throw error;}}
export function database(){return db;}
