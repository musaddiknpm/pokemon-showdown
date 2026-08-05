export const Table = (title: string, headerRow: string[], dataRows: string[][]): string => {
	let output = `<div class="themed-table-container" style="max-width: 100%; max-height: 380px; overflow-y: auto;">`;
	output += `<h3 class="themed-table-title">${title}</h3>`;
	output += `<table class="themed-table" style="width: 100%; border-collapse: collapse;">`;
	output += `<tr class="themed-table-header">`;
	for (const header of headerRow) { output += `<th>${header}</th>`; }
	output += `</tr>`;
	for (const row of dataRows) {
		output += `<tr class="themed-table-row">`;
		for (const cell of row) { output += `<td>${cell}</td>`; }
		output += `</tr>`;
	}
	output += `</table></div>`;
	return output;
};
