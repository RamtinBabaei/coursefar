import {useEffect,useRef,useState} from 'react';
import {Check,ImagePlus,LoaderCircle,Trash2,X} from 'lucide-react';
import type {User} from '../types';
import {avatarKeys,removeLocalAvatar,saveLocalAvatar,validateAvatarFile} from '../avatarStore';
import {UserAvatar} from './UserAvatar';

type Props={user:User;notify:(message:string)=>void};
export function ProfileSettings({user,notify}:Props) {
  const [selected,setSelected]=useState<File|null>(null);
  const [preview,setPreview]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [processing,setProcessing]=useState(false);
  const [error,setError]=useState('');
  const [status,setStatus]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const selectionVersion=useRef(0);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
  useEffect(()=>()=>{selectionVersion.current++;},[]);
  const choose=async(file?:File)=>{
    if(!file)return;
    const version=++selectionVersion.current;
    setProcessing(true);setError('');setStatus('در حال بررسی تصویر…');
    try {
      const valid=await validateAvatarFile(file);
      if(version!==selectionVersion.current)return;
      setSelected(valid);setPreview(URL.createObjectURL(valid));
      setStatus('پیش‌نمایش آماده است. برای ثبت تغییرات، ذخیره تصویر را بزنید.');
    }catch(e){if(version===selectionVersion.current){setError((e as Error).message);setStatus('');}}
    finally{if(version===selectionVersion.current)setProcessing(false);}
  };
  const cancel=()=>{selectionVersion.current++;setSelected(null);setPreview(null);setError('');setStatus('انتخاب تصویر لغو شد.');};
  const commit=async(remove=false)=>{
    if(!remove&&!selected)return;
    setBusy(true);setError('');
    try {
      const keys=avatarKeys(user.id,user.profileId);
      if(remove)await removeLocalAvatar(keys);else await saveLocalAvatar(keys,selected!);
      setSelected(null);setPreview(null);
      const message=remove?'تصویر پروفایل حذف شد.':'تصویر پروفایل ذخیره شد.';
      setStatus(message);notify(message);
    }catch(e){setError((e as Error).message);setStatus('');}finally{setBusy(false);}
  };
  return <section className="profile-settings panel" aria-labelledby="profile-settings-title">
    <div className="panel-heading profile-settings-heading"><div>
      <span className="eyebrow"><ImagePlus size={15}/>تنظیمات پروفایل</span><h2 id="profile-settings-title">تصویر پروفایل</h2>
      <p>تصویر فقط در همین مرورگر ذخیره می‌شود و بین دستگاه‌ها همگام نمی‌شود.</p>
    </div><UserAvatar user={user} size="xl" editable previewUrl={preview}/></div>
    <div className="profile-settings-actions">
      <input ref={input} type="file" className="avatar-file-input" aria-label="انتخاب فایل تصویر پروفایل" accept="image/jpeg,image/png,image/webp" disabled={busy||processing} onChange={event=>{void choose(event.target.files?.[0]);event.currentTarget.value='';}}/>
      <button className="primary-button upload-photo-button" type="button" onClick={()=>input.current?.click()} disabled={busy||processing}><ImagePlus size={17}/>{selected?'جایگزینی تصویر انتخابی':'آپلود یا جایگزینی تصویر'}</button>
      <button className="outline-button" type="button" onClick={()=>void commit(true)} disabled={busy||processing}><Trash2 size={16}/>حذف تصویر</button>
      {selected&&<><button className="primary-button" type="button" onClick={()=>void commit()} disabled={busy||processing}><Check size={16}/>ذخیره تصویر</button><button className="outline-button" type="button" onClick={cancel} disabled={busy||processing}><X size={16}/>لغو</button></>}
    </div>
    <p className="profile-settings-help">فرمت‌های مجاز: JPG، PNG و WebP · حداکثر حجم: ۲ مگابایت</p>
    <div className="avatar-status" role="status" aria-live="polite">{busy||processing?<><LoaderCircle className="spin" size={16}/>{busy?'در حال ذخیره تغییرات…':'در حال بررسی تصویر…'}</>:status}</div>
    {error&&<p className="avatar-error" role="alert">{error}</p>}
  </section>;
}
