import {Course, Enrollment, LearningPath, Snapshot, User, emptyData} from './types';

async function request<T>(path:string, options:RequestInit={}){
  const headers=new Headers(options.headers);
  if(options.body && !headers.has('content-type')) headers.set('content-type','application/json');
  const response=await fetch(path,{credentials:'include',...options,headers});
  const json=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(json.error??'درخواست با خطا روبه‌رو شد.');
  return json as T;
}
export const api={
  bootstrap:()=>request<Snapshot>('/api/bootstrap'),
  login:(email:string,password:string)=>request<{user:User;csrf:string}>('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})}),
  register:(payload:{name:string;email:string;password:string;role:'student'|'instructor'})=>request<{user:User;csrf:string}>('/api/auth/register',{method:'POST',body:JSON.stringify(payload)}),
  logout:(csrf:string)=>request<{ok:true}>('/api/auth/logout',{method:'POST',headers:{'x-csrf-token':csrf}}),
  course:(id:string)=>request<{course:Course}>(`/api/courses/${id}`),
  enroll:(courseId:string,csrf:string)=>request<{enrollment:Enrollment}>('/api/enrollments',{method:'POST',headers:{'x-csrf-token':csrf},body:JSON.stringify({courseId})}),
  progress:(id:string,lessonId:string,completed:boolean,csrf:string)=>request<{enrollment:Enrollment}>(`/api/enrollments/${id}/progress`,{method:'PATCH',headers:{'x-csrf-token':csrf},body:JSON.stringify({lessonId,completed})}),
  bookmark:(courseId:string,csrf:string,active:boolean)=>request<{ok:true}>(active?'/api/bookmarks':`/api/bookmarks/${courseId}`,{method:active?'POST':'DELETE',headers:{'x-csrf-token':csrf,...(active?{'content-type':'application/json'}:{})},...(active?{body:JSON.stringify({courseId})}:{})}),
  studentDashboard:()=>request<{enrollments:Array<Enrollment&{course:Course}>;bookmarks:string[]}>('/api/student/dashboard'),
  instructorDashboard:()=>request<{courses:Course[];submissions:Array<{id:string;courseTitle:string;student:{name:string;email:string}}>}>('/api/instructor/dashboard'),
  createCourse:(payload:unknown,csrf:string)=>request<{course:Course}>('/api/instructor/courses',{method:'POST',headers:{'x-csrf-token':csrf},body:JSON.stringify(payload)}),
  adminOverview:()=>request<{stats:Record<string,number>;users:User[];courses:Course[];activities:unknown[]}>('/api/admin/overview'),
  adminUser:(id:string,payload:unknown,csrf:string)=>request<{user:User}>(`/api/admin/users/${id}`,{method:'PATCH',headers:{'x-csrf-token':csrf},body:JSON.stringify(payload)}),
  profile:(avatar:string,csrf:string)=>request<{user:User}>(`/api/profile`,{method:'PATCH',headers:{'x-csrf-token':csrf},body:JSON.stringify({avatar})}),
};
export async function safeBootstrap(){try{return {...emptyData,...await api.bootstrap()};}catch{return emptyData;}}
