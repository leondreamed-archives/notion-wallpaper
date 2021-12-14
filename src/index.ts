import 'dotenv/config';
import { Client } from '@notionhq/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import puppeteer, { Protocol } from 'puppeteer';
import readlineSync from 'readline-sync';
import fs from 'fs';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Toronto');

const notionToken = process.env['NOTION_TOKEN'];
if (notionToken === undefined) {
	throw new Error('Notion token not found in environment.');
}

const notion = new Client({
	auth: notionToken,
});

const calendarBlockId = '4802aa93bdd64dc8aaf6d48fa2d76ca7';

(async () => {
	const scheduleTitle = dayjs().tz().format('MMM D');
	const scheduleResults = await notion.databases.query({
		database_id: calendarBlockId,
		filter: {
			property: 'title',
			title: {
				equals: scheduleTitle,
			},
		},
	});
	const schedulePage = scheduleResults.results[0];
	if (schedulePage === undefined) {
		throw new Error(`Page ${scheduleTitle} not found.`);
	}

	const hasCookiesSaved = fs.existsSync('cookies.json');
	console.info('Launching browser...');
	const browser = await puppeteer.launch({
		headless: hasCookiesSaved ? true : false,
	});

	const page = await browser.newPage();
	page.setViewport({
		height: 1440,
		width: 2560,
	});

	if (hasCookiesSaved) {
		const cookies = JSON.parse(
			fs.readFileSync('cookies.json').toString()
		) as Protocol.Network.Cookie[];
		console.info('Loading cookies...');
		await page.setCookie(...cookies);
	} else {
		await page.goto('https://notion.so/login');
		readlineSync.question("Press the enter key when you've logged in:");
		const cookies = await page.cookies();
		fs.writeFileSync('cookies.json', JSON.stringify(cookies));
	}

	console.info('Navigating to page...');
	await page.goto(schedulePage.url);
	console.info('Waiting for page finish loading...');
	await page.waitForNetworkIdle();
	console.info('Taking screenshot...');
	await page.screenshot({
		path: 'notion-page.png',
	});
	await browser.close();

	console.log('Screenshot taken!');
})();
