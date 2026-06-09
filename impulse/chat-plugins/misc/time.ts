type MultiZoneEntry = string | [string, string][];

// Countries with multiple timezones — each entry is [label, IANA timezone]
const MULTI_TIMEZONE_COUNTRIES: Record<string, MultiZoneEntry> = {
	'usa': [
		['Eastern (New York)', 'America/New_York'],
		['Central (Chicago)', 'America/Chicago'],
		['Mountain (Denver)', 'America/Denver'],
		['Pacific (Los Angeles)', 'America/Los_Angeles'],
		['Alaska', 'America/Anchorage'],
		['Hawaii', 'Pacific/Honolulu'],
	],
	'unitedstates': 'usa',
	'us': 'usa',
	'america': 'usa',
	'canada': [
		['Eastern (Toronto)', 'America/Toronto'],
		['Central (Winnipeg)', 'America/Winnipeg'],
		['Mountain (Edmonton)', 'America/Edmonton'],
		['Pacific (Vancouver)', 'America/Vancouver'],
		['Atlantic (Halifax)', 'America/Halifax'],
		['Newfoundland', 'America/St_Johns'],
	],
	'ca': 'canada',
	'australia': [
		['Eastern (Sydney/Melbourne)', 'Australia/Sydney'],
		['Central (Adelaide)', 'Australia/Adelaide'],
		['Western (Perth)', 'Australia/Perth'],
		['Queensland (Brisbane)', 'Australia/Brisbane'],
		['Northern Territory (Darwin)', 'Australia/Darwin'],
	],
	'au': 'australia',
	'russia': [
		['Moscow', 'Europe/Moscow'],
		['Yekaterinburg', 'Asia/Yekaterinburg'],
		['Omsk', 'Asia/Omsk'],
		['Krasnoyarsk', 'Asia/Krasnoyarsk'],
		['Irkutsk', 'Asia/Irkutsk'],
		['Yakutsk', 'Asia/Yakutsk'],
		['Vladivostok', 'Asia/Vladivostok'],
		['Kamchatka', 'Asia/Kamchatka'],
	],
	'ru': 'russia',
	'brazil': [
		['Brasília (São Paulo/Rio)', 'America/Sao_Paulo'],
		['Amazon (Manaus)', 'America/Manaus'],
		['Acre', 'America/Rio_Branco'],
		['Fernando de Noronha', 'America/Noronha'],
	],
	'br': 'brazil',
	'mexico': [
		['Central (Mexico City)', 'America/Mexico_City'],
		['Pacific (Mazatlán)', 'America/Mazatlan'],
		['Mountain (Chihuahua)', 'America/Chihuahua'],
		['Northwest (Tijuana)', 'America/Tijuana'],
	],
	'mx': 'mexico',
	'indonesia': [
		['Western (Jakarta)', 'Asia/Jakarta'],
		['Central (Makassar)', 'Asia/Makassar'],
		['Eastern (Jayapura)', 'Asia/Jayapura'],
	],
	'id': 'indonesia',
	'kazakhstan': [
		['West (Aktau)', 'Asia/Aqtau'],
		['East (Almaty)', 'Asia/Almaty'],
	],
	'kz': 'kazakhstan',
	'mongolia': [
		['Ulaanbaatar', 'Asia/Ulaanbaatar'],
		['Hovd', 'Asia/Hovd'],
	],
	'mn': 'mongolia',
	'chile': [
		['Santiago', 'America/Santiago'],
		['Easter Island', 'Pacific/Easter'],
	],
	'cl': 'chile',
	'spain': [
		['Madrid', 'Europe/Madrid'],
		['Canary Islands', 'Atlantic/Canary'],
	],
	'es': 'spain',
	'portugal': [
		['Lisbon', 'Europe/Lisbon'],
		['Azores', 'Atlantic/Azores'],
	],
	'pt': 'portugal',
	'newzealand': [
		['Auckland', 'Pacific/Auckland'],
		['Chatham Islands', 'Pacific/Chatham'],
	],
	'nz': 'newzealand',
	'ukraine': [
		['Kyiv', 'Europe/Kyiv'],
	],
	'ua': 'ukraine',
	'argentina': [
		['Buenos Aires', 'America/Argentina/Buenos_Aires'],
		['Mendoza', 'America/Argentina/Mendoza'],
		['Tucumán', 'America/Argentina/Tucuman'],
	],
	'ar': 'argentina',
};

// Single-timezone countries and city lookups
const SINGLE_TIMEZONES: Record<string, string> = {
	// Asia
	'india': 'Asia/Kolkata',
	'in': 'Asia/Kolkata',
	'china': 'Asia/Shanghai',
	'cn': 'Asia/Shanghai',
	'japan': 'Asia/Tokyo',
	'jp': 'Asia/Tokyo',
	'korea': 'Asia/Seoul',
	'southkorea': 'Asia/Seoul',
	'kr': 'Asia/Seoul',
	'pakistan': 'Asia/Karachi',
	'pk': 'Asia/Karachi',
	'bangladesh': 'Asia/Dhaka',
	'bd': 'Asia/Dhaka',
	'srilanka': 'Asia/Colombo',
	'lk': 'Asia/Colombo',
	'nepal': 'Asia/Kathmandu',
	'np': 'Asia/Kathmandu',
	'thailand': 'Asia/Bangkok',
	'th': 'Asia/Bangkok',
	'vietnam': 'Asia/Ho_Chi_Minh',
	'vn': 'Asia/Ho_Chi_Minh',
	'malaysia': 'Asia/Kuala_Lumpur',
	'my': 'Asia/Kuala_Lumpur',
	'singapore': 'Asia/Singapore',
	'sg': 'Asia/Singapore',
	'philippines': 'Asia/Manila',
	'ph': 'Asia/Manila',
	'uae': 'Asia/Dubai',
	'ae': 'Asia/Dubai',
	'saudiarabia': 'Asia/Riyadh',
	'sa': 'Asia/Riyadh',
	'israel': 'Asia/Jerusalem',
	'il': 'Asia/Jerusalem',
	'turkey': 'Europe/Istanbul',
	'tr': 'Europe/Istanbul',
	'iran': 'Asia/Tehran',
	'iraq': 'Asia/Baghdad',
	'afghanistan': 'Asia/Kabul',
	'af': 'Asia/Kabul',
	'myanmar': 'Asia/Rangoon',
	'mm': 'Asia/Rangoon',

	// Europe
	'uk': 'Europe/London',
	'unitedkingdom': 'Europe/London',
	'england': 'Europe/London',
	'gb': 'Europe/London',
	'france': 'Europe/Paris',
	'fr': 'Europe/Paris',
	'germany': 'Europe/Berlin',
	'de': 'Europe/Berlin',
	'italy': 'Europe/Rome',
	'it': 'Europe/Rome',
	'netherlands': 'Europe/Amsterdam',
	'nl': 'Europe/Amsterdam',
	'belgium': 'Europe/Brussels',
	'be': 'Europe/Brussels',
	'switzerland': 'Europe/Zurich',
	'ch': 'Europe/Zurich',
	'austria': 'Europe/Vienna',
	'at': 'Europe/Vienna',
	'sweden': 'Europe/Stockholm',
	'se': 'Europe/Stockholm',
	'norway': 'Europe/Oslo',
	'no': 'Europe/Oslo',
	'denmark': 'Europe/Copenhagen',
	'dk': 'Europe/Copenhagen',
	'finland': 'Europe/Helsinki',
	'fi': 'Europe/Helsinki',
	'poland': 'Europe/Warsaw',
	'pl': 'Europe/Warsaw',
	'greece': 'Europe/Athens',
	'gr': 'Europe/Athens',
	'romania': 'Europe/Bucharest',
	'ro': 'Europe/Bucharest',

	// Americas
	'colombia': 'America/Bogota',
	'co': 'America/Bogota',
	'peru': 'America/Lima',
	'pe': 'America/Lima',
	'venezuela': 'America/Caracas',
	've': 'America/Caracas',

	// Oceania
	'fiji': 'Pacific/Fiji',
	'fj': 'Pacific/Fiji',

	// Africa
	'southafrica': 'Africa/Johannesburg',
	'za': 'Africa/Johannesburg',
	'nigeria': 'Africa/Lagos',
	'ng': 'Africa/Lagos',
	'kenya': 'Africa/Nairobi',
	'ke': 'Africa/Nairobi',
	'egypt': 'Africa/Cairo',
	'eg': 'Africa/Cairo',
	'ghana': 'Africa/Accra',
	'gh': 'Africa/Accra',
	'ethiopia': 'Africa/Addis_Ababa',
	'et': 'Africa/Addis_Ababa',
	'tanzania': 'Africa/Dar_es_Salaam',
	'tz': 'Africa/Dar_es_Salaam',

	// Cities — Asia
	'mumbai': 'Asia/Kolkata',
	'delhi': 'Asia/Kolkata',
	'newdelhi': 'Asia/Kolkata',
	'bangalore': 'Asia/Kolkata',
	'bengaluru': 'Asia/Kolkata',
	'kolkata': 'Asia/Kolkata',
	'chennai': 'Asia/Kolkata',
	'hyderabad': 'Asia/Kolkata',
	'pune': 'Asia/Kolkata',
	'ahmedabad': 'Asia/Kolkata',
	'jaipur': 'Asia/Kolkata',
	'lucknow': 'Asia/Kolkata',
	'karachi': 'Asia/Karachi',
	'lahore': 'Asia/Karachi',
	'islamabad': 'Asia/Karachi',
	'dhaka': 'Asia/Dhaka',
	'kathmandu': 'Asia/Kathmandu',
	'colombo': 'Asia/Colombo',
	'kabul': 'Asia/Kabul',
	'tehran': 'Asia/Tehran',
	'baghdad': 'Asia/Baghdad',
	'dubai': 'Asia/Dubai',
	'abudhabi': 'Asia/Dubai',
	'riyadh': 'Asia/Riyadh',
	'jeddah': 'Asia/Riyadh',
	'doha': 'Asia/Qatar',
	'kuwaitcity': 'Asia/Kuwait',
	'muscat': 'Asia/Muscat',
	'beirut': 'Asia/Beirut',
	'damascus': 'Asia/Damascus',
	'amman': 'Asia/Amman',
	'jerusalem': 'Asia/Jerusalem',
	'telaviv': 'Asia/Jerusalem',
	'istanbul': 'Europe/Istanbul',
	'ankara': 'Europe/Istanbul',
	'tashkent': 'Asia/Tashkent',
	'almaty': 'Asia/Almaty',
	'bangkok': 'Asia/Bangkok',
	'hochiminhcity': 'Asia/Ho_Chi_Minh',
	'hanoi': 'Asia/Bangkok',
	'phnompenh': 'Asia/Phnom_Penh',
	'vientiane': 'Asia/Vientiane',
	'yangon': 'Asia/Rangoon',
	'jakarta': 'Asia/Jakarta',
	'bali': 'Asia/Makassar',
	'kualalumpur': 'Asia/Kuala_Lumpur',
	'singaporecity': 'Asia/Singapore',
	'manila': 'Asia/Manila',
	'cebu': 'Asia/Manila',
	'taipei': 'Asia/Taipei',
	'hongkong': 'Asia/Hong_Kong',
	'macau': 'Asia/Macau',
	'beijing': 'Asia/Shanghai',
	'shanghai': 'Asia/Shanghai',
	'guangzhou': 'Asia/Shanghai',
	'shenzhen': 'Asia/Shanghai',
	'chengdu': 'Asia/Shanghai',
	'wuhan': 'Asia/Shanghai',
	'tokyo': 'Asia/Tokyo',
	'osaka': 'Asia/Tokyo',
	'kyoto': 'Asia/Tokyo',
	'seoul': 'Asia/Seoul',
	'busan': 'Asia/Seoul',
	'ulaanbaatar': 'Asia/Ulaanbaatar',

	// Cities — Europe
	'london': 'Europe/London',
	'paris': 'Europe/Paris',
	'berlin': 'Europe/Berlin',
	'munich': 'Europe/Berlin',
	'frankfurt': 'Europe/Berlin',
	'hamburg': 'Europe/Berlin',
	'rome': 'Europe/Rome',
	'milan': 'Europe/Rome',
	'naples': 'Europe/Rome',
	'madrid': 'Europe/Madrid',
	'barcelona': 'Europe/Madrid',
	'lisbon': 'Europe/Lisbon',
	'amsterdam': 'Europe/Amsterdam',
	'brussels': 'Europe/Brussels',
	'zurich': 'Europe/Zurich',
	'geneva': 'Europe/Zurich',
	'bern': 'Europe/Zurich',
	'vienna': 'Europe/Vienna',
	'stockholm': 'Europe/Stockholm',
	'oslo': 'Europe/Oslo',
	'copenhagen': 'Europe/Copenhagen',
	'helsinki': 'Europe/Helsinki',
	'warsaw': 'Europe/Warsaw',
	'krakow': 'Europe/Warsaw',
	'moscow': 'Europe/Moscow',
	'saintpetersburg': 'Europe/Moscow',
	'stpetersburg': 'Europe/Moscow',
	'kyiv': 'Europe/Kyiv',
	'athens': 'Europe/Athens',
	'bucharest': 'Europe/Bucharest',
	'budapest': 'Europe/Budapest',
	'prague': 'Europe/Prague',
	'bratislava': 'Europe/Bratislava',
	'zagreb': 'Europe/Zagreb',
	'belgrade': 'Europe/Belgrade',
	'sofia': 'Europe/Sofia',
	'riga': 'Europe/Riga',
	'tallinn': 'Europe/Tallinn',
	'vilnius': 'Europe/Vilnius',
	'minsk': 'Europe/Minsk',
	'dublin': 'Europe/Dublin',
	'reykjavik': 'Atlantic/Reykjavik',

	// Cities — Americas
	'newyork': 'America/New_York',
	'newyorkcity': 'America/New_York',
	'nyc': 'America/New_York',
	'boston': 'America/New_York',
	'washingtondc': 'America/New_York',
	'washington': 'America/New_York',
	'miami': 'America/New_York',
	'orlando': 'America/New_York',
	'atlanta': 'America/New_York',
	'philadelphia': 'America/New_York',
	'detroit': 'America/Detroit',
	'chicago': 'America/Chicago',
	'houston': 'America/Chicago',
	'dallas': 'America/Chicago',
	'sanantonio': 'America/Chicago',
	'austin': 'America/Chicago',
	'minneapolis': 'America/Chicago',
	'kansascity': 'America/Chicago',
	'nashville': 'America/Chicago',
	'denver': 'America/Denver',
	'phoenix': 'America/Phoenix',
	'saltlakecity': 'America/Denver',
	'albuquerque': 'America/Denver',
	'losangeles': 'America/Los_Angeles',
	'la': 'America/Los_Angeles',
	'sanfrancisco': 'America/Los_Angeles',
	'sf': 'America/Los_Angeles',
	'seattle': 'America/Los_Angeles',
	'portland': 'America/Los_Angeles',
	'lasvegas': 'America/Los_Angeles',
	'sandiego': 'America/Los_Angeles',
	'anchorage': 'America/Anchorage',
	'honolulu': 'Pacific/Honolulu',
	'toronto': 'America/Toronto',
	'montreal': 'America/Toronto',
	'ottawa': 'America/Toronto',
	'vancouver': 'America/Vancouver',
	'calgary': 'America/Edmonton',
	'edmonton': 'America/Edmonton',
	'winnipeg': 'America/Winnipeg',
	'mexicocity': 'America/Mexico_City',
	'guadalajara': 'America/Mexico_City',
	'monterrey': 'America/Monterrey',
	'tijuana': 'America/Tijuana',
	'saopaulo': 'America/Sao_Paulo',
	'riodejaneiro': 'America/Sao_Paulo',
	'rio': 'America/Sao_Paulo',
	'brasilia': 'America/Sao_Paulo',
	'manaus': 'America/Manaus',
	'buenosaires': 'America/Argentina/Buenos_Aires',
	'bogota': 'America/Bogota',
	'lima': 'America/Lima',
	'santiago': 'America/Santiago',
	'caracas': 'America/Caracas',
	'quito': 'America/Guayaquil',
	'lapaz': 'America/La_Paz',
	'asuncion': 'America/Asuncion',
	'montevideo': 'America/Montevideo',
	'panamacity': 'America/Panama',
	'sanjose': 'America/Costa_Rica',
	'havana': 'America/Havana',
	'kingston': 'America/Jamaica',

	// Cities — Oceania
	'sydney': 'Australia/Sydney',
	'melbourne': 'Australia/Melbourne',
	'brisbane': 'Australia/Brisbane',
	'perth': 'Australia/Perth',
	'adelaide': 'Australia/Adelaide',
	'darwin': 'Australia/Darwin',
	'auckland': 'Pacific/Auckland',
	'wellington': 'Pacific/Auckland',
	'christchurch': 'Pacific/Auckland',

	// Cities — Africa
	'johannesburg': 'Africa/Johannesburg',
	'capetown': 'Africa/Johannesburg',
	'durban': 'Africa/Johannesburg',
	'lagos': 'Africa/Lagos',
	'abuja': 'Africa/Lagos',
	'nairobi': 'Africa/Nairobi',
	'cairo': 'Africa/Cairo',
	'accra': 'Africa/Accra',
	'addisababa': 'Africa/Addis_Ababa',
	'daressalaam': 'Africa/Dar_es_Salaam',
	'khartoum': 'Africa/Khartoum',
	'casablanca': 'Africa/Casablanca',
	'tunis': 'Africa/Tunis',
	'algiers': 'Africa/Algiers',
	'tripoli': 'Africa/Tripoli',
	'kampala': 'Africa/Kampala',
	'harare': 'Africa/Harare',
	'lusaka': 'Africa/Lusaka',
	'maputo': 'Africa/Maputo',
	'dakar': 'Africa/Dakar',
	'kinshasa': 'Africa/Kinshasa',
	'luanda': 'Africa/Luanda',
	'antananarivo': 'Indian/Antananarivo',
};

// US timezone abbreviations
const ABBREV_TIMEZONES: Record<string, string> = {
	'est': 'America/New_York',
	'eastern': 'America/New_York',
	'cst': 'America/Chicago',
	'central': 'America/Chicago',
	'mst': 'America/Denver',
	'mountain': 'America/Denver',
	'pst': 'America/Los_Angeles',
	'pacific': 'America/Los_Angeles',
	'akst': 'America/Anchorage',
	'alaska': 'America/Anchorage',
	'hst': 'Pacific/Honolulu',
	'hawaii': 'Pacific/Honolulu',
	'gmt': 'Etc/GMT',
	'utc': 'Etc/UTC',
};

function resolveMultiAlias(key: string): [string, string][] | null {
	let entry = MULTI_TIMEZONE_COUNTRIES[key];
	// Follow string aliases (e.g. 'us' -> 'usa')
	if (typeof entry === 'string') entry = MULTI_TIMEZONE_COUNTRIES[entry];
	return Array.isArray(entry) ? entry : null;
}

function parseUTCOffset(input: string): number | null {
	let str = input.replace(/\+$/, '').trim();
	const sign = str.startsWith('-') ? -1 : 1;
	str = str.replace(/^[+-]/, '');

	let hours = 0;
	let minutes = 0;

	if (str.includes(':')) {
		const parts = str.split(':');
		hours = parseInt(parts[0], 10);
		minutes = parseInt(parts[1] || '0', 10);
	} else if (str.includes('.')) {
		const f = parseFloat(str);
		hours = Math.floor(f);
		minutes = Math.round((f - hours) * 60);
	} else if (str.length > 2) {
		hours = parseInt(str.slice(0, -2), 10);
		minutes = parseInt(str.slice(-2), 10);
	} else {
		hours = parseInt(str, 10);
		minutes = 0;
	}

	if (isNaN(hours) || isNaN(minutes)) return null;
	if (Math.abs(hours) > 14 || minutes >= 60) return null;

	return sign * (hours * 60 + minutes);
}

function formatForTimezone(date: Date, timezone: string): string {
	return date.toLocaleString('en-US', {
		timeZone: timezone,
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
		timeZoneName: 'short',
	});
}

function formatForOffset(date: Date, offsetMinutes: number): string {
	const sign = offsetMinutes >= 0 ? '+' : '-';
	const absMinutes = Math.abs(offsetMinutes);
	const h = Math.floor(absMinutes / 60);
	const m = absMinutes % 60;
	const label = m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`;

	const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
	const shiftedDate = new Date(utcMs + offsetMinutes * 60000);

	const pad = (n: number) => String(n).padStart(2, '0');
	const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	let hours = shiftedDate.getUTCHours();
	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12 || 12;

	return (
		`${days[shiftedDate.getUTCDay()]}, ` +
		`${months[shiftedDate.getUTCMonth()]} ${shiftedDate.getUTCDate()}, ` +
		`${shiftedDate.getUTCFullYear()} ` +
		`${pad(hours)}:${pad(shiftedDate.getUTCMinutes())}:${pad(shiftedDate.getUTCSeconds())} ${ampm} ` +
		`(${label})`
	);
}

function toTitleCase(str: string): string {
	return str.replace(/\b\w/g, c => c.toUpperCase());
}

export const commands: Chat.ChatCommands = {
	time(target, room, user, connection, cmd, message) {
		if (!this.runBroadcast()) return;

		const query = target.trim();

		if (!query) {
			return this.sendReplyBox(`🕐 <b>Current UTC Time:</b> ${formatForOffset(new Date(), 0)}`);
		}

		const now = new Date();

		// UTC offset input: e.g. "5:30", "+5:30", "-8", "5:30+"
		if (/^[+-]?\d[\d:.]*\+?$/.test(query)) {
			const offsetMinutes = parseUTCOffset(query);
			if (offsetMinutes === null) {
				return this.errorReply(`Invalid UTC offset "${query}". Use formats like: 5:30, +5:30, -8, 5.5`);
			}
			const absMin = Math.abs(offsetMinutes);
			const sign = offsetMinutes >= 0 ? '+' : '-';
			const label = `UTC${sign}${Math.floor(absMin / 60)}${absMin % 60 ? ':' + String(absMin % 60).padStart(2, '0') : ''}`;
			return this.sendReplyBox(`🕐 <b>Current Time (${label}):</b> ${formatForOffset(now, offsetMinutes)}`);
		}

		// Option B Normalization: Remove all spaces for the backend dictionary lookup
		const lookupKey = query.toLowerCase().replace(/\s+/g, '');

		// Multi-timezone country (e.g. usa, canada, australia)
		const multiZones = resolveMultiAlias(lookupKey);
		if (multiZones) {
			const rows = multiZones.map(([label, tz]) => {
				try {
					return `<tr><td><b>${label}</b></td><td>${formatForTimezone(now, tz)}</td></tr>`;
				} catch (e) {
					return '';
				}
			}).filter(Boolean).join('');
			return this.sendReplyBox(
				`🕐 <b>Current Times in ${toTitleCase(query)}:</b><br>` +
				`<table style="border-collapse:collapse;margin-top:4px">${rows}</table>`
			);
		}

		// Abbreviation / timezone shorthand (EST, PST, etc.)
		if (ABBREV_TIMEZONES[lookupKey]) {
			const tz = ABBREV_TIMEZONES[lookupKey];
			return this.sendReplyBox(`🕐 <b>Current Time (${query.toUpperCase()}):</b> ${formatForTimezone(now, tz)}`);
		}

		// Single-timezone country or city lookup
		if (SINGLE_TIMEZONES[lookupKey]) {
			const tz = SINGLE_TIMEZONES[lookupKey];
			try {
				return this.sendReplyBox(`🕐 <b>Current Time in ${toTitleCase(query)}:</b> ${formatForTimezone(now, tz)}`);
			} catch (e) {
				return this.errorReply(`Error formatting time for "${query}".`);
			}
		}

		// Direct IANA timezone string (e.g. America/New_York)
		// We use the original 'query' here because IANA timezones do not contain spaces
		if (query.includes('/')) {
			try {
				return this.sendReplyBox(`🕐 <b>Current Time (${query}):</b> ${formatForTimezone(now, query)}`);
			} catch (e) {
				// fall through
			}
		}

		this.errorReply(`Unknown location "${query}". Try a country (india, usa), city (mumbai, tokyo, new york), or UTC offset (5:30, -8).`);
	},
	
	timehelp: [
		`/time [location|offset] - Shows the current time for a country, city, or UTC offset.`,
		`Examples: /time india | /time usa | /time mumbai | /time tokyo | /time new york | /time 5:30 | /time -8`,
		`Multi-timezone countries (usa, canada, australia, russia, brazil) show all zones.`,
		`Broadcastable with !time.`,
	],
};
