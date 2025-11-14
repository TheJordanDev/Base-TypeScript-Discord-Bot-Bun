import { SQL } from 'bun';
const POSTGRES_URL : string | undefined = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
	process.exit(0);
}
(async () => {
	const pg = new SQL(POSTGRES_URL);
	const result = await pg`
		SELECT * FROM information_schema.tables WHERE table_schema = 'public';
	`;
	console.log(result);
})();

