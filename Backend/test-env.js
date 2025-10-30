import 'dotenv/config';

console.log('--- Starting Environment Test ---');
console.log('File is located in:', process.cwd());
console.log('My DATABASE_URL is:', process.env.DATABASE_URL);
console.log('My API KEY is:', process.env.DATA_GOV_API_KEY);
console.log('--- Test Finished ---');