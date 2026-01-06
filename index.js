const fs = require('fs')

const words = ["Unicorn", "Elephant", "Gorilla", "Lioness"];
const output = words.join('\n')
fs.writeFile('word.txt', output, fileWritten)
function fileWritten(){
    console.log('File written successfully!');
}
console.log('This is testing');