const text = 'Test';
console.log(text);
console.log("Current Deno version", Deno.version.deno);

console.log("Current TypeScript version", Deno.version.typescript);
console.log("Current V8 version", Deno.version.v8);

const encoder = new TextEncoder();
const data = encoder.encode(text);

Deno.writeFile('message.txt', data).then(() => {
  console.log('Done');
});

