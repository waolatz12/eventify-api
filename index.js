// const { error } = require('console');
const fs = require('fs');
const superagent = require('superagent');

const words = ['Unicorn', 'Elephant', 'Gorilla', 'Lioness'];
const output = words.join('\n');
function fileWritten() {
  console.log('File written successfully!');
}
fs.writeFile('word.txt', output, fileWritten);
console.log('This is testing');

const writeAFile = (file, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err) => {
      if (err) reject(err);
      resolve('success');
    });
  });
// const tours = JSON.parse(fs.readFileSync(`${__dirname}/word.txt`));

async function getDogData() {
  try {
    const breed = 'retriever';
    const res = await superagent.get(
      `https://dog.ceo/api/breed/${breed}/images/random`,
    );
    await writeAFile('dogImage.txt', res.body.message);
    console.log(res.body);
  } catch (error) {
    console.error('Error', error.message);
  }
}

getDogData();

async function getNewDogData() {
  try {
    fs.readFile('dogImage.txt', async (err, data) => {
      if (err) throw new Error('Could not read file');
      const breed = data.toString().split('/')[4];
    });
    const res = await superagent.get(
      `https://dog.ceo/api/breed/${breed}/images/random`,
    );
    await writeAFile('newDogImage.txt', res.body.message);
    console.log(res.body);
  } catch (err) {
    console.log('Error processing request', err.message);
  }
}

getNewDogData();
