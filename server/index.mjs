import {app} from './app.mjs';

const port = Number(process.env.PORT || 3001);

app.listen(port, '0.0.0.0', () => {
  console.log(`Coursefar API listening on port ${port}`);
});
