import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { build } from 'esbuild'
import path, { resolve } from 'path';
import fs from 'fs';
test('metafile', async () => {
  const result = await build({
    entryPoints: [path.resolve(__dirname,'./fixtures/index.ts')],
    metafile:true,
    write:false,
    bundle:true,
    target: 'es6',
    outfile: 'dist/bundle.js',
    plugins: [{
      name: 'xxx',
      setup(build){
        build.onResolve({filter:/.*/},args => {
          if(args.path === 'virtual'){
            return {
              path: `virtual?${Date.now()}`,
              namespace: 'virtual'
            }
          }
        })
        build.onLoad({filter:/.*/,namespace:'virtual'},args => {
          const idxPath = path.resolve(__dirname,'./lib.ts');
          return {
            contents: `export * from ${JSON.stringify(idxPath)} `,
            resolveDir: args.path,
            loader: 'js'
          }
        })
        build.onLoad({filter:/.*/}, args => {
          return {
            contents: fs.readFileSync(args.path, 'utf-8')
          }
        })
        
      }
    }]
  })
  for(const output of result.outputFiles){
    fs.writeFileSync(path.resolve('../dist/',output.path),output.text);
  }
  fs.writeFileSync(resolve(__dirname, `./meta-${Date.now()}.json`), JSON.stringify(result.metafile!, null, 2));
})
test.run();

export * from './lib'