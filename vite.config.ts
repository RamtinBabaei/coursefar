import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react-swc';
export default defineConfig(({mode}) => ({base:mode==='pages'?'/coursefar/':'/',plugins:[react()],server:{proxy:{'/api':'http://127.0.0.1:3001'}}}));
