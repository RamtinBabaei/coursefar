import {useEffect,useState} from 'react';
import {LoaderCircle,UserRound} from 'lucide-react';
import {getLocalAvatar,subscribeAvatarChanges} from '../avatarStore';

export type AvatarIdentity={id:string;name?:string;avatar?:string|null;avatarUrl?:string|null;profileId?:string|null};
type AvatarSize='xs'|'sm'|'md'|'lg'|'xl';
type Props={user?:AvatarIdentity|null;identityKeys?:string[];size?:AvatarSize;editable?:boolean;previewUrl?:string|null;className?:string;alt?:string};

export function UserAvatar({user,identityKeys=[],size='md',editable=false,previewUrl,className='',alt}:Props) {
  const keyString=[...new Set([user?.id,user?.profileId,...identityKeys].filter(Boolean))].join('|');
  const original=user?.avatarUrl!==undefined?user.avatarUrl:user?.avatar??null;
  const [view,setView]=useState<{src:string|null;loading:boolean;local:boolean}>({src:null,loading:true,local:false});
  const [failed,setFailed]=useState(false);
  const name=user?.name??'کاربر Coursefar';
  const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('');
  // Only the original Arash asset has a special focus; uploaded portraits use center.
  const arashOriginal=original?.split('?')[0]==='/assets/instructors/arash.png'&&!view.local&&!previewUrl;

  useEffect(()=>{
    let active=true;
    let version=0;
    let objectUrl:string|null=null;
    const keys=keyString?keyString.split('|'):[];
    const load=async()=>{
      const requestVersion=++version;
      let src=previewUrl??original;
      let local=false;
      if(!previewUrl) {
        try {
          const record=await getLocalAvatar(keys);
          if(!active||requestVersion!==version)return;
          if(record) {src=record.blob?URL.createObjectURL(record.blob):null;local=true;}
        } catch { /* Existing images/placeholders remain usable when storage is unavailable. */ }
      }
      if(!active||requestVersion!==version)return;
      if(objectUrl)URL.revokeObjectURL(objectUrl);
      objectUrl=local&&src?src:null;
      setFailed(false);
      setView({src,loading:false,local});
    };
    void load();
    const unsubscribe=subscribeAvatarChanges(changed=>{if(changed.some(key=>keys.includes(key)))void load();});
    return ()=>{active=false;version++;unsubscribe();if(objectUrl)URL.revokeObjectURL(objectUrl);};
  },[original,previewUrl,keyString]);

  const classes=['user-avatar',`user-avatar-${size}`,arashOriginal?'arash-nozari-avatar':'',editable?'user-avatar-editable':'',className].filter(Boolean).join(' ');
  return <span className={classes} role="img" aria-label={alt??`تصویر پروفایل ${name}`} aria-busy={view.loading} data-user-id={user?.id}>
    {view.loading?<LoaderCircle className="avatar-loader" size={16} aria-hidden="true"/>:view.src&&!failed?<img src={view.src} alt="" onError={()=>setFailed(true)} onLoad={()=>setFailed(false)}/>:<span className="avatar-placeholder" aria-hidden="true">{initials||<UserRound size={19}/>}</span>}
  </span>;
}
