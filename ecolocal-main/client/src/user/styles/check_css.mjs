import fs from 'fs';

const css = fs.readFileSync('d:/Desktop/mern-ecommerce/client/src/user/styles/user.css', 'utf8');
const lines = css.split('\n');

let balance = 0;
lines.forEach((line, i) => {
    const trimmed = line.trim();
    const opens = (line.match(/\{/g) || []).length;
    const closes = (line.match(/\}/g) || []).length;
    
    if (balance === 0 && trimmed.includes(':') && !trimmed.startsWith('/*') && !trimmed.startsWith('@') && !trimmed.includes('{')) {
        console.log(`Error: Property outside block at line ${i + 1}: "${trimmed}"`);
    }
    
    balance += opens;
    balance -= closes;
});

if (balance > 0) {
    console.log(`Error: Unbalanced opening braces. Total: ${balance}`);
} else {
    console.log('Balance OK');
}
