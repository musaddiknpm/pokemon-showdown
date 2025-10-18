/*
* Pokemon Showdown
* Impulse UI Module
*/

const generateThemedTable = (title: string, headerRow: string[], dataRows: string[][]): string => {
	let output = `<div class="themed-table-container"><h3 class="themed-table-title">${title}</h3><table class="themed-table"><tr class="themed-table-header">`;
	headerRow.forEach(h => output += `<th>${h}</th>`);
	output += `</tr>`;
	dataRows.forEach(row => {
		output += `<tr class="themed-table-row">`;
		row.forEach(cell => output += `<td>${cell}</td>`);
		output += `</tr>`;
	});
	output += `</table></div>`;
	return output;
};

Impulse.generateThemedTable = generateThemedTable;

export const ImpulseUI = {
	table(config: { title?: string; headers?: string[]; rows: string[][]; className?: string }): string {
		const { headers, rows, className = '' } = config;
		if (!headers?.length) return this.contentTable(config);
		return generateThemedTable(config.title || '', headers, rows);
	},

	contentTable(config: { title?: string; rows: string[][]; className?: string }): string {
		const { title = '', rows, className = '' } = config;
		let output = `<div class="themed-table-container ${className}">`;
		if (title) output += `<h3 class="themed-table-title">${title}</h3>`;
		output += `<table class="themed-table">`;
		rows.forEach(row => {
			output += `<tr class="themed-table-row">`;
			row.forEach(cell => output += `<td>${cell}</td>`);
			output += `</tr>`;
		});
		output += `</table></div>`;
		return output;
	},

	page(title: string, content: string): string {
		return `<div class="themed-table-container"><h3 class="themed-table-title">${title}</h3>${content}</div>`;
	},

	infoBox(title: string, content: string): string {
		return `<div class="infobox"><h3>${title}</h3>${content}</div>`;
	},

	scrollable(content: string, maxHeight = '360px'): string {
		return `<div style="max-height: ${maxHeight}; overflow-y: auto;">${content}</div>`;
	},

	progressBar(params: { current: number; total: number; color?: string; bgColor?: string; showText?: boolean; height?: string }): string {
		const { current, total, showText = true, height = '20px' } = params;
		const percent = Math.min(100, Math.round((current / total) * 100));
		const color = params.color || '#2ecc71';
		const bgColor = params.bgColor || '#ecf0f1';

		let output = `<div style="background: ${bgColor}; border-radius: 4px; overflow: hidden; border: 1px solid #bdc3c7; position: relative; height: ${height};"><div style="width: ${percent}%; background: ${color}; height: 100%; transition: width 0.3s ease;"></div>`;

		if (showText) {
			const textColor = percent > 50 ? '#fff' : '#2c3e50';
			const shadow = percent > 50 ? 'text-shadow: 1px 1px 1px rgba(0,0,0,0.3);' : '';
			output += `<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: ${textColor}; ${shadow}">${current}/${total} (${percent}%)</div>`;
		}

		output += `</div>`;
		return output;
	},

	pagination(params: { commandString: string; currentPage: number; totalPages: number; totalResults: number; resultsPerPage: number; sortOptions?: { value: string; label: string }[] }): string {
		const { commandString, currentPage, totalPages, totalResults, resultsPerPage, sortOptions } = params;
		let output = `<div style="text-align: center; margin-top: 5px;">`;

		if (currentPage > 1) output += `<button name="send" value="${commandString}, page:${currentPage - 1}" style="margin-right: 5px;">&laquo; Previous</button>`;
		output += `<strong>Page ${currentPage} of ${totalPages}</strong>`;
		if ((currentPage * resultsPerPage) < totalResults) output += `<button name="send" value="${commandString}, page:${currentPage + 1}" style="margin-left: 5px;">Next &raquo;</button>`;

		if (sortOptions?.length) {
			output += `<div style="margin-top: 8px;"><strong style="font-size: 0.9em;">Sort by:</strong> `;
			sortOptions.forEach(opt => output += `<button name="send" value="${commandString}, sort:${opt.value}">${opt.label}</button> `);
			output += `</div>`;
		}

		output += `</div>`;
		return output;
	}
};

Impulse.UI = ImpulseUI;
