import { APP_BASE_HREF } from '@angular/common';
import { enableProdMode } from '@angular/core';
import { CommonEngine } from '@nguniversal/common/engine';
import { join } from 'path';
import 'zone.js/node';
import { AppServerModule } from './src/main.server';

// This uses the universal common engine to save us running a full express server
// based on https://github.com/angular/universal/blob/main/integration/common-engine/server.ts

enableProdMode();

const distFolder = join(process.cwd(), 'dist/angular-ssr-vercel/browser');
const commonEngine = new CommonEngine();

export function handle(req: any, res: any) {
  const now = Date.now();
  // ISR: extract original path and adjust url accordingly
  if (req.url) {
    const [path, search] = req.url.split('?');

    const params = new URLSearchParams(search);
    const pathname = params.get('__pathname');

    if (pathname) {
      params.delete('__pathname');
      req.url = pathname;
    }
  }

  commonEngine
    .render({
      bootstrap: AppServerModule,
      documentFilePath: join(distFolder, 'index.html'),
      url: `https://${req.headers.host || ''}${req.url}`,
      providers: [
        {
          provide: APP_BASE_HREF,
          useValue: req.url.split('/').slice(0, -1).join('/') || '/',
        },
      ],
    })
    .then((r) => {
      console.log('took', Date.now() - now, 'ms to render');
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(r);
    })
    .catch((err) => {
      console.log(err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    });
}
