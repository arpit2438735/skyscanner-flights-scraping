module.exports = class SkyscannerSearch {
	async setDatepicker(page, wholeMonth, day, month, year) {
		if (wholeMonth !== false) {
			await page.click('[class*="FlightDatepicker"] li:nth-of-type(2) button');
			await page.click('button[class*="Monthselector_monthselector__wholeyear"]');
			console.log(`Selected the ${wholeMonth} month`);
		} else {
			var year = year || new Date().getFullYear();
			var month = month.toString().padStart(2, '0') || new Date().getMonth().toString().padStart(2, '0');

			if (year != new Date().getFullYear() || month != new Date().getMonth().toString().padStart(2, '0'))
				await page.select('select[name="months"]', `${year}-${month}`);

			await page.evaluate(day => {
				document.querySelectorAll('[class*="BpkCalendarDate_bpk-calendar-date"]:not([class*="BpkCalendarDate_bpk-calendar-date--outside"])')[(parseInt(day) - 1)].click(); // 16 Agosot
			}, day);
		}
		// await page.screenshot({ path: 'screen/datepicker.png' });
	};
}